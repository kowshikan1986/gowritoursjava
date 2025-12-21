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
  SELECT 
    name,
    slug,
    parent_id,
    LENGTH(image) as image_length,
    CASE 
      WHEN image IS NULL THEN '❌ NULL'
      WHEN LENGTH(image) = 0 THEN '❌ EMPTY'
      WHEN image LIKE 'data:image%' THEN '✅ BASE64'
      WHEN image LIKE 'http%' THEN '🔗 URL'
      ELSE '❓ UNKNOWN'
    END as image_status
  FROM categories
  WHERE parent_id IS NULL
  ORDER BY sort_order, name
`).then(res => {
  console.log('\n📊 ROOT CATEGORIES IMAGE STATUS:\n');
  res.rows.forEach(cat => {
    console.log(`${cat.image_status} ${cat.name}`);
    console.log(`   Slug: ${cat.slug}`);
    console.log(`   Image length: ${cat.image_length || 0}\n`);
  });
  
  const withImages = res.rows.filter(r => r.image_length > 0).length;
  const total = res.rows.length;
  
  console.log(`\n📈 SUMMARY: ${withImages}/${total} root categories have images\n`);
  
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
