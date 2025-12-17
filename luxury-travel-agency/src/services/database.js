import initSqlJs from 'sql.js';

let db = null;
let SQL = null;
let initPromise = null; // Prevent multiple concurrent initializations
const DB_NAME = 'travel_agency_db';
const DB_STORE = 'database';

// Event listeners for data changes
const dataChangeListeners = [];

// Subscribe to data changes
export const onDataChange = (callback) => {
  dataChangeListeners.push(callback);
  return () => {
    const index = dataChangeListeners.indexOf(callback);
    if (index > -1) {
      dataChangeListeners.splice(index, 1);
    }
  };
};

// Notify all listeners of data change
const notifyDataChange = (type) => {
  console.log('Database changed:', type);
  dataChangeListeners.forEach(callback => callback(type));
};

// IndexedDB helper functions
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
  });
};

const loadDatabaseFromIndexedDB = async () => {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction([DB_STORE], 'readonly');
      const store = transaction.objectStore(DB_STORE);
      const request = store.get('sqlite');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error loading from IndexedDB:', err);
    return null;
  }
};

const saveDatabaseToIndexedDB = async (data) => {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction([DB_STORE], 'readwrite');
      const store = transaction.objectStore(DB_STORE);
      const request = store.put(data, 'sqlite');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
  }
};

// Export database as downloadable file
export const exportDatabase = () => {
  if (!db) return;
  const data = db.export();
  const blob = new Blob([data], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `travel_agency_db_${Date.now()}.sqlite`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import database from file
export const importDatabase = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        db = new SQL.Database(uint8Array);
        await saveDatabaseToIndexedDB(uint8Array);
        resolve(db);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Initialize database
export const initDatabase = async () => {
  // Return existing database if already initialized
  if (db) {
    return db;
  }
  
  // If initialization is in progress, wait for it
  if (initPromise) {
    console.log('Database initialization in progress, waiting...');
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log('Initializing SQL.js...');
      // Load SQL.js - use local WASM file for faster loading
      if (!SQL) {
        SQL = await initSqlJs({
          locateFile: (file) => `/sql-wasm.wasm`,
        });
        console.log('SQL.js loaded successfully (local WASM)');
      }

    // Try to load existing database from IndexedDB
    console.log('Loading database from IndexedDB...');
    const savedDb = await loadDatabaseFromIndexedDB();
    if (savedDb && savedDb instanceof Uint8Array) {
      try {
        console.log('Found existing database, loading...');
        db = new SQL.Database(savedDb);
        console.log('Existing database loaded successfully');
        // Run migration to add any missing columns
        await runMigrations();
      } catch (err) {
        console.error('Error loading saved database:', err);
        console.log('Creating new database...');
        db = new SQL.Database();
        await createSchema();
        console.log('New database created');
      }
    } else {
      // Create new database
      console.log('No existing database found, creating new one...');
      db = new SQL.Database();
      await createSchema();
      console.log('New database created with schema');
    }

    console.log('Database initialization complete');
      return db;
    } catch (error) {
      console.error('Database initialization error:', error);
      initPromise = null; // Reset so we can retry
      // If SQL.js failed to load, try with CDN fallback
      try {
        if (!SQL) {
          const script = document.createElement('script');
          script.src = 'https://sql.js.org/dist/sql-wasm.js';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          SQL = await initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
          });
        }
        db = new SQL.Database();
        await createSchema();
        return db;
      } catch (fallbackError) {
        console.error('Database initialization failed completely:', fallbackError);
        initPromise = null;
        throw fallbackError;
      }
    }
  })();
  
  return initPromise;
};

// Save database to IndexedDB
const saveDatabase = async () => {
  if (!db) {
    console.warn('Database not initialized, cannot save');
    return;
  }
  try {
    const data = db.export();
    await saveDatabaseToIndexedDB(data);
    console.log('Database saved to IndexedDB successfully');
  } catch (err) {
    console.error('Error saving database to IndexedDB:', err);
    throw err;
  }
};

