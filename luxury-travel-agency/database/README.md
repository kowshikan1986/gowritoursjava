# Local SQLite Database Setup

This directory contains the **real SQLite database file** and API server for the luxury travel agency application.

## 📁 Files

- **`travel_agency.db`** - SQLite database file (your actual data storage)
- **`init-database.js`** - Script to initialize/reset the database
- **`api-server.js`** - Express API server that connects to the SQLite database

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd luxury-travel-agency
npm install
```

This installs:
- `better-sqlite3` - Native SQLite driver
- `express` - API server
- `cors` - Cross-origin support
- `multer` - File upload handling

### 2. Initialize Database

```bash
npm run db:init
```

This creates the database file and tables:
- categories
- tours
- hero_banners
- logos
- ads

### 3. Start the Database API Server

```bash
npm run db:server
```

The API server will run on **http://localhost:5000**

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The Vite dev server will run on **http://localhost:5173**

### 5. Or Start Both Together

```bash
npm run start:full
```

## 🔗 API Endpoints

All endpoints are available at `http://localhost:5000/api/`

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/:slug` - Update category
- `DELETE /api/categories/:slug` - Delete category

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/:slug` - Get tour by slug
- `POST /api/tours` - Create tour
- `PUT /api/tours/:slug` - Update tour
- `DELETE /api/tours/:slug` - Delete tour

### Hero Banners
- `GET /api/hero-banners` - Get all hero banners
- `POST /api/hero-banners` - Create hero banner
- `PUT /api/hero-banners/:id` - Update hero banner
- `DELETE /api/hero-banners/:id` - Delete hero banner

### Logos
- `GET /api/logos` - Get all logos
- `POST /api/logos` - Create logo
- `PUT /api/logos/:id` - Update logo
- `DELETE /api/logos/:id` - Delete logo

### Database Backup
- `GET /api/export-database` - Download database backup

### Health Check
- `GET /api/health` - Check API server status

## 💾 Database Backup

The SQLite database file is located at:
```
luxury-travel-agency/database/travel_agency.db
```

**To backup your data:**
1. Copy the `travel_agency.db` file to a safe location
2. Or use the export endpoint: `http://localhost:5000/api/export-database`

**To restore:**
1. Replace the `travel_agency.db` file with your backup
2. Restart the API server

## 🔧 Development

### View Database Content

You can use any SQLite viewer:
- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- **VS Code Extension**: SQLite Viewer
- **Command Line**: `sqlite3 database/travel_agency.db`

### Reset Database

```bash
# Delete the database file
rm database/travel_agency.db

# Reinitialize
npm run db:init
```

### Database Schema

```sql
-- Categories (main categories and subcategories)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  parent_id TEXT,
  visible INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Tours
CREATE TABLE tours (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL DEFAULT 0,
  duration TEXT,
  location TEXT,
  featured_image TEXT,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  category_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Hero Banners
CREATE TABLE hero_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  background_image TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logos
CREATE TABLE logos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Data Persistence

**Your data is stored in a REAL SQLite file** (`travel_agency.db`), which means:

✅ **Permanent storage** - Data persists across browser sessions
✅ **Portable** - Copy the .db file to backup or share
✅ **Version control** - Can be committed to Git (if small enough)
✅ **Professional** - Industry-standard SQLite database
✅ **Offline access** - Works without internet
✅ **Direct access** - View/edit with SQLite tools

## 🛡️ Security Notes

This setup is for **local development only**. For production:
- Add authentication/authorization
- Use environment variables for configuration
- Add input validation and sanitization
- Implement rate limiting
- Use HTTPS

## 🐛 Troubleshooting

**API server won't start:**
```bash
# Make sure port 5000 is free
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database file locked:**
- Close all SQLite viewers
- Restart the API server

**Frontend can't connect to API:**
- Make sure API server is running: `npm run db:server`
- Check console for connection errors
- Verify API URL in `src/api/client.js` is `http://localhost:5000/api`

## 📝 Notes

- The database file is a **binary file** - don't open it in text editors
- Foreign key constraints are enabled for data integrity
- All timestamps are in UTC
- Images are stored as base64 or URLs
