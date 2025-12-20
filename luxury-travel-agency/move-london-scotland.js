import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function moveCategoriesToUKTours() {
  try {
    const ukToursId = '1765987545871-vs33uitk6'; // UK Tours ID
    const londonId = '1765987545887-m10aw9fjp'; // London City ID
    const scotlandId = '1765987545892-n7bmw9j1z'; // Scotland ID
    
    console.log('\n📦 Moving categories to UK Tours...');
    
    // Move London City under UK Tours
    await pool.query(
      'UPDATE categories SET parent_id = $1, updated_at = NOW() WHERE id = $2',
      [ukToursId, londonId]
    );
    console.log('✅ Moved London City under UK Tours');
    
    // Move Scotland under UK Tours
    await pool.query(
      'UPDATE categories SET parent_id = $1, updated_at = NOW() WHERE id = $2',
      [ukToursId, scotlandId]
    );
    console.log('✅ Moved Scotland under UK Tours');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT id, name, parent_id 
      FROM categories 
      WHERE id IN ($1, $2)
    `, [londonId, scotlandId]);
    
    console.log('\n✅ Verification:');
    result.rows.forEach(cat => {
      console.log(`  - ${cat.name}: parent_id = ${cat.parent_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

moveCategoriesToUKTours();
