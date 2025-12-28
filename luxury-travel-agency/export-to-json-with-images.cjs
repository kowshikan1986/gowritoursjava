const fs = require('fs');
const path = require('path');

// Read current database.json
const dbPath = path.join(__dirname, 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Generate timestamp for filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputPath = path.join(__dirname, `database_export_${timestamp}.json`);

// Create export object with all data including images
const exportData = {
  exportDate: new Date().toISOString(),
  database: "gowritour",
  tables: {
    categories: {
      rowCount: db.categories.length,
      data: db.categories
    },
    tours: {
      rowCount: db.tours.length,
      data: db.tours
    },
    hero_banners: {
      rowCount: db.hero_banners.length,
      data: db.hero_banners
    },
    logos: {
      rowCount: db.logos.length,
      data: db.logos
    },
    ads: {
      rowCount: db.ads.length,
      data: db.ads
    }
  }
};

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');

console.log('\n✅ JSON Export Successful (with images)!');
console.log(`\nFile: ${outputPath}`);
console.log(`\nExported Data:`);
console.log(`  - Categories: ${db.categories.length} (including all images)`);
console.log(`  - Tours: ${db.tours.length}`);
console.log(`  - Hero Banners: ${db.hero_banners.length}`);
console.log(`  - Logos: ${db.logos.length} (including images)`);
console.log(`  - Ads: ${db.ads.length}`);
console.log(`\nTotal records: ${db.categories.length + db.tours.length + db.hero_banners.length + db.logos.length + db.ads.length}`);

// Count items with images
const categoriesWithImages = db.categories.filter(c => c.image && c.image !== '').length;
const logosWithImages = db.logos.filter(l => l.image || l.image_url).length;

console.log(`\nImage Data:`);
console.log(`  - Categories with images: ${categoriesWithImages}/${db.categories.length}`);
console.log(`  - Logos with images: ${logosWithImages}/${db.logos.length}`);
