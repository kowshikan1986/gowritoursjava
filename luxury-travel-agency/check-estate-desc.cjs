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
  SELECT name, description
  FROM categories
  WHERE slug = 'estate-car'
`).then(res => {
  if (res.rows.length > 0) {
    console.log('Name:', res.rows[0].name);
    console.log('\nFull Description:');
    console.log(res.rows[0].description);
  }
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
