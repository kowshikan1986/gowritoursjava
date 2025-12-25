const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false,
});

async function exportDatabase() {
  const client = await pool.connect();
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportData = {
      exportDate: new Date().toISOString(),
      tables: {}
    };

    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('📦 Exporting database tables...\n');

    // Export each table
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Exporting table: ${tableName}`);
      
      const dataResult = await client.query(`SELECT * FROM ${tableName}`);
      exportData.tables[tableName] = {
        rowCount: dataResult.rows.length,
        data: dataResult.rows
      };
      
      console.log(`  ✓ Exported ${dataResult.rows.length} rows`);
    }

    // Save to JSON file
    const filename = `database_export_${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Database exported successfully!`);
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Total tables: ${Object.keys(exportData.tables).length}`);
    
    // Print summary
    console.log('\nTable Summary:');
    for (const [tableName, tableData] of Object.entries(exportData.tables)) {
      console.log(`  - ${tableName}: ${tableData.rowCount} rows`);
    }

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

exportDatabase();
