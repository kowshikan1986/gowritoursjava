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
  ORDER BY parent_id NULLS FIRST, sort_order, name
`).then(res => {
  console.log('\n📋 ALL CATEGORIES:\n');
  
  const roots = res.rows.filter(c => !c.parent_id);
  const children = res.rows.filter(c => c.parent_id);
  
  console.log('🌳 ROOT CATEGORIES (show in navigation):\n');
  roots.forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat.name} (slug: ${cat.slug})`);
    console.log(`   Visible: ${cat.visible}, Sort: ${cat.sort_order}\n`);
  });
  
  console.log(`\n📊 Total: ${roots.length} root categories, ${children.length} subcategories\n`);
  
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
