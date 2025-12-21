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
  SELECT c1.name as root, c1.slug as root_slug,
         c2.name as l1, c2.slug as l1_slug,
         COUNT(c3.id) as grandchildren_count
  FROM categories c1
  LEFT JOIN categories c2 ON c2.parent_id = c1.id
  LEFT JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c1.parent_id IS NULL AND c1.slug LIKE '%airport%'
  GROUP BY c1.id, c1.name, c1.slug, c2.id, c2.name, c2.slug
  ORDER BY c2.sort_order, c2.name
`).then(res => {
  console.log('Airport Transfer structure:');
  res.rows.forEach(row => {
    console.log(`${row.root} (${row.root_slug})`);
    if (row.l1) {
      console.log(`  └─ ${row.l1} (${row.l1_slug}) - ${row.grandchildren_count} grandchildren`);
    }
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
