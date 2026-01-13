const fs = require('fs');

const db = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));

// Find the Isle of Wight tour
const tourIndex = db.tours.findIndex(t => t.slug === 'day-trip-to-isle-of-wight');
if (tourIndex === -1) {
  console.log('Tour not found');
  process.exit(1);
}

const tour = db.tours[tourIndex];
let details = JSON.parse(tour.details_json || '{}');

// Create proper sub-packages with both 1 Day and 2 Day options
details.subPackages = [
  {
    name: '1 Day Tour',
    duration: '1 Day',
    price: '60',
    childPrice: '50',
    description: 'A scenic day trip to the Isle of Wight featuring Shanklin Beach and The Needles. Experience the charm of England\'s largest island in one action-packed day.',
    highlights: [
      'Scenic ferry crossing from Southampton or Portsmouth to the Isle of Wight',
      'Free time at Shanklin Beach – Relax on one of the island\'s most iconic golden-sand beaches',
      'Visit to The Needles Landmark at Alum Bay – Experience breath taking coastal views',
      'See the famous multi-coloured cliffs of Alum Bay',
      'Optional Chairlift Ride (ticket not included) – Enjoy spectacular aerial views of the Needles Rocks and Lighthouse',
      'Leisure time for photos, exploration & seaside enjoyment throughout the island'
    ],
    itinerary: [
      { 
        day: 1, 
        title: 'London - Isle of Wight - London', 
        description: 'Depart from London to Southampton/Portsmouth. Scenic ferry crossing to Isle of Wight. Visit Shanklin Beach for golden sands and seaside charm. Continue to The Needles at Alum Bay for iconic coastal views. Optional chairlift ride available. Return by ferry and coach to London, arriving around 22:00.' 
      }
    ],
    priceIncludes: [
      'Return transportation by deluxe AC coach',
      'Return ferry crossing from Portsmouth or Southampton',
      'Services of professional tour manager',
      'Free time at Shanklin Beach',
      'Visit to The Needles Landmark'
    ],
    tourDates: [
      { date: '15/08/26 @ 06:00 AM' },
      { date: '22/08/26 @ 06:00 AM' },
      { date: '29/08/26 @ 06:00 AM' }
    ]
  },
  {
    name: '2 Day Tour',
    duration: '2 Days / 1 Night',
    price: '195',
    childPrice: '165',
    description: 'An extended exploration of the Isle of Wight with overnight stay in a 3-star hotel. Visit Osborne House, multiple beaches, the Pearl Factory, and The Needles for the complete island experience.',
    highlights: [
      'Osborne House - Step inside the historic royal residence of Queen Victoria',
      'Free time at Ryde Beach - Perfect for a relaxing stroll and sightseeing',
      'Free time at Sandown Beach - Golden sands and one of the island\'s most scenic spots',
      'Visit Isle of Wight Pearl Factory - Discover the craftsmanship behind famous pearl jewellery',
      'Free time at The Needles Landmark - Marvel at spectacular coastal views',
      '3-star hotel accommodation with hot buffet breakfast included'
    ],
    itinerary: [
      { 
        day: 1, 
        title: 'London - Isle of Wight', 
        description: 'Depart from London and take the scenic ferry to Isle of Wight. Visit Osborne House, Queen Victoria\'s beloved royal residence. Explore the stunning grounds and Italian-inspired architecture. Enjoy free time at Ryde Beach for relaxation. Check into your comfortable 3-star hotel for overnight stay with breakfast included.' 
      },
      { 
        day: 2, 
        title: 'Isle of Wight - London', 
        description: 'After a hearty breakfast, visit the Isle of Wight Pearl Factory to discover exquisite craftsmanship. Enjoy leisure time at Sandown Beach, one of the island\'s most beautiful coastal spots. Head to The Needles Landmark for stunning views of the famous chalk stacks and lighthouse. Return by ferry and coach to London.' 
      }
    ],
    priceIncludes: [
      'Round-trip transportation in an executive air-conditioned coach',
      'Return ferry crossing from Portsmouth or Southampton',
      '1 night stay in a 3-star hotel with hot buffet breakfast',
      'Entry to Osborne House',
      'Visit to Isle of Wight Pearl Factory',
      'Gratuities covered',
      'Premium services of dedicated Tour Manager'
    ],
    tourDates: [
      { date: '20/08/26 @ 06:00 AM' },
      { date: '27/08/26 @ 06:00 AM' },
      { date: '03/09/26 @ 06:00 AM' }
    ]
  }
];

// Update the tour title
tour.title = 'Isle of Wight Tours';
tour.details_json = JSON.stringify(details);
db.tours[tourIndex] = tour;

fs.writeFileSync('data/database.json', JSON.stringify(db, null, 2));
console.log('✅ Updated Isle of Wight tour with 1 Day and 2 Day packages');
