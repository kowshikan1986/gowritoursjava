const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

// Fix all three missing categories
pool.query(`
  UPDATE categories
  SET visible = true,
      sort_order = CASE slug
        WHEN 'airport-transfer' THEN 3
        WHEN 'vehicle-hire' THEN 5
        WHEN 'sri-lanka-tours' THEN 7
      END
  WHERE slug IN ('airport-transfer', 'vehicle-hire', 'sri-lanka-tours')
  RETURNING name, slug, visible, sort_order
`).then(res => {
  console.log('\n✅ Updated categories:\n');
  res.rows.forEach(cat => {
    console.log(`${cat.name} (${cat.slug})`);
    console.log(`  Visible: ${cat.visible}, Sort: ${cat.sort_order}\n`);
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
