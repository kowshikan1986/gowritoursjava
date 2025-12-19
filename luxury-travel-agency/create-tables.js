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

async function createTables() {
  try {
    console.log('Creating PostgreSQL tables...\n');

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        image TEXT DEFAULT '',
        parent_id VARCHAR(255),
        visible BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created categories table');

    // Create tours table  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        price DECIMAL(10, 2) DEFAULT 0,
        duration VARCHAR(100) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        featured_image TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        category_id VARCHAR(255),
        tour_code VARCHAR(100) DEFAULT '',
        details_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created tours table');

    // Create hero_banners table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_banners (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) DEFAULT '',
        subtitle TEXT DEFAULT '',
        image TEXT DEFAULT '',
        cta_text VARCHAR(255) DEFAULT '',
        cta_link VARCHAR(500) DEFAULT '',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created hero_banners table');

    // Create logos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logos (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) DEFAULT '',
        image TEXT DEFAULT '',
        link VARCHAR(500) DEFAULT '',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created logos table');

    // Create ads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) DEFAULT '',
        image TEXT DEFAULT '',
        link VARCHAR(500) DEFAULT '',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created ads table');

    console.log('\n✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();
