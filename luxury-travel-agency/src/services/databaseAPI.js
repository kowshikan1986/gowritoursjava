/**
 * Database API Service
 * Connects to JSON server (http://localhost:3000/api)
 * Handles all API calls for categories, tours, hero banners, and logos
 */

import client from '../api/client';

let dbInitialized = false;

// Helper to normalize slugs
export const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Initialize database (check connection)
export const initDatabase = async () => {
  if (dbInitialized) {
    console.log('Database API already connected');
    return true;
  }

  try {
    console.log('Connecting to JSON database server...');
    const response = await client.get('/health');
    if (response.data.status === 'ok') {
      console.log('✅ Connected to JSON database successfully');
      dbInitialized = true;
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to connect to JSON API server:', error.message);
    console.error('Make sure the server is running: npm start');
    throw new Error('Database API server not available. Run: npm start');
  }
};

// Check if database is ready
export const isDatabaseReady = () => dbInitialized;

// ==================== CATEGORIES ====================

export const getCategories = async () => {
  try {
    const response = await client.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await client.get(`/categories/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const createCategory = async (data) => {
  const id = data.id || `cat-${Date.now()}`;
  const slug = data.slug || normalize(data.name);
  
  // Handle image upload if provided
  let imageUrl = data.image || '';
  if (data.imageFile instanceof File) {
    try {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.path;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  const categoryData = {
    id,
    name: data.name,
    slug,
    description: data.description || '',
    image: imageUrl,
    parent_id: data.parent_id || null,
    visible: data.visible !== undefined ? data.visible : true,
    sort_order: data.sort_order || 0,
  };

  const response = await client.post('/categories', categoryData);
  return { ...categoryData, ...response.data };
};

export const updateCategory = async (slug, data) => {
  // Handle image upload if provided
  let updateData = { ...data };
  if (data.imageFile instanceof File) {
    try {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        updateData.image = uploadData.path;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  delete updateData.imageFile; // Remove the File object before sending
  
  const response = await client.put(`/categories/${slug}`, updateData);
  return response.data;
};

export const deleteCategory = async (slug) => {
  const response = await client.delete(`/categories/${slug}`);
  return response.data;
};

// ==================== TOURS ====================

export const getTours = async () => {
  try {
    const response = await client.get('/tours');
    return response.data;
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
};

export const getTourBySlug = async (slug) => {
  try {
    const response = await client.get(`/tours/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour:', error);
    return null;
  }
};

export const createTour = async (data) => {
  const id = data.id || `tour-${Date.now()}`;
  const slug = data.slug || normalize(data.title);
  
  const tourData = {
    id,
    title: data.title,
    slug,
    description: data.description || '',
    price: data.price || 0,
    duration: data.duration || '',
    location: data.location || '',
    featured_image: data.featured_image || '',
    is_active: data.is_active !== undefined ? data.is_active : true,
    is_featured: data.is_featured !== undefined ? data.is_featured : false,
    category_id: data.category_id || 'uncategorized',
  };

  const response = await client.post('/tours', tourData);
  return { ...tourData, ...response.data };
};

export const updateTour = async (slug, data) => {
  const response = await client.put(`/tours/${slug}`, data);
  return response.data;
};

export const deleteTour = async (slug) => {
  const response = await client.delete(`/tours/${slug}`);
  return response.data;
};

// ==================== HERO BANNERS ====================

export const getHeroBanners = async () => {
  try {
    const response = await client.get('/hero-banners');
    return response.data;
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }
};

export const createHeroBanner = async (data) => {
  const id = data.id || `hero-${Date.now()}`;
  
  const bannerData = {
    id,
    title: data.title,
    subtitle: data.subtitle || '',
    background_image: data.background_image || '',
    cta_text: data.cta_text || '',
    cta_link: data.cta_link || '',
    is_active: data.is_active !== undefined ? data.is_active : true,
    priority: data.priority || 0,
  };

  const response = await client.post('/hero-banners', bannerData);
  return { ...bannerData, ...response.data };
};

export const updateHeroBanner = async (id, data) => {
  const response = await client.put(`/hero-banners/${id}`, data);
  return response.data;
};

export const deleteHeroBanner = async (id) => {
  const response = await client.delete(`/hero-banners/${id}`);
  return response.data;
};

// ==================== LOGOS ====================

export const getLogos = async () => {
  try {
    const response = await client.get('/logos');
    return response.data;
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
};

export const createLogo = async (data) => {
  const id = data.id || `logo-${Date.now()}`;
  
  // Handle image upload if provided
  let imageUrl = data.image || '';
  if (data.imageFile instanceof File) {
    try {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.path;
      }
    } catch (error) {
      console.error('Error uploading logo image:', error);
    }
  }
  
  const logoData = {
    id,
    title: data.title,
    image: imageUrl,
    is_active: data.is_active !== undefined ? data.is_active : true,
  };

  const response = await client.post('/logos', logoData);
  return { ...logoData, ...response.data };
};

export const updateLogo = async (id, data) => {
  // Handle image upload if provided
  let updateData = { ...data };
  if (data.imageFile instanceof File) {
    try {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        updateData.image = uploadData.path;
      }
    } catch (error) {
      console.error('Error uploading logo image:', error);
    }
  }
  delete updateData.imageFile; // Remove the File object before sending
  
  const response = await client.put(`/logos/${id}`, updateData);
  return response.data;
};

export const deleteLogo = async (id) => {
  const response = await client.delete(`/logos/${id}`);
  return response.data;
};

// ==================== ADS (PLACEHOLDER) ====================

export const getAds = async () => {
  return []; // Not implemented in API yet
};

// ==================== DATABASE EXPORT ====================

export const exportDatabase = async () => {
  try {
    window.open('http://localhost:3000/api/export-database', '_blank');
  } catch (error) {
    console.error('Error exporting database:', error);
  }
};

export const importDatabase = async (file) => {
  console.warn('Import database not implemented for JSON server');
  console.log('Please replace the data/database.json file manually');
};
