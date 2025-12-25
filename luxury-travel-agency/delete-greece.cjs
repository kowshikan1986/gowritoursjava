const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function deleteGreece() {
  try {
    console.log('\n🗑️  Deleting "Greece (Athens, Cyclades, Santorini)" subcategory...\n');
    
    // Try different possible name variations
    const names = [
      'Greece (Athens, Cyclades, Santorini)',
      'Greece',
      'greece-athens-cyclades-santorini'
    ];
    
    for (const name of names) {
      const checkResult = await pool.query(
        "SELECT id, name, slug, parent_id FROM categories WHERE name = $1 OR slug = $1",
        [name]
      );
      
      if (checkResult.rows.length > 0) {
        console.log('Found category:', checkResult.rows[0]);
        
        const deleteResult = await pool.query(
          "DELETE FROM categories WHERE id = $1 RETURNING *",
          [checkResult.rows[0].id]
        );
        
        if (deleteResult.rows.length > 0) {
          console.log('\n✅ Successfully deleted:');
          console.log('   Name:', deleteResult.rows[0].name);
          console.log('   Slug:', deleteResult.rows[0].slug);
          console.log('   ID:', deleteResult.rows[0].id);
          console.log('\n✨ Subcategory removed from database!\n');
        }
        pool.end();
        return;
      }
    }
    
    console.log('⚠️  Category not found in database.');
    pool.end();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    pool.end();
  }
}

deleteGreece();
