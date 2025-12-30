import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Find Scotland tour
const scotland = db.tours.find(t => t.slug === 'scotland');
if (!scotland) {
  console.log('Scotland tour not found');
  process.exit(1);
}

// Parse existing details or create new object
let details = {};
try {
  details = JSON.parse(scotland.details_json || '{}');
} catch (e) {
  details = {};
}

// Add tourOverview if missing
if (!details.tourOverview || details.tourOverview.length === 0) {
  details.tourOverview = [
    "Gretna Green – Explore the romantic village famous for runaway weddings",
    "Whisky Tasting at Gretna Green – Sample authentic Scottish whisky in a traditional setting",
    "Glasgow City Tour – Discover Glasgow Cathedral, the vibrant Main Square, and the prestigious University of Glasgow",
    "Edinburgh City Tour – Stroll along the Royal Mile and enjoy entrance to the majestic Edinburgh Castle",
    "The Falkirk Wheel – Visit this engineering marvel, a unique rotating boat lift",
    "The Kelpies – Admire the world-famous, giant horse-head sculptures",
    "Nevis Range – Experience stunning mountain scenery with entrance included",
    "Photo Stop at the Neptune Staircase – Capture Scotland's remarkable canal lock system",
    "Photo Stop at the Commando Memorial – Pay homage to Scotland's military heritage with panoramic views",
    "Glenfinnan Viaduct & Glenfinnan Monument – See the iconic viaduct and historic monument, famous worldwide",
    "Lake Windermere Cruise – Sail across England's largest natural lake and soak in the peaceful beauty of the Lake District",
    "Lakeside & Haverthwaite Steam Train – Enjoy a nostalgic journey through scenic landscapes aboard a classic steam train"
  ];
  
  scotland.details_json = JSON.stringify(details);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('✅ Scotland tour tourOverview restored with', details.tourOverview.length, 'items');
} else {
  console.log('✅ Scotland tour already has tourOverview with', details.tourOverview.length, 'items');
}
