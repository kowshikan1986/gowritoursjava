// Script to update Scotland Highlights tour with complete details
// Copy and paste this entire script into your browser console on localhost:5173

(async () => {
  try {
    // Import functions from the database module
    const { initDatabase, updateTour } = await import('./src/services/database.js');
    
    console.log('Initializing database...');
    await initDatabase();
    
    const scotlandData = {
      title: 'Scotland Highlights',
      tour_code: 'SCTL',
      description: 'Discover the majestic Highlands of Scotland. Tour includes visits to Loch Lomond, Glencoe, and a whisky distillery.',
      price: 385.00,
      duration: '4 Days',
      location: 'Scotland, UK',
      details: {
        earlyBirdOffer: 'Book 2026 Tours Now & Get upto 10% Off | Offer Ends on 31th Dec 2025. | Early Bird Offer: Book 10 weeks in advance - £15 OFF per adult & child | Book 8 weeks in advance - £10 OFF per adult & child',
        
        highlights: [
          'Nevis Range* with entrance',
          'Glasgow City Tour covering Glasgow Cathedral, Main Square & University of Glasgow',
          'Edinburgh City Tour covering the Royal Mile and entrance to Edinburgh Castle',
          'View the famous Neptune staircase & Commando Memorial',
          'View the Forth Road Bridge',
          'Photo Stop at Falkirk Wheel',
          'The Kelpies',
          'Lake Windermere Cruise',
          'Lakeside & Haverthwaite Steam Train (Not operational from Jan to Mar and Nov - Dec)',
          'Two Indian Lunches included',
          'Loch Lomond Cruise (if taking optional)',
          'Whiskey Tasting with a short introduction to the "dram" - Star Tours Exclusive'
        ],
        
        priceIncludes: [
          'Return transportation by deluxe AC vehicle from your selected pick up point',
          '3 nights accommodation in 3/4* hotel with breakfast',
          '3 Indian dinners & 2 Indian Lunches',
          'Whiskey Tasting with a short introduction to the "dram" - Star Tours Exclusive',
          'Entrances & sightseeing as mentioned in Tour Highlights',
          'All tips and service charges',
          'Premium service of a Star Tours Representative',
          'Guaranteed departures* (*From April to October only)',
          'ABTA Legal Protection'
        ],
        
        hotels: '3 nights at Premier Inn or Holiday Inn Express Strathclyde or Similar',
        
        starDifference: [
          'Indian Lunch included in Edinburgh',
          'Complimentary Indian Lunch included at the Nevis range* - Star Tours Exclusive (Mar- Oct)',
          'Whiskey Tasting with a short introduction to the "dram" - Star Tours Exclusive',
          'Guaranteed departures from April to August',
          'Tips and service charge included',
          'ABTA Protection'
        ],
        
        additionalExcursions: [
          {
            name: 'Loch Lomond',
            adult: '£15',
            child: '£10 (5-15 Years)'
          }
        ],
        
        pickupPoints: [
          { location: 'East Ham (E6 2LL)', time: '05:15 hrs' },
          { location: 'Southall (UB1 3DB)', time: '05:45 hrs' },
          { location: 'Perivale (UB6 7LA)', time: '06:00 hrs' },
          { location: 'Wembley (HA9 6LL)', time: '06:15 hrs' },
          { location: 'Toddington Services (LU5 6HR)', time: '07:00 hrs' },
          { location: 'Newport Pagnell (MK16 8DS)', time: '07:10 hrs' },
          { location: 'Watford Gap Services (NN6 7UZ)', time: '07:35 hrs' },
          { location: 'Corley Services (CV7 8NR)', time: '08:15 hrs' },
          { location: 'Norton Canes Services (WS11 9UX)', time: '08:45 hrs' },
          { location: 'Stafford Services (ST15 0EU)', time: '09:55 hrs' },
          { location: 'Keele Services (ST5 5HG)', time: '10:20 hrs' },
          { location: 'Knutsford Services (WA16 0TL)', time: '11:00 hrs' },
          { location: 'Glasgow Cathedral (G4 0QZ)', time: '16:00 hrs' }
        ],
        
        itinerary: []  // You can add day-by-day itinerary here later
      }
    };
    
    console.log('Updating Scotland Highlights tour...');
    await updateTour('scotland-highlights', scotlandData);
    
    console.log('✅ Scotland Highlights tour updated successfully!');
    console.log('Refresh the page to see the changes.');
    
  } catch (error) {
    console.error('❌ Error updating tour:', error);
  }
})();
