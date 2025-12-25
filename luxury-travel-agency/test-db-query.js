const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'gowritour',
  password: 'gowritourdb123',
  ssl: { rejectUnauthorized: false }
});

async function testQuery() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM categories');
    console.log('✅ Categories count:', result.rows[0].count);
    
    const cats = await pool.query('SELECT name, slug FROM categories LIMIT 5');
    console.log('📋 Sample categories:');
    cats.rows.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

testQuery();
