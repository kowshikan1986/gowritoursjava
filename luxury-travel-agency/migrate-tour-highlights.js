const fs = require('fs');

// Read database
const dbPath = 'data/database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Starting migration...');
let migrated = 0;

// Migrate tours
db.tours.forEach(tour => {
  if (tour.details_json) {
    try {
      const details = JSON.parse(tour.details_json);
      
      // If tourOverview doesn't exist but highlights does, move highlights to tourOverview
      if (!details.tourOverview && details.highlights && Array.isArray(details.highlights) && details.highlights.length > 0) {
        console.log(`Migrating tour: ${tour.title}`);
        details.tourOverview = details.highlights;
        details.highlights = [];
        tour.details_json = JSON.stringify(details);
        migrated++;
      }
    } catch (e) {
      console.error(`Error parsing details for tour ${tour.slug}:`, e.message);
    }
  }
});

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`✅ Migration complete! ${migrated} tours migrated.`);
