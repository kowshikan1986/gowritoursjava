const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false,
});

async function deletePrivateTours() {
  try {
    console.log('🗑️  Deleting "Private Tours" from database...\n');
    
    const result = await pool.query(
      "DELETE FROM categories WHERE slug = 'private-tours' RETURNING *"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Deleted successfully!');
      console.log('   - Name:', result.rows[0].name);
      console.log('   - Slug:', result.rows[0].slug);
      console.log('   - ID:', result.rows[0].id);
    } else {
      console.log('⚠️  No category found with slug "private-tours"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

deletePrivateTours();
