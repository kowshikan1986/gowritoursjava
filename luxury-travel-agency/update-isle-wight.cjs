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
    name: '1 Day',
    duration: '1 Day',
    price: '60',
    childPrice: '50',
    description: 'Embark on a Scenic Island Adventure. After a warm welcome from your tour manager at your designated pick-up point, settle into your comfortable coach as we begin our scenic journey towards Southampton or Portsmouth. From here, we take a short and pleasant ferry crossing over the Solent to England\'s largest island - the Isle of Wight.',
    highlights: [
      'Scenic ferry crossing from Southampton or Portsmouth to the Isle of Wight',
      'Free time at Shanklin Beach - Relax on one of the island\'s most iconic golden-sand beaches',
      'Visit to The Needles Landmark at Alum Bay - Experience breath-taking coastal views',
      'See the famous multi-coloured cliffs of Alum Bay',
      'Optional Chairlift Ride (ticket not included) - Enjoy spectacular aerial views of the Needles Rocks and Lighthouse',
      'Leisure time for photos, exploration & seaside enjoyment throughout the island'
    ],
    itinerary: [
      { day: 1, title: 'London - Southampton/Portsmouth - Shanklin Beach - The Needles - London', description: 'After a warm welcome from your tour manager at your designated pick-up point, settle into your comfortable coach as we begin our scenic journey towards Southampton or Portsmouth. From here, we take a short and pleasant ferry crossing over the Solent to England\'s largest island - the Isle of Wight.\n\nShanklin Beach - Golden Sands & Seaside Charm: Our first stop is the picturesque Shanklin Beach, one of the island\'s most loved coastal gems. This beautiful stretch of golden sand is backed by a classic English promenade, offering plenty of charm and stunning sea views. Enjoy free time here to relax, stroll along the beachfront, or capture postcard-perfect photos.\n\nThe Needles & Alum Bay - Iconic Views of the Isle of Wight: We then continue to the island\'s most famous landmark, The Needles, located at Alum Bay. Renowned for its striking multi-coloured sand cliffs, this area offers breath taking views across the Solent. You may choose to take the optional chairlift ride (ticket not included) for a delightful descent from the clifftops to the beach, treating you to panoramic sights of the Needles Rocks, Lighthouse, and the turquoise waters below.\n\nReturn to London: After immersing yourself in the natural beauty and unique landscapes of Alum Bay, we begin our journey back to the mainland by ferry, returning to Southampton or Portsmouth. We then proceed towards your respective drop-off points, bidding farewell to the new friends you\'ve made on this unforgettable day trip.' }
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
    name: '2 Day',
    duration: '2 Days / 1 Night',
    price: '195',
    childPrice: '165',
    description: 'An extended exploration of the Isle of Wight with overnight stay, visiting Osborne House, beaches, and The Needles. Experience the island at a relaxed pace with a comfortable hotel stay.',
    highlights: [
      'Osborne House - Step inside the historic Osborne House, the former royal residence of Queen Victoria',
      'Free time at Ryde Beach - Enjoy some leisure time at Ryde Beach, perfect for a relaxing stroll',
      'Free time at Sandown Beach - Spend some free time on the golden sands of Sandown Beach',
      'Visit Isle of Wight Pearl Factory - Discover the craftsmanship behind the island\'s famous pearl jewellery',
      'Free time at The Needles Landmark - Marvel at the iconic Needles Landmark with spectacular coastal views',
      'Overnight stay in a comfortable 3-star hotel with hot buffet breakfast'
    ],
    itinerary: [
      { day: 1, title: 'London - Isle of Wight', description: 'Depart from London and take the ferry to Isle of Wight. Visit Osborne House, Queen Victoria\'s royal residence. Explore the grand rooms, beautiful gardens, and private beach where the royal family once relaxed. Enjoy free time at Ryde Beach for a relaxing stroll along the promenade. Check into your 3-star hotel for overnight stay with breakfast.' },
      { day: 2, title: 'Isle of Wight - London', description: 'After a hearty hot buffet breakfast, visit the Isle of Wight Pearl Factory where you can discover the craftsmanship behind the island\'s famous pearl jewellery. Enjoy Sandown Beach for relaxation on golden sands. Head to The Needles Landmark for stunning coastal views of the famous chalk stacks and lighthouse. Optional chairlift ride available (not included). Return by ferry and coach to London, arriving at your drop-off points in the evening.' }
    ],
    priceIncludes: [
      'Round-trip transportation in an executive air-conditioned coach',
      'Return ferry crossing from Portsmouth or Southampton',
      '1 night stay in a 3-star hotel with hot buffet breakfast',
      'Entry to Osborne House',
      'Visit to Isle of Wight Pearl Factory',
      'Visit to The Needles Landmark',
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

// Update the tour title to be more generic
tour.title = 'Isle of Wight Tours';
tour.details_json = JSON.stringify(details);
db.tours[tourIndex] = tour;

fs.writeFileSync('data/database.json', JSON.stringify(db, null, 2));
console.log('Updated Isle of Wight tour with 1 Day and 2 Day packages');
