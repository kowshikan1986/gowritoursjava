import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function checkHeroBanners() {
  try {
    const result = await pool.query('SELECT id, title, subtitle, image, cta_text, is_active FROM hero_banners ORDER BY created_at DESC LIMIT 3');
    console.log('\n🎨 Hero Banners:');
    result.rows.forEach(banner => {
      console.log(`\nID: ${banner.id}`);
      console.log(`Title: ${banner.title}`);
      console.log(`Subtitle: ${banner.subtitle}`);
      console.log(`CTA: ${banner.cta_text}`);
      console.log(`Active: ${banner.is_active}`);
      console.log(`Image length: ${banner.image ? banner.image.length : 0} chars`);
      if (banner.image) {
        console.log(`Image preview: ${banner.image.substring(0, 50)}...`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkHeroBanners();
