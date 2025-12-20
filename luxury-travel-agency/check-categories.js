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

async function checkCategories() {
  try {
    const result = await pool.query(`
      SELECT id, name, slug, parent_id 
      FROM categories 
      ORDER BY 
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
        name
    `);
    
    console.log('\n📁 Main Categories:');
    result.rows.filter(c => !c.parent_id).forEach(cat => {
      console.log(`  ${cat.id}: ${cat.name} (${cat.slug})`);
    });
    
    console.log('\n📂 Subcategories:');
    result.rows.filter(c => c.parent_id).forEach(cat => {
      const parent = result.rows.find(p => p.id === cat.parent_id);
      console.log(`  ${cat.id}: ${cat.name} → Parent: ${parent?.name || cat.parent_id}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
