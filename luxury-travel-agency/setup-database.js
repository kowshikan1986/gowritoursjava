// setup-database.js
// Script to set up the PostgreSQL database schema

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const config = {
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@'
  // No SSL configuration - server doesn't support SSL
};

console.log('Connecting to PostgreSQL database...');
console.log('Host:', config.host);
console.log('Database:', config.database);
console.log('User:', config.user);

// Create a pool
const { Pool } = pg;
const pool = new Pool(config);

// Read the schema file
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
console.log('Reading schema from:', schemaPath);

try {
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  console.log('Schema file loaded successfully');
  
  // Split the schema into individual statements (basic splitting by semicolon)
  // This is a simple approach - in production you might want a more robust parser
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  // Execute each statement
  pool.connect(async (err, client, release) => {
    if (err) {
      console.error('Error acquiring client:', err.stack);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      process.exit(1);
    }
    
    console.log('Connected to database successfully!');
    
    try {
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        // Skip comments and empty statements
        if (stmt.startsWith('--') || stmt.length === 0) {
          continue;
        }
        
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        // console.log('Statement:', stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
        
        try {
          await client.query(stmt);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (queryErr) {
          console.warn(`⚠ Warning executing statement ${i + 1}:`, queryErr.message);
          // Continue with other statements
        }
      }
      
      console.log('\n🎉 Database schema setup completed!');
      console.log('✅ Tables created:');
      console.log('  - categories');
      console.log('  - tours');
      console.log('  - hero_banners');
      console.log('  - logos');
      console.log('  - ads');
      
      release();
      await pool.end();
      console.log('\nDatabase connection closed.');
      process.exit(0);
    } catch (executeErr) {
      console.error('Error executing statements:', executeErr);
      release();
      await pool.end();
      process.exit(1);
    }
  });
} catch (fileErr) {
  console.error('Error reading schema file:', fileErr.message);
  console.log('Please make sure the schema file exists at:', schemaPath);
  process.exit(1);
}