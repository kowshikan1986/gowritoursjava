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

async function checkTour() {
  try {
    // Get the scotland-highlights tour
    const tour = await pool.query(`
      SELECT t.title, t.slug, t.category_id, c.name as category_name, c.slug as category_slug, c.parent_id
      FROM tours t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.slug = 'scotland-highlights'
    `);
    
    console.log('\n📍 Scotland Highlights Tour:');
    if (tour.rows.length > 0) {
      const t = tour.rows[0];
      console.log(`  Title: ${t.title}`);
      console.log(`  Category: ${t.category_name} (${t.category_slug})`);
      console.log(`  Category ID: ${t.category_id}`);
      console.log(`  Parent Category ID: ${t.parent_id}`);
      
      // If category has parent, get parent info
      if (t.parent_id) {
        const parent = await pool.query('SELECT name, slug FROM categories WHERE id = $1', [t.parent_id]);
        if (parent.rows.length > 0) {
          console.log(`  Parent Category: ${parent.rows[0].name} (${parent.rows[0].slug})`);
        }
      }
    } else {
      console.log('  ❌ Tour not found!');
    }
    
    // Check category hierarchy
    console.log('\n📂 Category Hierarchy:');
    const rootCats = await pool.query('SELECT id, name, slug FROM categories WHERE parent_id IS NULL ORDER BY name');
    console.log(`  Root categories (${rootCats.rows.length}):`);
    
    for (const root of rootCats.rows) {
      console.log(`    - ${root.name} (${root.slug})`);
      
      // Get subcategories
      const subs = await pool.query('SELECT id, name, slug FROM categories WHERE parent_id = $1', [root.id]);
      if (subs.rows.length > 0) {
        subs.rows.forEach(sub => {
          console.log(`      └─ ${sub.name} (${sub.slug})`);
          
          // Check if scotland tour is here
          if (tour.rows.length > 0 && tour.rows[0].category_id === sub.id) {
            console.log('         ⭐ SCOTLAND TOUR IS HERE!');
          }
        });
      }
      
      // Check if scotland tour is directly under this root
      if (tour.rows.length > 0 && tour.rows[0].category_id === root.id) {
        console.log('      ⭐ SCOTLAND TOUR IS HERE!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTour();
