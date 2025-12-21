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
  UPDATE categories
  SET visible = true, sort_order = 3
  WHERE slug = 'airport-cab'
  RETURNING name, slug, visible, sort_order
`).then(res => {
  console.log('✅ Updated Airport Cab:', res.rows[0]);
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err.message);
  pool.end();
});
