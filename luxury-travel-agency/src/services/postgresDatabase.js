// PostgreSQL Database Service
// This connects to the PostgreSQL database and provides CRUD operations

import axios from 'axios';

// Database configuration from environment variables
const DB_CONFIG = {
  host: process.env.VITE_DB_HOST || 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: process.env.VITE_DB_PORT || 5432,
  database: process.env.VITE_DB_NAME || 'gowritour',
  user: process.env.VITE_DB_USER || 'admin',
  password: process.env.VITE_DB_PASSWORD || 'London25@',
};

// API endpoint - this will be handled by the backend server
const API_BASE = '/api';

let isInitialized = false;

// Event listeners for data changes
const dataChangeListeners = [];

export const onDataChange = (callback) => {
  dataChangeListeners.push(callback);
  return () => {
    const index = dataChangeListeners.indexOf(callback);
    if (index > -1) {
      dataChangeListeners.splice(index, 1);
    }
  };
};

const notifyDataChange = (type) => {
  console.log('Database changed:', type);
  dataChangeListeners.forEach(callback => callback(type));
};

// Initialize database connection
export const initDatabase = async () => {
  if (isInitialized) {
    return true;
  }

  try {
    console.log('Initializing PostgreSQL database connection...');
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    if (response.data.status === 'ok') {
      console.log('✅ PostgreSQL database connected successfully');
      isInitialized = true;
      return true;
    }
  } catch (error) {
    console.warn('⚠️ PostgreSQL not connected yet:', error.message);
    console.warn('The app will continue to load, but data will be empty until the database is available.');
    // Don't throw - let the app load with empty data
    return false;
  }
};

export const isDatabaseReady = () => isInitialized;

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/categories`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching categories:', error.message);
    return [];
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/categories/${slug}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.warn('Error fetching category:', error.message);
    return null;
  }
};

export const createCategory = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/categories`, data);
    notifyDataChange('categories');
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (slug, data) => {
  try {
    const response = await axios.put(`${API_BASE}/categories/${slug}`, data);
    notifyDataChange('categories');
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (slug) => {
  try {
    await axios.delete(`${API_BASE}/categories/${slug}`);
    notifyDataChange('categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const deleteCategoryByName = async (name) => {
  try {
    await axios.delete(`${API_BASE}/categories/by-name/${name}`);
    notifyDataChange('categories');
  } catch (error) {
    console.error('Error deleting category by name:', error);
    throw error;
  }
};

// ==================== TOURS ====================
export const getTours = async () => {
  try {
    const response = await axios.get(`${API_BASE}/tours`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching tours:', error.message);
    return [];
  }
};

export const getTourBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/tours/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour:', error);
    return null;
  }
};

export const createTour = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/tours`, data);
    notifyDataChange('tours');
    return response.data;
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
};

export const updateTour = async (slug, data) => {
  try {
    const response = await axios.put(`${API_BASE}/tours/${slug}`, data);
    notifyDataChange('tours');
    return response.data;
  } catch (error) {
    console.error('Error updating tour:', error);
    throw error;
  }
};

export const deleteTour = async (slug) => {
  try {
    await axios.delete(`${API_BASE}/tours/${slug}`);
    notifyDataChange('tours');
  } catch (error) {
    console.error('Error deleting tour:', error);
    throw error;
  }
};

// ==================== HERO BANNERS ====================
export const getHeroBanners = async () => {
  try {
    const response = await axios.get(`${API_BASE}/hero-banners`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching hero banners:', error.message);
    return [];
  }
};

export const getHeroBannerById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/hero-banners/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hero banner:', error);
    return null;
  }
};

export const createHeroBanner = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/hero-banners`, data);
    notifyDataChange('banners');
    return response.data;
  } catch (error) {
    console.error('Error creating hero banner:', error);
    throw error;
  }
};

export const updateHeroBanner = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/hero-banners/${id}`, data);
    notifyDataChange('banners');
    return response.data;
  } catch (error) {
    console.error('Error updating hero banner:', error);
    throw error;
  }
};

export const deleteHeroBanner = async (id) => {
  try {
    await axios.delete(`${API_BASE}/hero-banners/${id}`);
    notifyDataChange('banners');
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    throw error;
  }
};

// ==================== LOGOS ====================
export const getLogos = async () => {
  try {
    const response = await axios.get(`${API_BASE}/logos`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
};

export const getLogoById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/logos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logo:', error);
    return null;
  }
};

export const createLogo = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/logos`, data);
    notifyDataChange('logos');
    return response.data;
  } catch (error) {
    console.error('Error creating logo:', error);
    throw error;
  }
};

export const updateLogo = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/logos/${id}`, data);
    notifyDataChange('logos');
    return response.data;
  } catch (error) {
    console.error('Error updating logo:', error);
    throw error;
  }
};

export const deleteLogo = async (id) => {
  try {
    await axios.delete(`${API_BASE}/logos/${id}`);
    notifyDataChange('logos');
  } catch (error) {
    console.error('Error deleting logo:', error);
    throw error;
  }
};

// ==================== ADS ====================
export const getAds = async () => {
  try {
    const response = await axios.get(`${API_BASE}/ads`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
};

// Dummy functions for compatibility
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const exportDatabase = async () => {
  console.log('Export not available for PostgreSQL - use pg_dump instead');
};

export const importDatabase = async () => {
  console.log('Import not available for PostgreSQL - use pg_restore instead');
};
