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
  SET visible = true
  WHERE slug = 'other-services'
  RETURNING id, name, slug, visible
`).then(res => {
  console.log('✅ Updated Other Services category:');
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err.message);
  pool.end();
});
