const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function checkHero() {
  try {
    const result = await pool.query(
      'SELECT id, title, subtitle, image, is_active FROM hero_banners ORDER BY created_at DESC'
    );
    
    console.log('\n🎨 Hero Banners:\n');
    result.rows.forEach((banner, i) => {
      console.log(`${i + 1}. ${banner.title}`);
      console.log(`   Active: ${banner.is_active}`);
      
      if (banner.image) {
        if (banner.image.startsWith('data:')) {
          console.log(`   Image: Base64 encoded (${banner.image.length} chars)`);
        } else if (banner.image.startsWith('http')) {
          console.log(`   Image URL: ${banner.image}`);
        } else {
          console.log(`   Image: ${banner.image.substring(0, 100)}...`);
        }
      } else {
        console.log('   Image: No image');
      }
      console.log('');
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkHero();
