const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

async function createEuropeanTours() {
  try {
    // 1. Find the Tours root category
    const toursResult = await pool.query(
      "SELECT id FROM categories WHERE slug = 'tours' AND parent_id IS NULL"
    );
    
    if (toursResult.rows.length === 0) {
      console.log('❌ Tours category not found!');
      return;
    }
    
    const toursId = toursResult.rows[0].id;
    console.log('✅ Found Tours category:', toursId);
    
    // 2. Create European Tours subcategory
    const europeanResult = await pool.query(
      `INSERT INTO categories (id, name, slug, description, parent_id, visible, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE 
       SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id
       RETURNING id`,
      [
        Date.now() + '-european',
        'European Tours',
        'european-tours',
        'Explore the rich history, culture, and landscapes of Europe with our curated luxury tours.',
        toursId,
        true,
        1
      ]
    );
    
    const europeanId = europeanResult.rows[0].id;
    console.log('✅ Created European Tours:', europeanId);
    
    // 3. Create subcategories under European Tours
    const subcategories = [
      { name: 'France (Paris, Riviera)', slug: 'france-paris-riviera', description: 'Experience the romance of Paris and the glamour of the French Riviera.', order: 1 },
      { name: 'Italy (Rome, Amalfi, Tuscany)', slug: 'italy-rome-amalfi-tuscany', description: 'Discover ancient Rome, stunning Amalfi Coast, and rolling Tuscan hills.', order: 2 },
      { name: 'Greece (Athens, Cyclades, Santorini)', slug: 'greece-athens-cyclades-santorini', description: 'Explore ancient Athens and the beautiful Greek islands.', order: 3 },
      { name: 'Switzerland (Alps, Lakes)', slug: 'switzerland-alps-lakes', description: 'Majestic Alps, crystal-clear lakes, and charming Swiss villages.', order: 4 },
      { name: 'Spain & Portugal Highlights', slug: 'spain-portugal-highlights', description: 'From Barcelona to Lisbon, experience Iberian culture and cuisine.', order: 5 }
    ];
    
    for (const sub of subcategories) {
      await pool.query(
        `INSERT INTO categories (id, name, slug, description, parent_id, visible, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id`,
        [
          Date.now() + '-' + sub.slug,
          sub.name,
          sub.slug,
          sub.description,
          europeanId,
          true,
          sub.order
        ]
      );
      console.log('✅ Created:', sub.name);
      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('\n🎉 All European Tours categories created!');
    console.log('📝 You can now edit them in the admin panel and add images.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createEuropeanTours();
