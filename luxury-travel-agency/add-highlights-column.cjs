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
  ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS highlights TEXT
`).then(() => {
  console.log('✅ Added highlights column to categories table');
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err.message);
  pool.end();
});
