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
  SELECT id, name, slug, parent_id, visible, sort_order
  FROM categories
  WHERE parent_id IS NULL
  ORDER BY sort_order, name
`).then(res => {
  console.log('\n📋 ROOT CATEGORIES (shown in navigation):\n');
  res.rows.forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat.name}`);
    console.log(`   Slug: ${cat.slug}`);
    console.log(`   Visible: ${cat.visible}`);
    console.log(`   Sort Order: ${cat.sort_order}`);
    console.log('');
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
