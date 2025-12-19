import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Helper: Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return { categories: [], tours: [], banners: [], lastUpdated: null };
  }
};

// Helper: Write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
};

// Helper: Generate ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all data
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Get categories
app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories || []);
});

// Get category by slug
app.get('/api/categories/:slug', (req, res) => {
  const db = readDB();
  const category = (db.categories || []).find(c => c.slug === req.params.slug);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Create category
app.post('/api/categories', (req, res) => {
  const db = readDB();
  const newCategory = {
    id: generateId(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.categories = db.categories || [];
  db.categories.push(newCategory);
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.status(201).json(newCategory);
  } else {
    res.status(500).json({ error: 'Failed to save category' });
  }
});

// Update category
app.put('/api/categories/:slug', (req, res) => {
  const db = readDB();
  const index = (db.categories || []).findIndex(c => c.slug === req.params.slug);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  db.categories[index] = {
    ...db.categories[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json(db.categories[index]);
  } else {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/categories/:slug', (req, res) => {
  const db = readDB();
  db.categories = (db.categories || []).filter(c => c.slug !== req.params.slug);
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get tours
app.get('/api/tours', (req, res) => {
  const db = readDB();
  res.json(db.tours || []);
});

// Create tour
app.post('/api/tours', (req, res) => {
  const db = readDB();
  const newTour = {
    id: generateId(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.tours = db.tours || [];
  db.tours.push(newTour);
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.status(201).json(newTour);
  } else {
    res.status(500).json({ error: 'Failed to save tour' });
  }
});

// Get banners
app.get('/api/banners', (req, res) => {
  const db = readDB();
  res.json(db.banners || []);
});

// Seed database with default data
app.post('/api/seed', (req, res) => {
  const db = readDB();
  
  // Check if already seeded
  if (db.categories && db.categories.length > 0) {
    return res.json({ message: 'Database already seeded', categories: db.categories.length });
  }
  
  // Seed categories (you can add the full seed data here)
  db.categories = req.body.categories || [];
  db.tours = req.body.tours || [];
  db.banners = req.body.banners || [];
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ 
      message: 'Database seeded successfully',
      categoriesCount: db.categories.length,
      toursCount: db.tours.length,
      bannersCount: db.banners.length
    });
  } else {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Bulk import categories
app.post('/api/categories/bulk', (req, res) => {
  const db = readDB();
  const categories = req.body.categories || [];
  
  db.categories = db.categories || [];
  
  let added = 0;
  let updated = 0;
  
  categories.forEach(cat => {
    const existingIndex = db.categories.findIndex(c => c.slug === cat.slug);
    if (existingIndex === -1) {
      db.categories.push({
        id: generateId(),
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      added++;
    } else {
      db.categories[existingIndex] = {
        ...db.categories[existingIndex],
        ...cat,
        updated_at: new Date().toISOString()
      };
      updated++;
    }
  });
  
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ 
      message: 'Bulk import successful',
      added,
      updated,
      total: db.categories.length
    });
  } else {
    res.status(500).json({ error: 'Failed to import categories' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});
