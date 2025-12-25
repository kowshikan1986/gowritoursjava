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

async function exportDatabaseToSQL() {
  const client = await pool.connect();
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let sqlContent = `-- Database Export
-- Date: ${new Date().toISOString()}
-- Database: gowritour

`;

    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('📦 Exporting database to SQL...\n');

    // Export each table
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Exporting table: ${tableName}`);
      
      // Get table schema
      const schemaResult = await client.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Create DROP and CREATE TABLE statements
      sqlContent += `\n-- Table: ${tableName}\n`;
      sqlContent += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
      sqlContent += `CREATE TABLE ${tableName} (\n`;
      
      const columns = schemaResult.rows.map(col => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        return colDef;
      });
      
      sqlContent += columns.join(',\n');
      sqlContent += '\n);\n\n';

      // Get table data
      const dataResult = await client.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        sqlContent += `-- Data for ${tableName}\n`;
        
        for (const dataRow of dataResult.rows) {
          const columnNames = Object.keys(dataRow);
          const values = columnNames.map(col => {
            const val = dataRow[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') {
              // Escape single quotes
              return `'${val.replace(/'/g, "''")}'`;
            }
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          
          sqlContent += `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        sqlContent += '\n';
      }
      
      console.log(`  ✓ Exported ${dataResult.rows.length} rows`);
    }

    // Save to SQL file
    const filename = `database_export_${timestamp}.sql`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, sqlContent);

    console.log(`\n✅ Database exported successfully!`);
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Total tables: ${tablesResult.rows.length}`);

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

exportDatabaseToSQL();
