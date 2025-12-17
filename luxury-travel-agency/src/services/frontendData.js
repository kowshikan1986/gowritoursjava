// Frontend data service - converts database structure to frontend format
import { initDatabase, getCategories, getTours, getHeroBanners, onDataChange } from './database';

// Helper to normalize slugs
export const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Cache for frontend data to avoid re-fetching
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Clear cache (call when data is updated)
export const clearFrontendCache = () => {
  cachedData = null;
  cacheTimestamp = 0;
  console.log('Frontend data cache cleared');
};

// Listen for database changes and clear cache
onDataChange((type) => {
  console.log('Frontend cache: Database changed, clearing cache...', type);
  clearFrontendCache();
});

// Initialize database and fetch data for frontend (with caching)
export const fetchFrontendData = async (forceRefresh = false) => {
  // Return cached data if still valid
  const now = Date.now();
  if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('fetchFrontendData: Using cached data');
    return cachedData;
  }
  
  try {
    console.log('fetchFrontendData: Initializing database...');
    await initDatabase();
    console.log('fetchFrontendData: Database initialized, fetching data...');
    
    const allCategories = getCategories();
    const tours = getTours();
    const banners = getHeroBanners();

    console.log('fetchFrontendData: Raw data -', {
      categoriesCount: allCategories?.length || 0,
      toursCount: tours?.length || 0,
      bannersCount: banners?.length || 0
    });

    // Build category tree structure
    const categoryMap = new Map();
    (allCategories || []).forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        tours: [],
        subcategories: [],
      });
    });

    // Build tree structure
    const rootCategories = [];
    (allCategories || []).forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Assign tours to categories
    (tours || []).forEach(tour => {
      if (tour.category_id) {
        const category = categoryMap.get(tour.category_id);
        if (category) {
          category.tours.push(tour);
        }
      }
    });

    console.log('fetchFrontendData: Root categories found:', rootCategories.length);
    console.log('fetchFrontendData: Root category names:', rootCategories.map(c => c.name));

    // Cache the result
    cachedData = {
      categories: rootCategories,
      allCategories: allCategories || [],
      tours: tours || [],
      banners: banners || [],
    };
    cacheTimestamp = Date.now();

    return cachedData;
  } catch (error) {
    console.error('fetchFrontendData ERROR - Failed to fetch frontend data:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    // Return empty data structure if database fails
    return {
      categories: [],
      allCategories: [],
      tours: [],
      banners: [],
    };
  }
};

// Convert database categories to frontend format
export const formatCategoryForFrontend = (dbCategory, allCategories, allTours) => {
  // Get subcategories
  const subcategories = allCategories
    .filter(c => c.parent_id === dbCategory.id)
    .map(sub => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      image: sub.image,
    }));

  // Get tours for this category
  const categoryTours = allTours
    .filter(t => t.category_id === dbCategory.id && t.is_active)
    .map(tour => ({
      id: tour.slug,
      title: tour.title,
      price: tour.price ? `From £${tour.price}` : 'From £—',
      location: tour.location,
      description: tour.description,
      image: tour.featured_image,
      duration: tour.duration,
    }));

  return {
    id: dbCategory.slug || dbCategory.id,
    title: dbCategory.name,
    location: dbCategory.description || '',
    price: categoryTours.length > 0 ? categoryTours[0].price : 'From £—',
    shortDescription: dbCategory.description || '',
    fullDescription: dbCategory.description || '',
    image: dbCategory.image || '',
    packages: categoryTours,
    subcategories: subcategories,
    features: [],
    seo: {
      title: dbCategory.name,
      description: dbCategory.description || '',
    },
  };
};

