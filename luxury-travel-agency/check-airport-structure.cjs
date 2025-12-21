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
  SELECT c1.id as parent_id, c1.name as parent_name, c1.slug as parent_slug,
         c2.id as child_id, c2.name as child_name, c2.slug as child_slug
  FROM categories c1
  LEFT JOIN categories c2 ON c2.parent_id = c1.id
  WHERE c1.slug = 'airport-transfer'
  ORDER BY c2.sort_order, c2.name
`).then(res => {
  console.log('Airport Transfer structure:');
  console.log('Parent:', res.rows[0]?.parent_name, '(', res.rows[0]?.parent_slug, ')');
  console.log('\nSubcategories:');
  res.rows.forEach(row => {
    if (row.child_name) {
      console.log(`  - ${row.child_name} (${row.child_slug})`);
    }
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
