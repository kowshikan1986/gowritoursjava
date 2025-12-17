import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed categories matching importData.js structure
const seedCategories = [
  // Main categories
  { name: 'Tours', slug: 'tours', parentSlug: null, sort_order: 1, description: 'Main tours category', image: '', visible: true },
  { name: 'Cruises', slug: 'cruises', parentSlug: null, sort_order: 2, description: 'Cruise packages', image: '', visible: true },
  { name: 'Airport Transfers', slug: 'airport-transfers', parentSlug: null, sort_order: 3, description: 'Airport transfer services', image: '', visible: true },
  { name: 'Vehicle Hire', slug: 'vehicle-hire', parentSlug: null, sort_order: 4, description: 'Vehicle hire services', image: '', visible: true },
  { name: 'Sri Lanka Tours', slug: 'sri-lanka-tours', parentSlug: null, sort_order: 5, description: 'Sri Lanka and India tours', image: '', visible: true },
  { name: 'Other Services', slug: 'other-services', parentSlug: null, sort_order: 6, description: 'Other services', image: '', visible: true },

  // UK Tours subcategories
  { name: 'UK Tours', slug: 'uk-tours', parentSlug: 'tours', sort_order: 1, description: '', image: 'https://images.unsplash.com/photo-1527258654576-0fb8fdfaf6b9?q=80&w=1470&auto=format&fit=crop', visible: true },
  { name: 'European Tours', slug: 'european-tours', parentSlug: 'tours', sort_order: 2, description: '', image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1470&auto=format&fit=crop', visible: true },
  { name: 'World Tours', slug: 'world-tours', parentSlug: 'tours', sort_order: 3, description: '', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1470&auto=format&fit=crop', visible: true },

  // L2 UK subcategories
  { name: 'London', slug: 'london', parentSlug: 'uk-tours', sort_order: 1, description: 'Explore the vibrant capital city', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070', visible: true },
  { name: 'Scotland Highlights', slug: 'scotland-highlights', parentSlug: 'uk-tours', sort_order: 2, description: 'Experience the majestic Highlands', image: 'https://images.unsplash.com/photo-1551506448-074afa034c05?q=80&w=2070', visible: true },
  
  // Cruises
  { name: 'Ocean Cruises', slug: 'ocean-cruises', parentSlug: 'cruises', sort_order: 1, description: 'Luxury ocean cruises', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1470', visible: true },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const categories = [];
const idMap = new Map();

// First pass - create all categories with IDs
seedCategories.forEach(cat => {
  const id = generateId();
  idMap.set(cat.slug, id);
  
  categories.push({
    id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image: cat.image || '',
    parent_id: null, // will be set in second pass
    visible: cat.visible !== false,
    sort_order: cat.sort_order || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
});

// Second pass - set parent_id
categories.forEach((cat, index) => {
  const originalCat = seedCategories[index];
  if (originalCat.parentSlug) {
    cat.parent_id = idMap.get(originalCat.parentSlug) || null;
  }
});

const database = {
  categories,
  tours: [],
  banners: [],
  lastUpdated: new Date().toISOString()
};

const dbPath = path.join(__dirname, 'database.json');
fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');

console.log(`✅ Database seeded with ${categories.length} categories`);
console.log(`📁 File: ${dbPath}`);
