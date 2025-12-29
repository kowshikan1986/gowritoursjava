// Frontend data service - uses JSON database via API
import { initDatabase, getCategories, getTours, getHeroBanners, getLogos } from './jsonDatabase';

// Helper to normalize slugs
export const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Cache for frontend data to avoid re-fetching
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds cache - fast loading with quick updates
let isFetching = false; // Prevent parallel fetches
let initialLoadComplete = false;

// Clear cache (call when data is updated)
export const clearFrontendCache = () => {
  cachedData = null;
  cacheTimestamp = 0;
};

// Get cached data immediately (for instant display)
export const getCachedData = () => {
  return cachedData;
};

// Initialize database and fetch data for frontend
export const fetchFrontendData = async (forceRefresh = false) => {
  // Return cached data if still valid
  const now = Date.now();
  if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedData;
  }
  
  // If already fetching, wait for the existing request
  if (isFetching) {
    while (isFetching) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (cachedData) return cachedData;
  }
  
  isFetching = true;
  
  try {
    await initDatabase();
    
    const allCategories = await getCategories();
    const tours = await getTours();
    const banners = await getHeroBanners();
    const logos = await getLogos();
    
    // Map database field 'image' to frontend field 'background_image'
    const mappedBanners = (banners || []).map(banner => ({
      ...banner,
      background_image: banner.image || banner.background_image
    }));

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

    // Cache the result
    cachedData = {
      categories: rootCategories,
      allCategories: allCategories || [],
      tours: tours || [],
      banners: mappedBanners || [],
      logos: logos || [],
    };
    cacheTimestamp = Date.now();

    return cachedData;
  } catch (error) {
    console.error('fetchFrontendData ERROR - Failed to fetch frontend data:');
    console.error('Error:', error);
    // Return empty data structure if database fails
    return {
      categories: [],
      allCategories: [],
      tours: [],
      banners: [],
      logos: [],
    };
  } finally {
    isFetching = false; // Reset flag when done
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
