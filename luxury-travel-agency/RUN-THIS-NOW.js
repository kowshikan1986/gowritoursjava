// ========================================
// QUICK UPDATE SCRIPT - RUN IN BROWSER CONSOLE
// ========================================
// 1. Open your website (http://localhost:5173)
// 2. Press F12 to open Console
// 3. Copy and paste this ENTIRE script
// 4. Press Enter
// ========================================

(async () => {
  console.log('🚀 Starting Scotland Highlights update with images...');
  
  try {
    // Import database module
    const dbModule = await import('/src/services/database.js');
    const { initDatabase, getCategoryBySlug, updateCategory, getCategories } = dbModule;
    
    // Initialize database
    console.log('📦 Initializing database...');
    await initDatabase();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all categories to verify
    const allCategories = getCategories();
    console.log('📊 Total categories:', allCategories.length);
    
    // Find Scotland Highlights
    console.log('🔍 Searching for Scotland Highlights...');
    const scotland = getCategoryBySlug('scotland-highlights');
    
    if (!scotland) {
      console.error('❌ Scotland Highlights not found!');
      console.log('Available categories:', allCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
      alert('❌ Scotland Highlights category not found in database!');
      return;
    }
    
    console.log('✅ Found Scotland Highlights:', scotland);
    console.log('Current description length:', scotland.description?.length || 0);
    
    // Full HTML with images
    const newDescription = `<div style="max-width: 100%;">
<img src="https://images.unsplash.com/photo-1551506448-074afa034c05?q=80&w=2070&auto=format&fit=crop" 
     alt="Scotland Highlands" 
     style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; margin: 20px auto; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">

<h2 style="margin-top: 2rem;">04 Days - Historic Scotland (Code: SCTL)</h2>

<h3>🎯 Tour Highlights</h3>
<ul>
<li>✓ Nevis Range with entrance</li>
<li>✓ Glasgow City Tour covering Glasgow Cathedral, Main Square & University of Glasgow</li>
<li>✓ Edinburgh City Tour covering the Royal Mile and entrance to Edinburgh Castle</li>
<li>✓ View the famous Neptune staircase & Commando Memorial</li>
<li>✓ View the Forth Road Bridge</li>
<li>✓ Photo Stop at Falkirk Wheel</li>
<li>✓ The Kelpies</li>
<li>✓ Lake Windermere Cruise</li>
<li>✓ Lakeside & Haverthwaite Steam Train</li>
<li>✓ Two Indian Lunches included</li>
<li>✓ Loch Lomond Cruise (optional)</li>
<li>✓ Whiskey Tasting - Exclusive</li>
</ul>

<h3>💰 Price Includes</h3>
<ul>
<li>✓ Return transportation by deluxe AC vehicle</li>
<li>✓ 3 nights accommodation in 3/4* hotel with breakfast</li>
<li>✓ 3 Indian dinners & 2 Indian Lunches</li>
<li>✓ Whiskey Tasting</li>
<li>✓ All tips and service charges</li>
<li>✓ Guaranteed departures (April to October)</li>
<li>✓ ABTA Legal Protection</li>
</ul>

<h3>📅 Day-by-Day Itinerary</h3>

<h4>Day 1: London - Gretna Green - Glasgow (650 Kms)</h4>
<img src="https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=2071&auto=format&fit=crop" 
     alt="Glasgow Cathedral" 
     style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 8px; margin: 10px 0;">
<p>Join your coach and depart towards Gretna Green. Stop for lunch at Gretna Green, the UK's most famous place to get married. Continue to Glasgow and visit Glasgow Cathedral, one of Scotland's most magnificent medieval buildings. Enjoy a delicious Indian meal before checking into the hotel for three nights.</p>
<p><strong>Meals:</strong> Dinner</p>

<h4>Day 2: Glasgow - Loch Lomond - Fort William - Glasgow (360 Kms)</h4>
<img src="https://images.unsplash.com/photo-1599833975787-5e96b0bacf56?q=80&w=2070&auto=format&fit=crop" 
     alt="Loch Lomond" 
     style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 8px; margin: 10px 0;">
<p>Visit Loch Lomond and The Trossachs National Park. Optional boat cruise available. Travel to Fort William and visit Nevis Range via cable car (1,345 metres above sea level). Enjoy Indian lunch amongst beautiful scenery. Visit Commando Memorial and Neptune's staircase.</p>
<p><strong>Meals:</strong> Breakfast, Lunch, Dinner</p>

<h4>Day 3: Glasgow - Edinburgh - Glasgow (160 Kms)</h4>
<img src="https://images.unsplash.com/photo-1580837119756-563d608dd119?q=80&w=2070&auto=format&fit=crop" 
     alt="Edinburgh Castle" 
     style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 8px; margin: 10px 0;">
<p>Photo stop at Falkirk Wheel and visit The Kelpies. Explore Edinburgh Castle with its crown jewels. Walk the Royal Mile and see St Giles' Cathedral. View the Forth Road Bridge. Indian dinner included.</p>
<p><strong>Meals:</strong> Breakfast, Lunch, Dinner</p>

<h4>Day 4: Glasgow - Lake District - London (685 Kms)</h4>
<img src="https://images.unsplash.com/photo-1588756848359-035c6edc11a7?q=80&w=2070&auto=format&fit=crop" 
     alt="Lake District Windermere" 
     style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 8px; margin: 10px 0;">
<p>Travel to Lake District. Enjoy 45-minute boat cruise on Lake Windermere. Board Heritage Steam Train from Lakeside to Haverthwaite. Return to London with drop-offs along the route.</p>
<p><strong>Meals:</strong> Breakfast</p>

<h3>🚌 Pick-Up Points</h3>
<table style="width:100%; border-collapse: collapse;">
<tr style="background: #f3f4f6;">
<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Departure Point</th>
<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Time</th>
</tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">East Ham (E6 2LL)</td><td style="padding: 8px; border: 1px solid #ddd;">05:15 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Southall (UB1 3DB)</td><td style="padding: 8px; border: 1px solid #ddd;">05:45 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Perivale (UB6 7LA)</td><td style="padding: 8px; border: 1px solid #ddd;">06:00 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Wembley (HA9 6LL)</td><td style="padding: 8px; border: 1px solid #ddd;">06:15 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Toddington Services (LU5 6HR)</td><td style="padding: 8px; border: 1px solid #ddd;">07:00 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Newport Pagnell (MK16 8DS)</td><td style="padding: 8px; border: 1px solid #ddd;">07:10 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Watford Gap Services (NN6 7UZ)</td><td style="padding: 8px; border: 1px solid #ddd;">07:35 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Corley Services (CV7 8NR)</td><td style="padding: 8px; border: 1px solid #ddd;">08:15 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Norton Canes Services (WS11 9UX)</td><td style="padding: 8px; border: 1px solid #ddd;">08:45 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Stafford Services (ST15 0EU)</td><td style="padding: 8px; border: 1px solid #ddd;">09:55 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Keele Services (ST5 5HG)</td><td style="padding: 8px; border: 1px solid #ddd;">10:20 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Knutsford Services (WA16 0TL)</td><td style="padding: 8px; border: 1px solid #ddd;">11:00 hrs</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Glasgow Cathedral (G4 0QZ)</td><td style="padding: 8px; border: 1px solid #ddd;">16:00 hrs</td></tr>
</table>

<p style="margin-top: 20px;"><em>Note: All pick ups are Northbound Services and all drops will be Southbound Services.</em></p>

<h3>⭐ Special Features</h3>
<ul>
<li>✓ Indian Lunch included in Edinburgh</li>
<li>✓ Complimentary Indian Lunch at Nevis range (Mar-Oct)</li>
<li>✓ Whiskey Tasting with introduction</li>
<li>✓ Guaranteed departures from April to August</li>
<li>✓ Tips and service charge included</li>
<li>✓ ABTA Protection</li>
</ul>

<h3>📝 Important Notes</h3>
<p>Nevis range subject to weather conditions. Steam Train not operational January-March and November-December.</p>
</div>`;
    
    console.log('💾 Updating category with new description...');
    console.log('New description length:', newDescription.length);
    
    // Update the category
    await updateCategory(scotland.slug, {
      name: scotland.name,
      description: newDescription,
      image: scotland.image,
      parent_id: scotland.parent_id,
      visible: scotland.visible,
      sort_order: scotland.sort_order
    });
    
    console.log('✅ Update complete!');
    console.log('');
    console.log('========================================');
    console.log('✅ SUCCESS! Scotland Highlights updated!');
    console.log('========================================');
    console.log('');
    console.log('📍 Next steps:');
    console.log('1. Navigate to: /service/scotland-highlights');
    console.log('2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('3. You should see all the images and details!');
    console.log('');
    
    alert('✅ SUCCESS!\n\nScotland Highlights updated with images!\n\nGo to:\n/service/scotland-highlights\n\nThen do a hard refresh (Ctrl+Shift+R)');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Stack:', error.stack);
    alert('❌ Error: ' + error.message + '\n\nCheck console for details.');
  }
})();
