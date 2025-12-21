const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

// Royalty-free vehicle images from Unsplash
const vehicles = [
  { 
    name: 'MPV+', 
    description: 'Multi-Purpose Vehicles offering extra space and comfort for families and small groups.',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80'
  },
  { 
    name: '8 Seater', 
    description: 'Spacious 8-seater vehicles perfect for family trips and small group travel.',
    imageUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
  },
  { 
    name: '16 Seater', 
    description: '16-seater minibuses ideal for medium-sized groups and corporate travel.',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80'
  },
  { 
    name: '23 Seater', 
    description: 'Comfortable 23-seater coaches for group tours and events.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'
  },
  { 
    name: '33 Seater', 
    description: 'Large 33-seater coaches with ample luggage space for extended tours.',
    imageUrl: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=800&q=80'
  },
  { 
    name: '51 Seater', 
    description: 'Premium 51-seater coaches equipped with modern amenities for long-distance travel.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'
  },
  { 
    name: '83 Seater', 
    description: 'Double-decker 83-seater coaches for large group tours and events.',
    imageUrl: 'https://images.unsplash.com/photo-1581836440420-c3c01941807a?w=800&q=80'
  }
];

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        resolve(base64);
      });
      response.on('error', reject);
    });
  });
}

async function createVehicleCategories() {
  try {
    // Find Vehicle Hire category
    const vehicleHireResult = await pool.query(
      "SELECT id FROM categories WHERE slug = 'vehicle-hire' AND parent_id IS NULL"
    );
    
    if (vehicleHireResult.rows.length === 0) {
      console.log('❌ Vehicle Hire category not found!');
      return;
    }
    
    const vehicleHireId = vehicleHireResult.rows[0].id;
    console.log('✅ Found Vehicle Hire category:', vehicleHireId);
    
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      console.log(`\n📥 Downloading image for ${vehicle.name}...`);
      
      const imageBase64 = await downloadImage(vehicle.imageUrl);
      console.log(`✅ Downloaded (${Math.round(imageBase64.length / 1024)}KB)`);
      
      const slug = vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      await pool.query(
        `INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image`,
        [
          Date.now() + '-' + slug,
          vehicle.name,
          slug,
          vehicle.description,
          imageBase64,
          vehicleHireId,
          true,
          i + 1
        ]
      );
      
      console.log(`✅ Created: ${vehicle.name}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 All vehicle categories created!');
    console.log('📝 Check admin panel and /service/vehicle-hire page.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createVehicleCategories();
