const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function deleteLondonAirports() {
  try {
    console.log('\n🗑️  Deleting "London Airports (LHR, LGW, LTN, STN, LCY)" subcategory...\n');
    
    // First, check if it exists
    const checkResult = await pool.query(
      "SELECT id, name, slug, parent_id FROM categories WHERE name = 'London Airports (LHR, LGW, LTN, STN, LCY)'"
    );
    
    if (checkResult.rows.length === 0) {
      console.log('⚠️  Category "London Airports (LHR, LGW, LTN, STN, LCY)" not found in database.');
      pool.end();
      return;
    }
    
    console.log('Found category:', checkResult.rows[0]);
    
    // Delete the category
    const deleteResult = await pool.query(
      "DELETE FROM categories WHERE name = 'London Airports (LHR, LGW, LTN, STN, LCY)' RETURNING *"
    );
    
    if (deleteResult.rows.length > 0) {
      console.log('\n✅ Successfully deleted:');
      console.log('   Name:', deleteResult.rows[0].name);
      console.log('   Slug:', deleteResult.rows[0].slug);
      console.log('   ID:', deleteResult.rows[0].id);
      console.log('\n✨ Subcategory removed from database!\n');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

deleteLondonAirports();
