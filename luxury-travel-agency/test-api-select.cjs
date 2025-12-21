const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

console.log('Testing API endpoint simulation...\n');

pool.query('SELECT * FROM categories WHERE slug = $1', ['airport-transfers'])
  .then(result => {
    if (result.rows.length === 0) {
      console.log('❌ No category found');
    } else {
      const cat = result.rows[0];
      console.log('✅ Category found:', cat.name);
      console.log('   ID:', cat.id);
      console.log('   Slug:', cat.slug);
      console.log('   Description:', cat.description?.substring(0, 50));
      console.log('   Image length:', cat.image?.length || 0);
      console.log('   Image start:', cat.image?.substring(0, 80));
      console.log('   Parent ID:', cat.parent_id);
      console.log('   Visible:', cat.visible);
      
      if (cat.image && cat.image.length > 0) {
        console.log('\n✅ Image data IS in the database');
      } else {
        console.log('\n❌ Image data is NULL or empty');
      }
    }
    pool.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    pool.end();
  });
