/**
 * Script to populate Scotland Highlights tour with complete details
 * 
 * HOW TO USE:
 * 1. Open http://localhost:5173 in your browser
 * 2. Open browser console (F12)
 * 3. Paste this entire script and press Enter
 * 4. You should see success messages
 * 5. Navigate to /service/scotland-highlights to see the details
 */

(async function populateScotlandTour() {
  console.log('🔄 Starting Scotland Highlights tour population...');
  
  try {
    // Import database functions
    const { initDatabase, getTours, createTour, updateTour } = await import('./src/services/database.js');
    
    // Initialize database
    console.log('📦 Initializing database...');
    await initDatabase();
    
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all tours
    const tours = getTours();
    console.log(`📊 Found ${tours.length} existing tours`);
    
    // Check if Scotland Highlights tour exists
    const existingTour = tours.find(t => 
      t.slug === 'scotland-highlights' || 
      t.title.toLowerCase().includes('scotland highlights')
    );
    
    // Scotland tour data
    const scotlandData = {
      title: 'Scotland Highlights',
      slug: 'scotland-highlights',
      tour_code: 'SCTL',
      price: 385,
      duration: '4 Days',
      location: 'Scotland, UK',
      description: 'Experience the breathtaking beauty of Scotland on this 4-day adventure, featuring iconic landmarks, stunning landscapes, and rich cultural heritage.',
      category: 'scotland', // You may need to adjust this based on your categories
      is_active: true,
      is_featured: true,
      featured_image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop',
      details: {
        earlyBirdOffer: 'Book 2026 Tours Now & Get upto 10% Off | Offer Ends on 31th Dec 2025.',
        
        hotels: '3 nights at Premier Inn or Holiday Inn Express Strathclyde or Similar',
        
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
          'Guaranteed departures*',
          'ABTA Legal Protection'
        ],
        
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
          { location: 'Slough (SL1 2DH)', time: '06:00 hrs' },
          { location: 'Heathrow T2&3 (TW6 1EW)', time: '06:30 hrs' },
          { location: 'Reading M4 Services (RG7 4PR)', time: '07:00 hrs' },
          { location: 'Membury M4 Services (RG17 7TZ)', time: '07:30 hrs' },
          { location: 'Gloucester M5 Services (GL2 5SB)', time: '08:30 hrs' },
          { location: 'Stafford M6 Services (ST15 0EU)', time: '09:45 hrs' },
          { location: 'Keele M6 Services (ST5 5HG)', time: '10:00 hrs' },
          { location: 'Charnock Richard M6 Services (PR7 5LR)', time: '10:30 hrs' },
          { location: 'Lancaster M6 Services (LA2 9DU)', time: '11:00 hrs' },
          { location: 'Gretna M74 Services (DG16 5HQ)', time: '12:00 hrs' },
          { location: 'Hamilton M74 Services (ML3 6JW)', time: '12:45 hrs' }
        ],
        
        itinerary: [] // Add itinerary later if needed
      }
    };
    
    if (existingTour) {
      console.log(`✏️ Updating existing tour: ${existingTour.title} (${existingTour.slug})`);
      await updateTour(existingTour.slug, scotlandData);
      console.log('✅ Scotland Highlights tour updated successfully!');
    } else {
      console.log('➕ Creating new Scotland Highlights tour...');
      await createTour(scotlandData);
      console.log('✅ Scotland Highlights tour created successfully!');
    }
    
    console.log('\n📋 Tour Details Summary:');
    console.log(`   Title: ${scotlandData.title}`);
    console.log(`   Code: ${scotlandData.tour_code}`);
    console.log(`   Price: £${scotlandData.price}`);
    console.log(`   Duration: ${scotlandData.duration}`);
    console.log(`   Highlights: ${scotlandData.details.highlights.length} items`);
    console.log(`   Price Includes: ${scotlandData.details.priceIncludes.length} items`);
    console.log(`   Star Difference: ${scotlandData.details.starDifference.length} items`);
    console.log(`   Pickup Points: ${scotlandData.details.pickupPoints.length} locations`);
    console.log(`   Additional Excursions: ${scotlandData.details.additionalExcursions.length} items`);
    
    console.log('\n🎉 All done! Navigate to /service/scotland-highlights to see the tour.');
    console.log('💡 The details should now appear in the correct sections.');
    
  } catch (error) {
    console.error('❌ Error populating Scotland tour:', error);
    console.error('Full error:', error);
  }
})();
