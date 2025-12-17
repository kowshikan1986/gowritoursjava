/**
 * Initialize SQLite database with schema
 * Run this with: node database/init-database.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, 'travel_agency.db');

console.log('Initializing database at:', DB_PATH);

// Create database connection
const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Creating tables...');

// Categories table (supports parent-child relationships)
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    parent_id TEXT,
    visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
  )
`);

// Tours table
db.exec(`
  CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    price REAL DEFAULT 0,
    duration TEXT DEFAULT '',
    location TEXT DEFAULT '',
    featured_image TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    category_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )
`);

// Hero Banners table
db.exec(`
  CREATE TABLE IF NOT EXISTS hero_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    background_image TEXT DEFAULT '',
    cta_text TEXT DEFAULT '',
    cta_link TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Logos table
db.exec(`
  CREATE TABLE IF NOT EXISTS logos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ads table
db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT DEFAULT '',
    link TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Tables created successfully!');

// Insert sample data
console.log('Inserting sample data...');

// Sample hero banner
const insertBanner = db.prepare(`
  INSERT OR IGNORE INTO hero_banners (id, title, subtitle, background_image, cta_text, cta_link, is_active, priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertBanner.run(
  'hero-1',
  'Extraordinary Journeys',
  "Discover the world's most exclusive destinations with personalized luxury travel experiences crafted to perfection for the discerning traveler.",
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
  'Explore Destinations',
  '#destinations',
  1,
  1
);

console.log('Sample data inserted!');
console.log('Database initialized successfully at:', DB_PATH);
console.log('\nYou can now use this database with your application.');

db.close();