// Run database migrations to add missing columns
const runMigrations = async () => {
  if (!db) return;
  
  console.log('Running database migrations...');
  
  // Migration: Add tour_code and details_json columns to tours table
  try {
    const tableInfo = db.exec('PRAGMA table_info(tours)');
    if (tableInfo.length > 0) {
      const columns = tableInfo[0].values.map(row => row[1]);
      let columnsAdded = false;
      
      if (!columns.includes('tour_code')) {
        console.log('✅ Adding tour_code column to tours table...');
        db.run('ALTER TABLE tours ADD COLUMN tour_code TEXT DEFAULT ""');
        columnsAdded = true;
      }
      
      if (!columns.includes('details_json')) {
        console.log('✅ Adding details_json column to tours table...');
        db.run('ALTER TABLE tours ADD COLUMN details_json TEXT DEFAULT "{}"');
        columnsAdded = true;
      }
      
      if (columnsAdded) {
        console.log('✅ New columns added successfully. Saving database...');
        await saveDatabase();
        console.log('✅ Database migration complete!');
      } else {
        console.log('ℹ️ Database is up to date, no migrations needed.');
      }
    }
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  }
};

// Create database schema
const createSchema = async () => {
  if (!db) return;

  // Categories table (supports parent-child relationships)
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      parent_id TEXT,
      visible INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    )
  `);

  // Tours table
  db.run(`
    CREATE TABLE IF NOT EXISTS tours (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      price REAL DEFAULT 0,
      duration TEXT DEFAULT '',
      location TEXT DEFAULT '',
      featured_image TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      category_id TEXT NOT NULL,
      tour_code TEXT DEFAULT '',
      details_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Hero Banners table
  db.run(`
    CREATE TABLE IF NOT EXISTS hero_banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      cta_text TEXT DEFAULT '',
      cta_link TEXT DEFAULT '',
      background_image TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Logos table
  db.run(`
    CREATE TABLE IF NOT EXISTS logos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ads table (for future use)
  db.run(`
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT DEFAULT '',
      priority INTEGER DEFAULT 10,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Check if database is empty (new database)
  const categoriesCount = db.exec('SELECT COUNT(*) as count FROM categories');
  const isEmpty = categoriesCount.length === 0 || categoriesCount[0].values[0][0] === 0;
  
  if (isEmpty) {
    console.log('🌱 New database detected - auto-seeding with default data...');
    // Import the seeding function dynamically to avoid circular dependency
    try {
      const { importAllCategories } = await import('./importData.js');
      await importAllCategories();
      console.log('✅ Database seeded successfully!');
    } catch (err) {
      console.error('❌ Failed to seed database:', err);
    }
  }

  // Don't save during initial schema creation, will be saved when data is added
};

// Helper: Generate ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper: Generate slug from name/title
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper: Convert file to base64
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

// Check if database is initialized
export const isDatabaseReady = () => {
  return db !== null;
};

// ==================== CATEGORIES ====================
export const getCategories = () => {
  if (!db) {
    console.warn('Database not initialized in getCategories');
    return [];
  }
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order, name');
    const categories = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      categories.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        image: row.image || '',
        parent_id: row.parent_id || null,
        visible: row.visible === 1,
        sort_order: row.sort_order || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    }
    stmt.free();
    console.log(`getCategories returned ${categories.length} categories`);
    return categories;
  } catch (err) {
    console.error('Error in getCategories:', err);
    return [];
  }
};

export const getCategoryBySlug = (slug) => {
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
  stmt.bind([slug]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if (!result) return null;
  return {
    id: result.id,
    name: result.name,
    slug: result.slug,
    description: result.description || '',
    image: result.image || '',
    parent_id: result.parent_id || null,
    visible: result.visible === 1,
    sort_order: result.sort_order || 0,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

export const createCategory = async (data) => {
  if (!db) await initDatabase();
  
  // Check if category with same slug already exists
  const existingSlug = data.slug || generateSlug(data.name);
  const existing = getCategoryBySlug(existingSlug);
  if (existing) {
    console.log(`Category with slug "${existingSlug}" already exists, skipping creation`);
    return existing;
  }
  
  const id = generateId();
  const slug = data.slug || generateSlug(data.name);
  
  // Convert image to base64 if provided as file, otherwise use as-is (could be URL or base64)
  let image = data.image || '';
  if (data.imageFile) {
    image = await fileToBase64(data.imageFile);
  }

  try {
    db.run(
      'INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [
        id,
        data.name,
        slug,
        data.description || '',
        image,
        data.parent_id || null,
        data.visible !== false ? 1 : 0,
        data.sort_order || 0,
      ]
    );
    await saveDatabase();
    console.log(`Category "${data.name}" saved to SQL database with ${image ? 'image' : 'no image'}`);
    return { id, slug, name: data.name, description: data.description || '', image, parent_id: data.parent_id || null };
  } catch (err) {
    console.error('Error creating category:', err);
    throw new Error(`Failed to save category to database: ${err.message}`);
  }
};

export const updateCategory = async (slug, data) => {
  if (!db) await initDatabase();
  const category = getCategoryBySlug(slug);
  if (!category) throw new Error('Category not found');

  let image = category.image;
  if (data.imageFile) {
    image = await fileToBase64(data.imageFile);
  } else if (data.image !== undefined) {
    image = data.image || '';
  }

  db.run(
    'UPDATE categories SET name = ?, description = ?, image = ?, parent_id = ?, visible = ?, sort_order = ?, updated_at = datetime("now") WHERE slug = ?',
    [
      data.name !== undefined ? data.name : category.name,
      data.description !== undefined ? data.description : category.description,
      image,
      data.parent_id !== undefined ? data.parent_id : category.parent_id,
      data.visible !== undefined ? (data.visible ? 1 : 0) : category.visible ? 1 : 0,
      data.sort_order !== undefined ? data.sort_order : category.sort_order,
      slug,
    ]
  );
  await saveDatabase();
  return getCategoryBySlug(slug);
};

export const deleteCategory = async (slug) => {
  if (!db) return;
  db.run('DELETE FROM categories WHERE slug = ?', [slug]);
  await saveDatabase();
  // Notify listeners that data changed
  notifyDataChange('categories');
};

// Delete category by name (helper function)
export const deleteCategoryByName = async (name) => {
  if (!db) return;
  db.run('DELETE FROM categories WHERE name = ?', [name]);
  await saveDatabase();
  notifyDataChange('categories');
};

// ==================== TOURS ====================
export const getTours = () => {
  if (!db) {
    console.warn('Database not initialized in getTours');
    return [];
  }
  try {
    const stmt = db.prepare(`
      SELECT t.*, c.name as category_name 
      FROM tours t 
      LEFT JOIN categories c ON t.category_id = c.id 
      ORDER BY t.created_at DESC
    `);
    const tours = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      tours.push({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description || '',
        price: row.price || 0,
        duration: row.duration || '',
        location: row.location || '',
        featured_image: row.featured_image || '',
        is_active: row.is_active === 1,
        is_featured: row.is_featured === 1,
        category_id: row.category_id,
        category_name: row.category_name || '',
        tour_code: row.tour_code || '',
        details_json: row.details_json || '{}',
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    }
    stmt.free();
    console.log(`getTours returned ${tours.length} tours`);
    return tours;
  } catch (err) {
    console.error('Error in getTours:', err);
    return [];
  }
};

export const getTourBySlug = (slug) => {
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM tours WHERE slug = ?');
  stmt.bind([slug]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if (!result) return null;
  return {
    id: result.id,
    title: result.title,
    slug: result.slug,
    description: result.description || '',
    price: result.price || 0,
    duration: result.duration || '',
    location: result.location || '',
    featured_image: result.featured_image || '',
    is_active: result.is_active === 1,
    is_featured: result.is_featured === 1,
    category_id: result.category_id,
    tour_code: result.tour_code || '',
    details_json: result.details_json || '{}',
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

export const createTour = async (data) => {
  if (!db) await initDatabase();
  const id = generateId();
  const slug = data.slug || generateSlug(data.title);
  const featured_image = data.featured_imageFile
    ? await fileToBase64(data.featured_imageFile)
    : data.featured_image || '';

  db.run(
    'INSERT INTO tours (id, title, slug, description, price, duration, location, featured_image, is_active, is_featured, category_id, tour_code, details_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
    [
      id,
      data.title,
      slug,
      data.description || '',
      parseFloat(data.price || 0),
      data.duration || '',
      data.location || '',
      featured_image,
      data.is_active !== false ? 1 : 0,
      data.is_featured ? 1 : 0,
      data.category || data.category_id,
      data.tour_code || '',
      JSON.stringify(data.details || {}),
    ]
  );
  await saveDatabase();
  notifyDataChange('tours');
  return { id, slug, ...data, featured_image };
};

export const updateTour = async (slug, data) => {
  if (!db) await initDatabase();
  const tour = getTourBySlug(slug);
  if (!tour) throw new Error('Tour not found');

  let featured_image = tour.featured_image;
  if (data.featured_imageFile) {
    featured_image = await fileToBase64(data.featured_imageFile);
  } else if (data.featured_image !== undefined) {
    featured_image = data.featured_image || '';
  }

  db.run(
    'UPDATE tours SET title = ?, description = ?, price = ?, duration = ?, location = ?, featured_image = ?, is_active = ?, is_featured = ?, category_id = ?, tour_code = ?, details_json = ?, updated_at = datetime("now") WHERE slug = ?',
    [
      data.title !== undefined ? data.title : tour.title,
      data.description !== undefined ? data.description : tour.description,
      data.price !== undefined ? parseFloat(data.price) : tour.price,
      data.duration !== undefined ? data.duration : tour.duration,
      data.location !== undefined ? data.location : tour.location,
      featured_image,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : tour.is_active ? 1 : 0,
      data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : tour.is_featured ? 1 : 0,
      data.category || data.category_id || tour.category_id,
      data.tour_code !== undefined ? data.tour_code : tour.tour_code,
      data.details !== undefined ? JSON.stringify(data.details) : tour.details_json,
      slug,
    ]
  );
  await saveDatabase();
  return getTourBySlug(slug);
};

export const deleteTour = async (slug) => {
  if (!db) return;
  db.run('DELETE FROM tours WHERE slug = ?', [slug]);
  await saveDatabase();
  notifyDataChange('tours');
};

// ==================== HERO BANNERS ====================
export const getHeroBanners = () => {
  if (!db) return [];
  const stmt = db.prepare('SELECT * FROM hero_banners ORDER BY priority, created_at DESC');
  const banners = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    banners.push({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || '',
      cta_text: row.cta_text || '',
      cta_link: row.cta_link || '',
      background_image: row.background_image || '',
      is_active: row.is_active === 1,
      priority: row.priority || 10,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
  stmt.free();
  return banners;
};

export const getHeroBannerById = (id) => {
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM hero_banners WHERE id = ?');
  stmt.bind([id]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if (!result) return null;
  return {
    id: result.id,
    title: result.title,
    subtitle: result.subtitle || '',
    cta_text: result.cta_text || '',
    cta_link: result.cta_link || '',
    background_image: result.background_image || '',
    is_active: result.is_active === 1,
    priority: result.priority || 10,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

export const createHeroBanner = async (data) => {
  if (!db) await initDatabase();
  const id = generateId();
  const background_image = data.background_imageFile
    ? await fileToBase64(data.background_imageFile)
    : data.background_image || '';

  db.run(
    'INSERT INTO hero_banners (id, title, subtitle, cta_text, cta_link, background_image, is_active, priority, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
    [
      id,
      data.title,
      data.subtitle || '',
      data.cta_text || '',
      data.cta_link || '',
      background_image,
      data.is_active !== false ? 1 : 0,
      parseInt(data.priority || 10),
    ]
  );
  await saveDatabase();
  return { id, ...data, background_image };
};

export const updateHeroBanner = async (id, data) => {
  if (!db) await initDatabase();
  const banner = getHeroBannerById(id);
  if (!banner) throw new Error('Hero banner not found');

  let background_image = banner.background_image;
  if (data.background_imageFile) {
    background_image = await fileToBase64(data.background_imageFile);
  } else if (data.background_image !== undefined) {
    background_image = data.background_image || '';
  }

  db.run(
    'UPDATE hero_banners SET title = ?, subtitle = ?, cta_text = ?, cta_link = ?, background_image = ?, is_active = ?, priority = ?, updated_at = datetime("now") WHERE id = ?',
    [
      data.title !== undefined ? data.title : banner.title,
      data.subtitle !== undefined ? data.subtitle : banner.subtitle,
      data.cta_text !== undefined ? data.cta_text : banner.cta_text,
      data.cta_link !== undefined ? data.cta_link : banner.cta_link,
      background_image,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : banner.is_active ? 1 : 0,
      data.priority !== undefined ? parseInt(data.priority) : banner.priority,
      id,
    ]
  );
  await saveDatabase();
  return getHeroBannerById(id);
};

export const deleteHeroBanner = async (id) => {
  if (!db) return;
  db.run('DELETE FROM hero_banners WHERE id = ?', [id]);
  await saveDatabase();
};

// ==================== LOGOS ====================
export const getLogos = () => {
  if (!db) return [];
  const stmt = db.prepare('SELECT * FROM logos ORDER BY created_at DESC');
  const logos = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    logos.push({
      id: row.id,
      title: row.title,
      image: row.image || '',
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
  stmt.free();
  return logos;
};

export const getLogoById = (id) => {
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM logos WHERE id = ?');
  stmt.bind([id]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if (!result) return null;
  return {
    id: result.id,
    title: result.title,
    image: result.image || '',
    is_active: result.is_active === 1,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

export const createLogo = async (data) => {
  if (!db) await initDatabase();
  const id = generateId();
  const image = data.imageFile ? await fileToBase64(data.imageFile) : (data.image || '');

  db.run(
    'INSERT INTO logos (id, title, image, is_active, updated_at) VALUES (?, ?, ?, ?, datetime("now"))',
    [id, data.title, image, data.is_active !== false ? 1 : 0]
  );
  await saveDatabase();
  return { id, ...data, image };
};

export const updateLogo = async (id, data) => {
  if (!db) await initDatabase();
  const logo = getLogoById(id);
  if (!logo) throw new Error('Logo not found');

  let image = logo.image;
  if (data.imageFile) {
    image = await fileToBase64(data.imageFile);
  } else if (data.image !== undefined) {
    image = data.image || '';
  }

  db.run(
    'UPDATE logos SET title = ?, image = ?, is_active = ?, updated_at = datetime("now") WHERE id = ?',
    [
      data.title !== undefined ? data.title : logo.title,
      image,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : logo.is_active ? 1 : 0,
      id,
    ]
  );
  await saveDatabase();
  return getLogoById(id);
};

export const deleteLogo = async (id) => {
  if (!db) return;
  db.run('DELETE FROM logos WHERE id = ?', [id]);
  await saveDatabase();
};

// ==================== ADS ====================
export const getAds = () => {
  if (!db) return [];
  const stmt = db.prepare('SELECT * FROM ads ORDER BY priority, created_at DESC');
  const ads = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    ads.push({
      id: row.id,
      title: row.title,
      image: row.image || '',
      priority: row.priority || 10,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
  stmt.free();
  return ads;
};

