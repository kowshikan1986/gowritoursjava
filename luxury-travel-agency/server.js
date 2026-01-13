import express from 'express';
import compression from 'compression';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration - Using JSON only
const pool = null; // PostgreSQL disabled

// Test database connection
console.log('✅ Using JSON-only database mode');

// Middleware
app.use(compression({ level: 9, threshold: 0 })); // Max compression for all responses
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve public directory (robots.txt, .well-known, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images from public/uploads
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== JSON FALLBACK ====================
// Load JSON database (always use JSON, no PostgreSQL)
let jsonDatabase = null;
let jsonFallback = null; // For fallback when PostgreSQL fails
const useJsonOnly = true; // Force JSON-only mode
const postgresAvailable = false; // Disable PostgreSQL

try {
  const dbPath = path.join(__dirname, 'data', 'database.json');
  if (fs.existsSync(dbPath)) {
    jsonDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('📦 JSON database loaded (PostgreSQL disabled)');
  } else {
    console.error('❌ database.json not found!');
  }
} catch (err) {
  console.error('❌ Could not load JSON database:', err.message);
}

// Helper function to save JSON database
function saveJsonDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(jsonDatabase, null, 2), 'utf8');
    console.log('✅ Database saved to JSON');
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
  }
}

// Function to export database to JSON after updates
async function syncDatabaseToJSON() {
  if (!postgresAvailable) return; // Don't export if PostgreSQL is not available
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportData = {
      exportDate: new Date().toISOString(),
      tables: {}
    };

    // Get all tables
    const tables = ['ads', 'categories', 'hero_banners', 'logos', 'tours'];
    
    for (const tableName of tables) {
      const result = await pool.query(`SELECT * FROM ${tableName}`);
      exportData.tables[tableName] = {
        rowCount: result.rows.length,
        data: result.rows
      };
    }

    // Save to JSON file
    const filename = `database_export_${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    // Update in-memory fallback
    jsonFallback = exportData;
    
    console.log('✅ Database synced to JSON:', filename);
  } catch (error) {
    console.error('❌ Error syncing database to JSON:', error.message);
  }
}

// ==================== API ROUTES ====================

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the path that can be used in the frontend
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
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: result.rows[0].now,
      database: 'postgresql'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
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
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    const category = categories.find(cat => cat.slug === req.params.slug);
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
app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, slug, description, image, parent_id, visible, sort_order } = req.body;
    const generatedId = id || `cat-${Date.now()}`;
    
    // Auto-generate slug from name if not provided
    const finalSlug = slug || name.toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const result = await pool.query(
      `INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [generatedId, name, finalSlug, description || '', image || '', parent_id || null, visible !== false, sort_order || 0]
    );
    
    // Sync to JSON after creating
    syncDatabaseToJSON();
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:slug', async (req, res) => {
  try {
    const { name, description, image, parent_id, visible, sort_order, highlights } = req.body;
    
    // Get current category to preserve image if not provided
    const current = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Generate new slug from name if name is provided
    const newSlug = name ? name.toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') : req.params.slug;
    
    // Use new image if provided (not undefined and not empty string), otherwise keep existing
    const imageToUse = (image !== undefined && image !== null && image !== '') ? image : current.rows[0].image;
    
    // Use new highlights if provided, otherwise keep existing
    const highlightsToUse = highlights !== undefined ? highlights : current.rows[0].highlights;
    
    console.log('📝 Updating category:', req.params.slug, '| New image:', image !== undefined ? (image ? 'YES (' + image.length + ')' : 'EMPTY STRING') : 'UNDEFINED (keeping existing)');
    
    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, description = $2, image = $3, parent_id = $4, visible = $5, sort_order = $6, slug = $7, highlights = $8, updated_at = NOW()
       WHERE slug = $9
       RETURNING *`,
      [name, description, imageToUse, parent_id, visible, sort_order, newSlug, highlightsToUse, req.params.slug]
    );
    
    // Sync to JSON after updating
    syncDatabaseToJSON();
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:slug', async (req, res) => {
  try {
    console.log('🗑️ Delete request for:', req.params.slug);
    
    // Try to delete by slug first, then by ID if slug fails
    let result = await pool.query('DELETE FROM categories WHERE slug = $1 RETURNING *', [req.params.slug]);
    
    // If not found by slug, try by ID
    if (result.rowCount === 0) {
      console.log('  ❌ Not found by slug, trying by ID...');
      result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.slug]);
    }
    
    if (result.rowCount === 0) {
      console.log('  ❌ Not found by ID either');
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('  ✅ Deleted:', result.rows[0].name);
    
    // Sync to JSON after deleting
    syncDatabaseToJSON();
    
    res.json({ message: 'Category deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category by name
app.delete('/api/categories/by-name/:name', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE name = $1', [req.params.name]);
    res.json({ message: 'Category deleted successfully', deleted: result.rowCount });
  } catch (error) {
    console.error('Error deleting category by name:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

// Get all tours
app.get('/api/tours', async (req, res) => {
  try {
    // Use JSON database
    const tours = jsonDatabase?.tours || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tour by slug
app.get('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tours = jsonDatabase?.tours || [];
    const tour = tours.find(t => t.slug === slug);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new tour
app.post('/api/tours', async (req, res) => {
  try {
    const { title, slug, description, price, duration, location, category_id, featured_image, is_active, tour_code, details } = req.body;
    
    console.log('POST /api/tours received:', {
      title,
      category_id,
      featured_image: featured_image ? `base64 string (${featured_image.length} chars)` : 'empty or null',
      details: details ? 'present' : 'empty',
      tour_code
    });
    
    const tourSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const result = await pool.query(
      `INSERT INTO tours (id, title, slug, description, price, duration, location, category_id, featured_image, is_active, tour_code, details_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [id, title, tourSlug, description, price, duration, location, category_id, featured_image, is_active, tour_code, details || '{}']
    );
    
    console.log('Tour created in DB with featured_image length:', result.rows[0].featured_image?.length || 0);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tour
app.put('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, price, duration, location, category_id, featured_image, is_active, tour_code, details } = req.body;
    
    const result = await pool.query(
      `UPDATE tours 
       SET title = $1, description = $2, price = $3, duration = $4, location = $5, 
           category_id = $6, featured_image = $7, is_active = $8, tour_code = $9, details_json = $10, updated_at = NOW()
       WHERE slug = $11
       RETURNING *`,
      [title, description, price, duration, location, category_id, featured_image, is_active, tour_code, details || '{}', slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
app.delete('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('DELETE FROM tours WHERE slug = $1 RETURNING *', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tour
app.put('/api/tours/:slug', async (req, res) => {
  try {
    const { title, description, price, duration, location, featured_image, is_active, is_featured, category_id, tour_code, details_json } = req.body;
    
    const result = await pool.query(
      `UPDATE tours 
       SET title = $1, description = $2, price = $3, duration = $4, location = $5, featured_image = $6, is_active = $7, is_featured = $8, category_id = $9, tour_code = $10, details_json = $11, updated_at = NOW()
       WHERE slug = $12
       RETURNING *`,
      [title, description, price, duration, location, featured_image, is_active, is_featured, category_id, tour_code, details_json, req.params.slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
app.delete('/api/tours/:slug', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tours WHERE slug = $1', [req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

app.get('/api/hero-banners', async (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(banners);
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hero-banners', async (req, res) => {
  try {
    const { id, title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    const generatedId = id || `hero-${Date.now()}`;
    const bannerImage = background_image || image || '';
    
    if (!jsonDatabase.hero_banners) {
      jsonDatabase.hero_banners = [];
    }
    
    const newBanner = {
      id: generatedId,
      title,
      subtitle: subtitle || '',
      cta_text: cta_text || '',
      cta_link: cta_link || '',
      image: bannerImage,
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.hero_banners.push(newBanner);
    saveJsonDatabase();
    
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hero banner
app.put('/api/hero-banners/:id', async (req, res) => {
  try {
    const { title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    const bannerImage = background_image || image;
    
    const banners = jsonDatabase?.hero_banners || [];
    const bannerIndex = banners.findIndex(b => b.id === req.params.id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const updatedBanner = {
      ...banners[bannerIndex],
      title: title !== undefined ? title : banners[bannerIndex].title,
      subtitle: subtitle !== undefined ? subtitle : banners[bannerIndex].subtitle,
      cta_text: cta_text !== undefined ? cta_text : banners[bannerIndex].cta_text,
      cta_link: cta_link !== undefined ? cta_link : banners[bannerIndex].cta_link,
      image: bannerImage !== undefined ? bannerImage : banners[bannerIndex].image,
      is_active: is_active !== undefined ? is_active : banners[bannerIndex].is_active,
      updated_at: new Date().toISOString()
    };
    
    banners[bannerIndex] = updatedBanner;
    saveJsonDatabase();
    
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hero banner
app.delete('/api/hero-banners/:id', async (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    const bannerIndex = banners.findIndex(b => b.id === req.params.id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const deletedBanner = banners.splice(bannerIndex, 1)[0];
    saveJsonDatabase();
    
    res.json({ message: 'Hero banner deleted successfully', deleted: deletedBanner });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', async (req, res) => {
  try {
    const logos = jsonDatabase?.logos || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(logos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create logo
app.post('/api/logos', async (req, res) => {
  try {
    const { id, title, name, image_url, image, link, is_active } = req.body;
    const generatedId = id || `logo-${Date.now()}`;
    const logoName = title || name || 'Logo';
    const logoImage = image_url || image || '';
    
    const result = await pool.query(
      `INSERT INTO logos (id, name, image, link, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [generatedId, logoName, logoImage, link || '', is_active !== false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update logo
app.put('/api/logos/:id', async (req, res) => {
  try {
    const { title, name, image_url, image, link, is_active } = req.body;
    const logoName = title || name;
    const logoImage = image_url || image;
    
    const result = await pool.query(
      `UPDATE logos 
       SET name = $1, image = $2, link = $3, is_active = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [logoName, logoImage, link, is_active, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete logo
app.delete('/api/logos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM logos WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS ====================

app.get('/api/ads', async (req, res) => {
  try {
    const ads = jsonDatabase?.ads || [];
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create ad
app.post('/api/ads', async (req, res) => {
  try {
    const { id, title, description, image_url, link_url, is_active, priority } = req.body;
    const generatedId = id || `ad-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO ads (id, title, description, image_url, link_url, is_active, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [generatedId, title, description || '', image_url, link_url || '', is_active !== false, priority || 10]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ad
app.put('/api/ads/:id', async (req, res) => {
  try {
    const { title, description, image_url, link_url, is_active, priority } = req.body;
    
    const result = await pool.query(
      `UPDATE ads 
       SET title = $1, description = $2, image_url = $3, link_url = $4, 
           is_active = $5, priority = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, image_url, link_url, is_active, priority, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ad
app.delete('/api/ads/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ads WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle client-side routing - return index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🗄️  Database: PostgreSQL (gowritour)`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
