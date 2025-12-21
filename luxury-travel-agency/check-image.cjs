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
  SELECT name, slug, 
         LENGTH(image) as image_length,
         SUBSTRING(image, 1, 100) as image_start
  FROM categories 
  WHERE slug = 'airport-transfers'
`).then(res => {
  const cat = res.rows[0];
  console.log('✈️ Airport Transfers:');
  console.log('  Name:', cat.name);
  console.log('  Image length:', cat.image_length);
  console.log('  Image start:', cat.image_start);
  
  // Check if it's a valid base64 image
  if (cat.image_start && cat.image_start.startsWith('data:image')) {
    console.log('  ✅ Valid base64 image format');
  } else {
    console.log('  ❌ Invalid image format');
  }
  
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
