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
  SELECT name, slug, LENGTH(image) as img_len
  FROM categories
  WHERE slug LIKE 'vehicle%'
`).then(res => {
  console.log('Vehicle categories:');
  res.rows.forEach(cat => {
    console.log(`  ${cat.name} (${cat.slug}) - Image: ${cat.img_len || 0} chars`);
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
