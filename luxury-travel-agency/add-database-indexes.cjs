const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function addIndexes() {
  console.log('Adding database indexes for faster queries...\n');
  
  const indexes = [
    // Categories indexes
    { name: 'idx_categories_slug', table: 'categories', column: 'slug' },
    { name: 'idx_categories_parent_id', table: 'categories', column: 'parent_id' },
    { name: 'idx_categories_visible', table: 'categories', column: 'visible' },
    { name: 'idx_categories_sort_order', table: 'categories', column: 'sort_order' },
    
    // Tours indexes
    { name: 'idx_tours_slug', table: 'tours', column: 'slug' },
    { name: 'idx_tours_category_id', table: 'tours', column: 'category_id' },
    { name: 'idx_tours_is_active', table: 'tours', column: 'is_active' },
    
    // Hero banners indexes
    { name: 'idx_hero_banners_is_active', table: 'hero_banners', column: 'is_active' },
    
    // Logos indexes
    { name: 'idx_logos_is_active', table: 'logos', column: 'is_active' },
  ];
  
  for (const idx of indexes) {
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS ${idx.name} 
        ON ${idx.table} (${idx.column})
      `);
      console.log(`✅ Created index: ${idx.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${idx.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Database indexing complete!');
  pool.end();
}

addIndexes();
