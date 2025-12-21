const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: 5432,
  database: 'gowritour',
  user: 'admin',
  password: 'London25@',
  ssl: false
});

const fixes = [
  {
    slug: 'estate-car',
    description: 'Family estate cars can comfortably and safely carry up to 4 passengers and a generous amount of luggage. The are also ideal for passengers with other bulky items of luggage.'
  },
  {
    slug: 'saloon-car',
    description: 'Standard family sized saloon cars can comfortably and safely carry up to 4 passengers and luggage.'
  },
  {
    slug: 'mpv',
    description: 'Multi-Purpose Vehicles offering extra space and comfort for families and small groups.'
  },
  {
    slug: '8-seater',
    description: 'Spacious 8-seater vehicles perfect for family trips and small group travel.'
  },
  {
    slug: '16-seater',
    description: '16-seater minibuses ideal for medium-sized groups and corporate travel.'
  },
  {
    slug: '23-seater',
    description: 'Comfortable 23-seater coaches for group tours and events.'
  },
  {
    slug: '33-seater',
    description: 'Large 33-seater coaches with ample luggage space for extended tours.'
  },
  {
    slug: '51-seater',
    description: 'Premium 51-seater coaches equipped with modern amenities for long-distance travel.'
  },
  {
    slug: '83-seater',
    description: 'Double-decker 83-seater coaches for large group tours and events.'
  }
];

async function fixDescriptions() {
  try {
    for (const fix of fixes) {
      await pool.query(
        'UPDATE categories SET description = $1 WHERE slug = $2',
        [fix.description, fix.slug]
      );
      console.log(`✅ Fixed: ${fix.slug}`);
    }
    console.log('\n🎉 All descriptions cleaned!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDescriptions();
