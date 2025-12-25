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
  SELECT id, name, slug, parent_id, visible
  FROM categories
  WHERE slug = 'other-services' OR parent_id IN (SELECT id FROM categories WHERE slug = 'other-services')
  ORDER BY parent_id, sort_order, name
`).then(res => {
  console.log('Other Services Category and Subcategories:');
  console.log(JSON.stringify(res.rows, null, 2));
  console.log(`\nTotal: ${res.rows.length} categories`);
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
