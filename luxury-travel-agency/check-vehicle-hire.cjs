const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

pool.query(`
  SELECT id, name, slug
  FROM categories
  WHERE slug = 'vehicle-hire'
`).then(res => {
  if (res.rows.length > 0) {
    console.log('Vehicle Hire category:');
    console.log('  Name:', res.rows[0].name);
    console.log('  Slug:', res.rows[0].slug);
  } else {
    console.log('❌ vehicle-hire not found, checking all root categories...');
    return pool.query(`
      SELECT name, slug 
      FROM categories 
      WHERE parent_id IS NULL 
      ORDER BY name
    `);
  }
  pool.end();
}).then(res => {
  if (res && res.rows) {
    console.log('\nAll root categories:');
    res.rows.forEach(cat => {
      console.log(`  ${cat.name} (${cat.slug})`);
    });
    pool.end();
  }
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
