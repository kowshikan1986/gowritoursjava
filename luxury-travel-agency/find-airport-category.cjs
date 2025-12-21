const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

// Check both slugs
pool.query(`
  SELECT id, name, slug, parent_id
  FROM categories
  WHERE slug IN ('airport-transfers', 'airport-cab')
`).then(res => {
  console.log('\n🔍 Airport categories found:\n');
  res.rows.forEach(cat => {
    console.log(`Name: ${cat.name}`);
    console.log(`Slug: ${cat.slug}`);
    console.log(`ID: ${cat.id}`);
    console.log(`Parent: ${cat.parent_id}\n`);
  });
  
  if (res.rows.length === 0) {
    console.log('❌ No airport category found!');
  }
  
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
