const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

// Check if highlights column exists
pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'categories'
  ORDER BY ordinal_position
`).then(res => {
  console.log('\n📋 Categories table columns:\n');
  res.rows.forEach(col => {
    console.log(`  ${col.column_name} (${col.data_type})`);
  });
  
  const hasHighlights = res.rows.some(col => col.column_name === 'highlights');
  
  if (hasHighlights) {
    console.log('\n✅ highlights column exists');
  } else {
    console.log('\n❌ highlights column does NOT exist - need to add it');
  }
  
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
