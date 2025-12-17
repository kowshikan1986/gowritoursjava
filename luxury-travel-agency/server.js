import express from 'express';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// Database file path
const DB_FILE = path.join(__dirname, 'server', 'database.json');

// Helper functions
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { categories: [], tours: [], banners: [], lastUpdated: null };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== API ROUTES ====================

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

// Create/Update category
app.post('/api/categories', (req, res) => {
  const db = readDB();
  const { slug } = req.body;
  
  db.categories = db.categories || [];
  const existingIndex = db.categories.findIndex(c => c.slug === slug);
  
  if (existingIndex !== -1) {
    // Update existing
    db.categories[existingIndex] = {
      ...db.categories[existingIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
  } else {
    // Create new
    db.categories.push({
      id: generateId(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ success: true, categories: db.categories });
  } else {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Bulk import
app.post('/api/categories/bulk', (req, res) => {
  const db = readDB();
  const categories = req.body.categories || [];
  
  db.categories = db.categories || [];
  let added = 0;
  
  categories.forEach(cat => {
    const exists = db.categories.find(c => c.slug === cat.slug);
    if (!exists) {
      db.categories.push({
        id: generateId(),
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      added++;
    }
  });
  
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ success: true, added, total: db.categories.length });
  } else {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get tours
app.get('/api/tours', (req, res) => {
  const db = readDB();
  res.json(db.tours || []);
});

// Create/Update tour
app.post('/api/tours', (req, res) => {
  const db = readDB();
  const { slug } = req.body;
  
  db.tours = db.tours || [];
  const existingIndex = db.tours.findIndex(t => t.slug === slug);
  
  if (existingIndex !== -1) {
    db.tours[existingIndex] = {
      ...db.tours[existingIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
  } else {
    db.tours.push({
      id: generateId(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  db.lastUpdated = new Date().toISOString();
  
  if (writeDB(db)) {
    res.json({ success: true, tours: db.tours });
  } else {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Get banners
app.get('/api/banners', (req, res) => {
  const db = readDB();
  res.json(db.banners || []);
});

// ==================== FRONTEND ====================

// Serve static files from the dist directory (only for non-API routes)
app.use((req, res, next) => {
  // Skip static file serving for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y',
    etag: true
  })(req, res, next);
});

// Handle SPA routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Don't send index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('App not built. Run: npm run build');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend at http://localhost:${PORT}`);
});
