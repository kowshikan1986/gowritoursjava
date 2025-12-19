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

async function checkLogos() {
  try {
    const result = await pool.query('SELECT * FROM logos');
    console.log('\n📷 Logos in database:');
    console.log(JSON.stringify(result.rows, null, 2));
    console.log(`\nTotal logos: ${result.rows.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLogos();
