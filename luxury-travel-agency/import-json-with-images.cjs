const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the JSON export file
const exportPath = path.join(__dirname, 'database_export_2025-12-28T13-46-17.json');
const dbPath = path.join(__dirname, 'data', 'database.json');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('📥 Reading JSON export...');
const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

// Function to download image
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || url.startsWith('data:') || url.startsWith('/uploads/')) {
      resolve(null); // Skip base64 or already local images
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(uploadsDir, filename);

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`/uploads/${filename}`);
        });
      } else {
        resolve(null);
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err.message);
      resolve(null);
    });
  });
}

// Function to generate filename from URL
function getFilenameFromUrl(url, index, prefix) {
  const ext = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
  const extension = ext ? ext[1] : 'jpg';
  return `${prefix}-${index}-${Date.now()}.${extension}`;
}

async function importWithImages() {
  const db = {
    categories: [],
    tours: [],
    hero_banners: [],
    logos: [],
    ads: []
  };

  console.log('\n📦 Processing categories with images...');
  
  // Process categories
  for (let i = 0; i < exportData.tables.categories.data.length; i++) {
    const cat = exportData.tables.categories.data[i];
    const newCat = { ...cat };

    if (cat.image && cat.image.startsWith('http')) {
      console.log(`  Downloading image for: ${cat.name}...`);
      const filename = getFilenameFromUrl(cat.image, i, 'category');
      const localPath = await downloadImage(cat.image, filename);
      if (localPath) {
        newCat.image = localPath;
        console.log(`    ✓ Saved to ${localPath}`);
      }
    }

    db.categories.push(newCat);
  }

  console.log('\n📦 Processing logos with images...');
  
  // Process logos
  for (let i = 0; i < exportData.tables.logos.data.length; i++) {
    const logo = exportData.tables.logos.data[i];
    const newLogo = { ...logo };

    if (logo.image && logo.image.startsWith('http')) {
      console.log(`  Downloading logo: ${logo.name}...`);
      const filename = getFilenameFromUrl(logo.image, i, 'logo');
      const localPath = await downloadImage(logo.image, filename);
      if (localPath) {
        newLogo.image = localPath;
        newLogo.image_url = localPath;
        console.log(`    ✓ Saved to ${localPath}`);
      }
    }

    db.logos.push(newLogo);
  }

  // Copy other data as-is
  db.tours = exportData.tables.tours.data;
  db.hero_banners = exportData.tables.hero_banners.data;
  db.ads = exportData.tables.ads.data;

  // Write to database.json
  console.log('\n💾 Updating database.json...');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  console.log('\n✅ Import Complete!');
  console.log(`\nSummary:`);
  console.log(`  - Categories: ${db.categories.length}`);
  console.log(`  - Tours: ${db.tours.length}`);
  console.log(`  - Hero Banners: ${db.hero_banners.length}`);
  console.log(`  - Logos: ${db.logos.length}`);
  console.log(`  - Ads: ${db.ads.length}`);
  console.log(`\n📁 Images saved to: ${uploadsDir}`);
}

// Run import
importWithImages().catch(console.error);
