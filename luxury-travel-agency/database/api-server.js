/**
 * SQLite Database API Server
 * Provides REST API endpoints for the SQLite database
 * Run with: node database/api-server.js
 */

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const DB_PATH = path.join(__dirname, 'travel_agency.db');
const db = new Database(DB_PATH, { verbose: console.log });
db.pragma('foreign_keys = ON');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

console.log('Database API Server Starting...');
console.log('Database path:', DB_PATH);

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order, name');
    const categories = stmt.all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
    const category = stmt.get(req.params.slug);
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
    const { id, name, slug, description, image, parent_id, visible, sort_order } = req.body;
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, slug, description || '', image || '', parent_id || null, visible ? 1 : 0, sort_order || 0);
    res.status(201).json({ message: 'Category created', id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:slug', (req, res) => {
  try {
    const { name, description, image, parent_id, visible, sort_order } = req.body;
    const stmt = db.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, image = ?, parent_id = ?, visible = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?
    `);
    const info = stmt.run(name, description || '', image || '', parent_id || null, visible ? 1 : 0, sort_order || 0, req.params.slug);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:slug', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE slug = ?');
    const info = stmt.run(req.params.slug);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

// Get all tours
app.get('/api/tours', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT t.*, c.name as category_name 
      FROM tours t 
      LEFT JOIN categories c ON t.category_id = c.id 
      ORDER BY t.created_at DESC
    `);
    const tours = stmt.all();
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tour by slug
app.get('/api/tours/:slug', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT t.*, c.name as category_name 
      FROM tours t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.slug = ?
    `);
    const tour = stmt.get(req.params.slug);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create tour
app.post('/api/tours', (req, res) => {
  try {
    const { id, title, slug, description, price, duration, location, featured_image, is_active, is_featured, category_id } = req.body;
    const stmt = db.prepare(`
      INSERT INTO tours (id, title, slug, description, price, duration, location, featured_image, is_active, is_featured, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, slug, description || '', price || 0, duration || '', location || '', featured_image || '', is_active ? 1 : 0, is_featured ? 1 : 0, category_id);
    res.status(201).json({ message: 'Tour created', id });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tour
app.put('/api/tours/:slug', (req, res) => {
  try {
    const { title, description, price, duration, location, featured_image, is_active, is_featured, category_id } = req.body;
    const stmt = db.prepare(`
      UPDATE tours 
      SET title = ?, description = ?, price = ?, duration = ?, location = ?, featured_image = ?, is_active = ?, is_featured = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?
    `);
    const info = stmt.run(title, description || '', price || 0, duration || '', location || '', featured_image || '', is_active ? 1 : 0, is_featured ? 1 : 0, category_id, req.params.slug);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json({ message: 'Tour updated' });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
app.delete('/api/tours/:slug', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM tours WHERE slug = ?');
    const info = stmt.run(req.params.slug);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

// Get all hero banners
app.get('/api/hero-banners', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM hero_banners ORDER BY priority DESC');
    const banners = stmt.all();
    res.json(banners);
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create hero banner
app.post('/api/hero-banners', (req, res) => {
  try {
    const { id, title, subtitle, background_image, cta_text, cta_link, is_active, priority } = req.body;
    const stmt = db.prepare(`
      INSERT INTO hero_banners (id, title, subtitle, background_image, cta_text, cta_link, is_active, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, subtitle || '', background_image || '', cta_text || '', cta_link || '', is_active ? 1 : 0, priority || 0);
    res.status(201).json({ message: 'Hero banner created', id });
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hero banner
app.put('/api/hero-banners/:id', (req, res) => {
  try {
    const { title, subtitle, background_image, cta_text, cta_link, is_active, priority } = req.body;
    const stmt = db.prepare(`
      UPDATE hero_banners 
      SET title = ?, subtitle = ?, background_image = ?, cta_text = ?, cta_link = ?, is_active = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(title, subtitle || '', background_image || '', cta_text || '', cta_link || '', is_active ? 1 : 0, priority || 0, req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    res.json({ message: 'Hero banner updated' });
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hero banner
app.delete('/api/hero-banners/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM hero_banners WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    res.json({ message: 'Hero banner deleted' });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

// Get all logos
app.get('/api/logos', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM logos ORDER BY created_at DESC');
    const logos = stmt.all();
    res.json(logos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create logo
app.post('/api/logos', (req, res) => {
  try {
    const { id, title, image, is_active } = req.body;
    const stmt = db.prepare(`
      INSERT INTO logos (id, title, image, is_active)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, title, image || '', is_active ? 1 : 0);
    res.status(201).json({ message: 'Logo created', id });
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update logo
app.put('/api/logos/:id', (req, res) => {
  try {
    const { title, image, is_active } = req.body;
    const stmt = db.prepare(`
      UPDATE logos 
      SET title = ?, image = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(title, image || '', is_active ? 1 : 0, req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    res.json({ message: 'Logo updated' });
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete logo
app.delete('/api/logos/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM logos WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    res.json({ message: 'Logo deleted' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATABASE BACKUP ====================

// Export database
app.get('/api/export-database', (req, res) => {
  try {
    res.download(DB_PATH, `travel_agency_backup_${Date.now()}.db`);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Database API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database file: ${DB_PATH}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log('\nAvailable endpoints:');
  console.log('  GET    /api/categories');
  console.log('  POST   /api/categories');
  console.log('  PUT    /api/categories/:slug');
  console.log('  DELETE /api/categories/:slug');
  console.log('  GET    /api/tours');
  console.log('  POST   /api/tours');
  console.log('  PUT    /api/tours/:slug');
  console.log('  DELETE /api/tours/:slug');
  console.log('  GET    /api/hero-banners');
  console.log('  POST   /api/hero-banners');
  console.log('  PUT    /api/hero-banners/:id');
  console.log('  DELETE /api/hero-banners/:id');
  console.log('  GET    /api/logos');
  console.log('  POST   /api/logos');
  console.log('  PUT    /api/logos/:id');
  console.log('  DELETE /api/logos/:id');
  console.log('  GET    /api/export-database');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing database connection...');
  db.close();
  process.exit(0);
});
