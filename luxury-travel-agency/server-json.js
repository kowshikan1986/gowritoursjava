import express from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression({ level: 9, threshold: 0 }));

// CORS configuration - allow all origins for deployment
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add cache control middleware for static files
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.woff2') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.gif')) {
    // Cache assets for long time (they have hashes in names)
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path === '/index.html' || req.path === '/') {
    // Never cache HTML - always fetch fresh
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0');
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ==================== JSON FILE DATABASE ====================
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database if doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    categories: [],
    tours: [],
    hero_banners: [],
    logos: [],
    ads: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  console.log('📝 Created new database.json file');
}

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { categories: [], tours: [], hero_banners: [], logos: [], ads: [] };
  }
};

// Write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Database saved to', DB_FILE);
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

// Helper to normalize slugs
const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ==================== API ROUTES ====================

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      path: imagePath,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'JSON File'
  });
});

// ==================== CATEGORIES ====================

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories || []);
});

app.get('/api/categories/:slug', (req, res) => {
  const db = readDB();
  const category = db.categories.find(c => c.slug === req.params.slug);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

app.post('/api/categories', (req, res) => {
  try {
    const db = readDB();
    const { id, name, slug, description, image, parent_id, visible, sort_order, highlights } = req.body;
    
    const generatedId = id || `cat-${Date.now()}`;
    const finalSlug = slug || normalize(name);
    
    const newCategory = {
      id: generatedId,
      name,
      slug: finalSlug,
      description: description || '',
      image: image || '',
      parent_id: parent_id || null,
      visible: visible !== false,
      sort_order: sort_order || 0,
      highlights: highlights || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.categories.push(newCategory);
    writeDB(db);
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.categories.findIndex(c => c.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { name, description, image, parent_id, visible, sort_order, highlights } = req.body;
    const current = db.categories[index];
    
    // Generate new slug from name if name is provided
    const newSlug = name ? normalize(name) : current.slug;
    
    // Use new image if provided, otherwise keep existing
    const imageToUse = (image !== undefined && image !== null && image !== '') ? image : current.image;
    const highlightsToUse = highlights !== undefined ? highlights : current.highlights;
    
    db.categories[index] = {
      ...current,
      name: name !== undefined ? name : current.name,
      description: description !== undefined ? description : current.description,
      image: imageToUse,
      parent_id: parent_id !== undefined ? parent_id : current.parent_id,
      visible: visible !== undefined ? visible : current.visible,
      sort_order: sort_order !== undefined ? sort_order : current.sort_order,
      slug: newSlug,
      highlights: highlightsToUse,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.categories[index]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.categories.findIndex(c => c.slug === req.params.slug || c.id === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const deleted = db.categories.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Category deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/by-name/:name', (req, res) => {
  try {
    const db = readDB();
    const initialLength = db.categories.length;
    db.categories = db.categories.filter(c => c.name !== req.params.name);
    const deleted = initialLength - db.categories.length;
    
    writeDB(db);
    res.json({ message: 'Category deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting category by name:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

app.get('/api/tours', (req, res) => {
  const db = readDB();
  res.json(db.tours || []);
});

app.get('/api/tours/:slug', (req, res) => {
  const db = readDB();
  const tour = db.tours.find(t => t.slug === req.params.slug);
  if (!tour) {
    return res.status(404).json({ error: 'Tour not found' });
  }
  res.json(tour);
});

app.post('/api/tours', (req, res) => {
  try {
    const db = readDB();
    const { title, slug, description, price, duration, location, category_id, featured_image, is_active, is_featured, tour_code, details } = req.body;
    
    const tourSlug = slug || normalize(title);
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newTour = {
      id,
      title,
      slug: tourSlug,
      description,
      price,
      duration,
      location,
      category_id,
      featured_image: featured_image || '',
      is_active: is_active !== false,
      is_featured: is_featured || false,
      tour_code: tour_code || '',
      details_json: details || '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.tours.push(newTour);
    writeDB(db);
    
    res.status(201).json(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tours/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.tours.findIndex(t => t.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    const current = db.tours[index];
    const { title, description, price, duration, location, category_id, featured_image, is_active, is_featured, tour_code, details } = req.body;
    
    db.tours[index] = {
      ...current,
      title: title !== undefined ? title : current.title,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? price : current.price,
      duration: duration !== undefined ? duration : current.duration,
      location: location !== undefined ? location : current.location,
      category_id: category_id !== undefined ? category_id : current.category_id,
      featured_image: featured_image !== undefined ? featured_image : current.featured_image,
      is_active: is_active !== undefined ? is_active : current.is_active,
      is_featured: is_featured !== undefined ? is_featured : current.is_featured,
      tour_code: tour_code !== undefined ? tour_code : current.tour_code,
      details_json: details !== undefined ? details : current.details_json,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.tours[index]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tours/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.tours.findIndex(t => t.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    const deleted = db.tours.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Tour deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

app.get('/api/hero-banners', (req, res) => {
  const db = readDB();
  res.json(db.hero_banners || []);
});

app.get('/api/hero-banners/:id', (req, res) => {
  const db = readDB();
  const banner = db.hero_banners.find(b => b.id === req.params.id);
  if (!banner) {
    return res.status(404).json({ error: 'Hero banner not found' });
  }
  res.json(banner);
});

app.post('/api/hero-banners', (req, res) => {
  try {
    const db = readDB();
    const { title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    
    const newBanner = {
      id: Date.now().toString(),
      title,
      subtitle,
      cta_text,
      cta_link,
      background_image: background_image || image || '',
      image: image || background_image || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.hero_banners.push(newBanner);
    writeDB(db);
    
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/hero-banners/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.hero_banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    db.hero_banners[index] = {
      ...db.hero_banners[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.hero_banners[index]);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/hero-banners/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.hero_banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const deleted = db.hero_banners.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Hero banner deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', (req, res) => {
  const db = readDB();
  res.json(db.logos || []);
});

app.get('/api/logos/:id', (req, res) => {
  const db = readDB();
  const logo = db.logos.find(l => l.id === req.params.id);
  if (!logo) {
    return res.status(404).json({ error: 'Logo not found' });
  }
  res.json(logo);
});

app.post('/api/logos', (req, res) => {
  try {
    const db = readDB();
    const { title, name, image, image_url, is_active } = req.body;
    
    const newLogo = {
      id: Date.now().toString(),
      title,
      name: name || title,
      image: image || image_url || '',
      image_url: image_url || image || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.logos.push(newLogo);
    writeDB(db);
    
    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/logos/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.logos.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    db.logos[index] = {
      ...db.logos[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.logos[index]);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/logos/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.logos.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    const deleted = db.logos.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Logo deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS ====================

app.get('/api/ads', (req, res) => {
  const db = readDB();
  res.json(db.ads || []);
});

app.post('/api/ads', (req, res) => {
  try {
    const db = readDB();
    const newAd = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.ads.push(newAd);
    writeDB(db);
    
    res.status(201).json(newAd);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/ads/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.ads.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    db.ads[index] = {
      ...db.ads[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.ads[index]);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/ads/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.ads.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    const deleted = db.ads.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Ad deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATABASE EXPORT ====================

// Export database as JSON file download
app.get('/api/export-database', (req, res) => {
  try {
    const db = readDB();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_backup_${timestamp}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(db);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FRONTEND ====================

// Serve React app for all other routes
app.get('*', (req, res) => {
  // Never cache HTML
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('📁 Serving static files from:', path.join(__dirname, 'dist'));
  console.log('💾 Database: JSON File (data/database.json)');
  console.log('✅ No PostgreSQL required!');
  console.log(`  ➜  Local:   http://localhost:${PORT}/`);
});
