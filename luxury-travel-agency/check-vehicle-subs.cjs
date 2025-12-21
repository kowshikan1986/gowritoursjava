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
  SELECT id, name, slug, description
  FROM categories
  WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'vehicle-hire')
  ORDER BY sort_order, name
`).then(res => {
  console.log('Vehicle Hire Subcategories:');
  res.rows.forEach(cat => {
    console.log(`\n${cat.name} (${cat.slug})`);
    console.log(`  Description: ${cat.description?.substring(0, 80)}...`);
  });
  console.log(`\nTotal: ${res.rows.length} subcategories`);
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
