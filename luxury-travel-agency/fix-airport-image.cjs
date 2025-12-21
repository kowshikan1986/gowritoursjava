const https = require('https');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

const imageUrl = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1600&q=80';

console.log('📥 Downloading luxury airport image...');

https.get(imageUrl, (res) => {
  const chunks = [];
  
  res.on('data', chunk => chunks.push(chunk));
  
  res.on('end', async () => {
    const buffer = Buffer.concat(chunks);
    
    if (buffer.length < 1000) {
      console.error('❌ Download failed');
      pool.end();
      return;
    }
    
    console.log(`✅ Downloaded ${buffer.length} bytes`);
    
    const base64Image = 'data:image/jpeg;base64,' + buffer.toString('base64');
    
    try {
      // First check current state
      const check = await pool.query(
        'SELECT name, slug, LENGTH(image) as img_len FROM categories WHERE slug = $1',
        ['airport-transfers']
      );
      console.log('\nBEFORE update:', check.rows[0]);
      
      // Update with image
      const result = await pool.query(
        `UPDATE categories 
         SET image = $1, updated_at = NOW() 
         WHERE slug = 'airport-transfers' 
         RETURNING name, slug, LENGTH(image) as img_len`,
        [base64Image]
      );
      
      console.log('\nAFTER update:', result.rows[0]);
      console.log('\n✅ Airport Transfers image updated successfully!');
      
      // Verify it stuck
      const verify = await pool.query(
        'SELECT name, LENGTH(image) as img_len FROM categories WHERE slug = $1',
        ['airport-transfers']
      );
      console.log('\nVERIFICATION:', verify.rows[0]);
      
      pool.end();
    } catch (err) {
      console.error('❌ Database error:', err.message);
      pool.end();
    }
  });
}).on('error', (err) => {
  console.error('❌ Download error:', err.message);
  pool.end();
});
