const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function createMissingAirports() {
  try {
    console.log('\n✨ Creating missing airport subcategories...\n');
    
    // Get airport-transfer parent
    const parentResult = await pool.query(
      "SELECT id FROM categories WHERE slug = 'airport-transfer'"
    );
    const parentId = parentResult.rows[0].id;
    
    // Create Luton Airport
    const lutonResult = await pool.query(
      `INSERT INTO categories (id, name, slug, parent_id, sort_order, description, visible, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET sort_order = $5, name = $2
       RETURNING name, slug, sort_order`,
      [`luton-ltn-${Date.now()}`, 'Luton Airport(LTN)', 'luton-airport-ltn', parentId, 4, 'Premium transfer services to and from Luton Airport.', true]
    );
    console.log(`✅ ${lutonResult.rows[0].name} → Order: ${lutonResult.rows[0].sort_order}`);
    
    // Create City Airport
    const cityResult = await pool.query(
      `INSERT INTO categories (id, name, slug, parent_id, sort_order, description, visible, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET sort_order = $5, name = $2
       RETURNING name, slug, sort_order`,
      [`city-lcy-${Date.now()}`, 'City Airport(LCY)', 'city-airport-lcy', parentId, 5, 'Executive transfer services to and from London City Airport.', true]
    );
    console.log(`✅ ${cityResult.rows[0].name} → Order: ${cityResult.rows[0].sort_order}`);
    
    // Update Fleet & Classes to order 6
    const fleetResult = await pool.query(
      `UPDATE categories SET sort_order = 6 
       WHERE parent_id = $1 AND slug = 'fleet-classes'
       RETURNING name, sort_order`,
      [parentId]
    );
    if (fleetResult.rows.length > 0) {
      console.log(`✅ ${fleetResult.rows[0].name} → Order: ${fleetResult.rows[0].sort_order}`);
    }
    
    console.log('\n✨ All airport subcategories created and ordered!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

createMissingAirports();
