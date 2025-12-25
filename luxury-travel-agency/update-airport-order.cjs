const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function updateAirportOrder() {
  try {
    console.log('\n🔄 Updating airport transfer subcategories order...\n');
    
    // Get airport-transfer parent category
    const parentResult = await pool.query(
      "SELECT id FROM categories WHERE slug = 'airport-transfer' OR name = 'Airport Transfer'"
    );
    
    if (parentResult.rows.length === 0) {
      console.log('❌ Airport Transfer parent category not found');
      pool.end();
      return;
    }
    
    const parentId = parentResult.rows[0].id;
    console.log('✅ Found Airport Transfer parent, ID:', parentId);
    
    // Update order for each subcategory
    const updates = [
      { name: 'Heathrow (LHR)', order: 1 },
      { name: 'Gatwick (LGW)', order: 2 },
      { name: 'Stansted Airport (STN)', order: 3 },
      { name: 'Luton Airport (LTN)', order: 4 },
      { name: 'City Airport (LCY)', order: 5 }
    ];
    
    for (const update of updates) {
      const result = await pool.query(
        `UPDATE categories 
         SET sort_order = $1 
         WHERE parent_id = $2 AND (name = $3 OR name LIKE $4)
         RETURNING name, sort_order`,
        [update.order, parentId, update.name, `%${update.name.split('(')[0].trim()}%`]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${result.rows[0].name} → Order: ${result.rows[0].sort_order}`);
      } else {
        console.log(`⚠️  "${update.name}" not found, trying to create...`);
      }
    }
    
    console.log('\n✨ Airport subcategories order updated!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

updateAirportOrder();
