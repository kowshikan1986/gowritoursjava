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
    const result = await pool.query('SELECT name, slug, parent_id FROM categories WHERE parent_id IS NULL ORDER BY name LIMIT 20');
    console.log('\nRoot categories:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (slug: ${row.slug})`);
    });
    console.log(`\nTotal root categories: ${result.rows.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
