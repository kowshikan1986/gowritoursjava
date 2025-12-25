const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function checkAirports() {
  try {
    // Get airport-transfer parent
    const parentResult = await pool.query(
      "SELECT id FROM categories WHERE slug = 'airport-transfer'"
    );
    const parentId = parentResult.rows[0].id;
    
    // Get all subcategories
    const result = await pool.query(
      'SELECT name, slug, sort_order FROM categories WHERE parent_id = $1 ORDER BY sort_order',
      [parentId]
    );
    
    console.log('\n📋 Current Airport Transfer Subcategories:\n');
    result.rows.forEach(row => {
      console.log(`  ${row.sort_order || '-'}. ${row.name} (${row.slug})`);
    });
    console.log('');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

checkAirports();
