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

async function checkTourDetails() {
  try {
    const result = await pool.query('SELECT slug, title, featured_image, details_json FROM tours LIMIT 3');
    console.log('\n📋 Tours with details:');
    result.rows.forEach(tour => {
      console.log(`\n- ${tour.title} (${tour.slug})`);
      console.log(`  Featured image length: ${tour.featured_image ? tour.featured_image.length : 0} chars`);
      console.log(`  Details JSON length: ${tour.details_json ? tour.details_json.length : 0} chars`);
      if (tour.details_json) {
        try {
          const parsed = JSON.parse(tour.details_json);
          console.log(`  Parsed details:`, {
            highlights: parsed.highlights?.length || 0,
            itinerary: parsed.itinerary?.length || 0,
            galleryImages: parsed.galleryImages?.length || 0
          });
        } catch (e) {
          console.log(`  Error parsing: ${e.message}`);
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTourDetails();
