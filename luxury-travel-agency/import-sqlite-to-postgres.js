import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Pool } = pkg;

// SQLite database path
const SQLITE_DB_PATH = '../travel_agency_db_1765993226122.sqlite';

// PostgreSQL connection
const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

// Open SQLite database
const db = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Helper to run SQLite queries
function querySqlite(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function importData() {
  try {
    console.log('\n🚀 Starting import from SQLite to PostgreSQL...\n');

    // 1. Import Categories
    console.log('📂 Importing categories...');
    const categories = await querySqlite('SELECT * FROM categories');
    console.log(`Found ${categories.length} categories`);
    
    for (const cat of categories) {
      await pool.query(`
        INSERT INTO categories (id, name, slug, description, image, parent_id, sort_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          image = EXCLUDED.image,
          parent_id = EXCLUDED.parent_id,
          sort_order = EXCLUDED.sort_order,
          updated_at = EXCLUDED.updated_at
      `, [
        cat.id,
        cat.name,
        cat.slug,
        cat.description,
        cat.image,
        cat.parent_id,
        cat.display_order || cat.sort_order || 0,
        cat.created_at || new Date().toISOString(),
        cat.updated_at || new Date().toISOString()
      ]);
    }
    console.log(`✅ Imported ${categories.length} categories\n`);

    // 2. Import Tours
    console.log('🗺️  Importing tours...');
    const tours = await querySqlite('SELECT * FROM tours');
    console.log(`Found ${tours.length} tours`);
    
    for (const tour of tours) {
      await pool.query(`
        INSERT INTO tours (
          id, title, slug, category_id, description, 
          featured_image, price, duration, location, details_json, 
          is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          category_id = EXCLUDED.category_id,
          description = EXCLUDED.description,
          featured_image = EXCLUDED.featured_image,
          price = EXCLUDED.price,
          duration = EXCLUDED.duration,
          location = EXCLUDED.location,
          details_json = EXCLUDED.details_json,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `, [
        tour.id,
        tour.title,
        tour.slug,
        tour.category_id,
        tour.description,
        tour.featured_image,
        tour.price,
        tour.duration,
        tour.location,
        JSON.stringify({
          itinerary: tour.itinerary,
          inclusions: tour.inclusions,
          exclusions: tour.exclusions,
          subcategory_id: tour.subcategory_id
        }),
        tour.is_active !== undefined ? tour.is_active : true,
        tour.created_at || new Date().toISOString(),
        tour.updated_at || new Date().toISOString()
      ]);
    }
    console.log(`✅ Imported ${tours.length} tours\n`);

    // 3. Import Hero Banners
    console.log('🎨 Importing hero banners...');
    const banners = await querySqlite('SELECT * FROM hero_banners');
    console.log(`Found ${banners.length} hero banners`);
    
    for (const banner of banners) {
      await pool.query(`
        INSERT INTO hero_banners (
          id, title, subtitle, image, cta_text, cta_link, 
          is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          image = EXCLUDED.image,
          cta_text = EXCLUDED.cta_text,
          cta_link = EXCLUDED.cta_link,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `, [
        banner.id,
        banner.title,
        banner.subtitle,
        banner.image,
        banner.cta_text,
        banner.cta_link,
        banner.is_active !== undefined ? banner.is_active : true,
        banner.created_at || new Date().toISOString(),
        banner.updated_at || new Date().toISOString()
      ]);
    }
    console.log(`✅ Imported ${banners.length} hero banners\n`);

    // 4. Import Ads
    console.log('📢 Importing ads...');
    try {
      const ads = await querySqlite('SELECT * FROM ads');
      console.log(`Found ${ads.length} ads`);
      
      for (const ad of ads) {
        await pool.query(`
          INSERT INTO ads (
            id, title, image, link, is_active, 
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            image = EXCLUDED.image,
            link = EXCLUDED.link,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        `, [
          ad.id,
          ad.title,
          ad.image,
          ad.link,
          ad.is_active !== undefined ? ad.is_active : true,
          ad.created_at || new Date().toISOString(),
          ad.updated_at || new Date().toISOString()
        ]);
      }
      console.log(`✅ Imported ${ads.length} ads\n`);
    } catch (err) {
      console.log('⚠️  Ads table not found in SQLite, skipping...\n');
    }

    // 5. Import Logos
    console.log('🏷️  Importing logos...');
    try {
      const logos = await querySqlite('SELECT * FROM logos');
      console.log(`Found ${logos.length} logos`);
      
      for (const logo of logos) {
        await pool.query(`
          INSERT INTO logos (
            id, name, image, link, is_active, 
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            image = EXCLUDED.image,
            link = EXCLUDED.link,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        `, [
          logo.id,
          logo.name,
          logo.image,
          logo.link,
          logo.is_active !== undefined ? logo.is_active : true,
          logo.created_at || new Date().toISOString(),
          logo.updated_at || new Date().toISOString()
        ]);
      }
      console.log(`✅ Imported ${logos.length} logos\n`);
    } catch (err) {
      console.log('⚠️  Logos table not found in SQLite, skipping...\n');
    }

    console.log('✅ Import completed successfully!\n');
    
    // Show summary
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    const tourCount = await pool.query('SELECT COUNT(*) FROM tours');
    const bannerCount = await pool.query('SELECT COUNT(*) FROM hero_banners');
    
    console.log('📊 PostgreSQL Database Summary:');
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log(`   Tours: ${tourCount.rows[0].count}`);
    console.log(`   Hero Banners: ${bannerCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    db.close();
    await pool.end();
  }
}

importData();
