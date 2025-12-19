import express from 'express';
import compression from 'compression';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5002);

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gowritour',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'London25@',
  // SSL disabled - server doesn't support it
  ssl: false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully at:', res.rows[0].now);
  }
});

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// ==================== API ROUTES ====================

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
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order, name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
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
    
    const result = await pool.query(
      `INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [generatedId, name, slug, description || '', image || '', parent_id || null, visible !== false, sort_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:slug', async (req, res) => {
  try {
    const { name, description, image, parent_id, visible, sort_order } = req.body;
    
    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, description = $2, image = $3, parent_id = $4, visible = $5, sort_order = $6, updated_at = NOW()
       WHERE slug = $7
       RETURNING *`,
      [name, description, image, parent_id, visible, sort_order, req.params.slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:slug', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE slug = $1', [req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
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
    const result = await pool.query(
      `SELECT t.*, c.name as category_name 
       FROM tours t 
       LEFT JOIN categories c ON t.category_id = c.id 
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tour by slug
app.get('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT t.*, c.name as category_name 
       FROM tours t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.slug = $1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new tour
app.post('/api/tours', async (req, res) => {
  try {
    const { title, slug, description, price, duration, location, category_id, featured_image, is_active, tour_code } = req.body;
    const tourSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const result = await pool.query(
      `INSERT INTO tours (id, title, slug, description, price, duration, location, category_id, featured_image, is_active, tour_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [id, title, tourSlug, description, price, duration, location, category_id, featured_image, is_active, tour_code]
    );
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
    const { title, description, price, duration, location, category_id, featured_image, is_active, tour_code } = req.body;
    
    const result = await pool.query(
      `UPDATE tours 
       SET title = $1, description = $2, price = $3, duration = $4, location = $5, 
           category_id = $6, featured_image = $7, is_active = $8, tour_code = $9, updated_at = NOW()
       WHERE slug = $10
       RETURNING *`,
      [title, description, price, duration, location, category_id, featured_image, is_active, tour_code, slug]
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
    const result = await pool.query('SELECT * FROM hero_banners ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hero-banners', async (req, res) => {
  try {
    const { id, title, subtitle, cta_text, cta_link, background_image, is_active, priority } = req.body;
    const generatedId = id || `hero-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO hero_banners (id, title, subtitle, cta_text, cta_link, background_image, is_active, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [generatedId, title, subtitle || '', cta_text || '', cta_link || '', background_image || '', is_active !== false, priority || 10]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hero banner
app.put('/api/hero-banners/:id', async (req, res) => {
  try {
    const { title, subtitle, cta_text, cta_link, background_image, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE hero_banners 
       SET title = $1, subtitle = $2, cta_text = $3, cta_link = $4, 
           background_image = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, subtitle, cta_text, cta_link, background_image, is_active, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hero banner
app.delete('/api/hero-banners/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hero_banners WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    res.json({ message: 'Hero banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create logo
app.post('/api/logos', async (req, res) => {
  try {
    const { id, title, image_url, is_active } = req.body;
    const generatedId = id || `logo-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO logos (id, title, image_url, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [generatedId, title, image_url, is_active !== false]
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
    const { title, image_url, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE logos 
       SET title = $1, image_url = $2, is_active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, image_url, is_active, req.params.id]
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
    const result = await pool.query('SELECT * FROM ads ORDER BY priority, created_at DESC');
    res.json(result.rows);
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
