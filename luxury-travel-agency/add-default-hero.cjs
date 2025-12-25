const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function addDefaultHero() {
  try {
    console.log('\n🎨 Adding default hero banner...\n');
    
    // Check if any active banners exist
    const check = await pool.query('SELECT COUNT(*) FROM hero_banners WHERE is_active = true');
    const count = parseInt(check.rows[0].count);
    
    if (count > 0) {
      console.log(`✅ ${count} active hero banner(s) already exist. No need to add default.`);
      pool.end();
      return;
    }
    
    // Create default hero banner
    const result = await pool.query(
      `INSERT INTO hero_banners (id, title, subtitle, cta_text, cta_link, image, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, title, is_active`,
      [
        `hero-default-${Date.now()}`,
        'Extraordinary Journeys',
        "Discover the world's most exclusive destinations with personalized luxury travel experiences crafted to perfection for the discerning traveler.",
        'Explore Destinations',
        '/destinations',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2070&q=80',
        true
      ]
    );
    
    console.log(`✅ Created default hero banner: "${result.rows[0].title}"`);
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Active: ${result.rows[0].is_active}\n`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

addDefaultHero();
