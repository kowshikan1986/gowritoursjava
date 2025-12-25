const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false,
});

async function checkPrivateTours() {
  try {
    const result = await pool.query(
      "SELECT id, name, slug, parent_id FROM categories WHERE slug = 'private-tours'"
    );
    
    console.log('\n🔍 Categories with slug "private-tours":');
    console.log(result.rows);
    
    if (result.rows.length > 0) {
      console.log('\n⚠️  "private-tours" already exists!');
      console.log('   - ID:', result.rows[0].id);
      console.log('   - Name:', result.rows[0].name);
      console.log('   - Parent ID:', result.rows[0].parent_id || 'None (root category)');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPrivateTours();
