import sqlite3 from 'sqlite3';
import { servicesData } from '../src/data/servicesData.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`Initializing database at ${dbPath}...`);

db.serialize(() => {
  // 1. Create Services Table
  db.run(`DROP TABLE IF EXISTS services`);
  db.run(`
    CREATE TABLE services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      short_description TEXT,
      full_description TEXT,
      image TEXT,
      features TEXT, -- Stored as JSON string
      seo_title TEXT,
      seo_description TEXT
    )
  `);
  console.log('Services table created.');

  // 2. Create Inquiries Table
  db.run(`DROP TABLE IF EXISTS inquiries`);
  db.run(`
    CREATE TABLE inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Inquiries table created.');

  // 3. Seed Services Data
  const insertStmt = db.prepare(`
    INSERT INTO services (
      id, title, short_description, full_description, image, features, seo_title, seo_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  servicesData.forEach(service => {
    insertStmt.run(
      service.id,
      service.title,
      service.shortDescription,
      service.fullDescription,
      service.image,
      JSON.stringify(service.features),
      service.seo.title,
      service.seo.description
    );
  });

  insertStmt.finalize();
  console.log(`Seeded ${servicesData.length} services.`);
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialization complete.');
  }
});
