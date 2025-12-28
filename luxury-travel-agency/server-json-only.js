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
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5002);

// ==================== JSON DATABASE (NO POSTGRESQL) ====================
let jsonDatabase = null;

// Load JSON database
function loadDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    if (fs.existsSync(dbPath)) {
      jsonDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      console.log('📦 JSON database loaded');
      return true;
    } else {
      console.error('❌ database.json not found!');
      return false;
    }
  } catch (err) {
    console.error('❌ Could not load JSON database:', err.message);
    return false;
  }
}

// Save JSON database
function saveDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(jsonDatabase, null, 2), 'utf8');
    console.log('✅ Database saved');
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
  }
}

// Initialize database
loadDatabase();

// Middleware
app.use(compression({ level: 9, threshold: 0 }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ==================== API ROUTES ====================

// Upload image
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
    database: 'json'
  });
});

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    res.set('Cache-Control', 'public, max-age=1');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', (req, res) => {
  try {
    const category = jsonDatabase?.categories?.find(c => c.slug === req.params.slug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', (req, res) => {
  try {
    const newCategory = {
      ...req.body,
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonDatabase.categories.push(newCategory);
    saveDatabase();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category (by slug)
app.put('/api/categories/:slug', (req, res) => {
  try {
    const normalizedSlug = normalize(req.params.slug);
    const index = jsonDatabase.categories.findIndex(c => normalize(c.slug) === normalizedSlug);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    jsonDatabase.categories[index] = {
      ...jsonDatabase.categories[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDatabase();
    res.json(jsonDatabase.categories[index]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category (by slug)
app.delete('/api/categories/:slug', (req, res) => {
  try {
    const normalizedSlug = normalize(req.params.slug);
    const index = jsonDatabase.categories.findIndex(c => normalize(c.slug) === normalizedSlug);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    jsonDatabase.categories.splice(index, 1);
    saveDatabase();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

app.get('/api/tours', (req, res) => {
  try {
    const tours = jsonDatabase?.tours || [];
    res.set('Cache-Control', 'public, max-age=1');
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

app.get('/api/hero-banners', (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    res.set('Cache-Control', 'public, max-age=1');
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hero banner
app.post('/api/hero-banners', (req, res) => {
  try {
    const newBanner = {
      ...req.body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonDatabase.hero_banners.push(newBanner);
    saveDatabase();
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hero banner
app.put('/api/hero-banners/:id', (req, res) => {
  try {
    const index = jsonDatabase.hero_banners.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    jsonDatabase.hero_banners[index] = {
      ...jsonDatabase.hero_banners[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDatabase();
    res.json(jsonDatabase.hero_banners[index]);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hero banner
app.delete('/api/hero-banners/:id', (req, res) => {
  try {
    const index = jsonDatabase.hero_banners.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    jsonDatabase.hero_banners.splice(index, 1);
    saveDatabase();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', (req, res) => {
  try {
    const logos = jsonDatabase?.logos || [];
    res.set('Cache-Control', 'public, max-age=1');
    res.json(logos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update logo
app.post('/api/logos', (req, res) => {
  try {
    const newLogo = {
      ...req.body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonDatabase.logos.push(newLogo);
    saveDatabase();
    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/logos/:id', (req, res) => {
  try {
    const index = jsonDatabase.logos.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    jsonDatabase.logos[index] = {
      ...jsonDatabase.logos[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDatabase();
    res.json(jsonDatabase.logos[index]);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS ====================

app.get('/api/ads', (req, res) => {
  try {
    const ads = jsonDatabase?.ads || [];
    res.set('Cache-Control', 'public, max-age=1');
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ads', (req, res) => {
  try {
    const newAd = {
      ...req.body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonDatabase.ads.push(newAd);
    saveDatabase();
    res.status(201).json(newAd);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/ads/:id', (req, res) => {
  try {
    const index = jsonDatabase.ads.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    jsonDatabase.ads[index] = {
      ...jsonDatabase.ads[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDatabase();
    res.json(jsonDatabase.ads[index]);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FALLBACK ====================

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🗄️  Database: JSON-only (PostgreSQL disabled)`);
  console.log(`📦 Categories: ${jsonDatabase?.categories?.length || 0}`);
  console.log(`📷 Images: Local folder (public/uploads)`);
  console.log(`${'='.repeat(50)}\n`);
});
