# PostgreSQL Migration Guide

## Database Connection Details
- **Host:** ec2-43-205-140-222.ap-south-1.compute.amazonaws.com
- **Port:** 5432
- **Database:** gowritour
- **User:** admin  
- **Password:** London25@

## Step 1: Set Up PostgreSQL Database

### Option A: Using psql command line
```bash
psql -h ec2-43-205-140-222.ap-south-1.compute.amazonaws.com -p 5432 -U admin -d gowritour -f luxury-travel-agency/database/schema.sql
```

### Option B: Using pgAdmin or any PostgreSQL client
1. Connect to the database using the credentials above
2. Open the SQL query tool
3. Copy and paste the contents of `luxury-travel-agency/database/schema.sql`
4. Execute the script

This will create all necessary tables:
- ✅ categories
- ✅ tours
- ✅ hero_banners
- ✅ logos
- ✅ ads

## Step 2: Install Dependencies Locally (Already Done)

```bash
cd luxury-travel-agency
npm install --legacy-peer-deps
```

The `pg` (PostgreSQL) package is now included in package.json.

## Step 3: Test Locally (Optional)

```bash
# In luxury-travel-agency folder
npm run build
npm start
```

The server will:
1. Connect to PostgreSQL database
2. Serve the built React app
3. Provide API endpoints at `/api/*`

## Step 4: Deploy to Production

### For Render/Heroku/Railway:
The deployment will automatically:
1. Run `npm install --legacy-peer-deps`
2. Run `npm run build` (builds the React app)
3. Start with `node server.js` (connects to PostgreSQL)

### Environment Variables (Set in your deployment platform):
```
DB_HOST=ec2-43-205-140-222.ap-south-1.compute.amazonaws.com
DB_PORT=5432
DB_NAME=gowritour
DB_USER=admin
DB_PASSWORD=London25@
PORT=3000
NODE_ENV=production
```

## Step 5: Verify Deployment

After deployment, check:
1. **Homepage loads:** `https://your-app.com/`
2. **Admin panel works:** `https://your-app.com/admin`
3. **Database connection:** Check server logs for "✅ PostgreSQL connected successfully"
4. **Categories load:** Categories imported in admin should appear on all browsers

## How It Works Now

### Before (Client-Side):
- ❌ Data stored in browser IndexedDB (each browser had its own copy)
- ❌ Categories/tours not shared between browsers
- ❌ Data lost if browser cache cleared

### After (PostgreSQL):
- ✅ Data stored in PostgreSQL database (shared across all users)
- ✅ Categories/tours visible on all browsers and devices
- ✅ Data persists permanently
- ✅ True multi-user admin support

## API Endpoints Available

All requests go to `/api/*`:

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/:slug` - Update category
- `DELETE /api/categories/:slug` - Delete category

### Tours
- `GET /api/tours` - List all tours
- `GET /api/tours/:slug` - Get tour by slug
- `POST /api/tours` - Create tour
- `PUT /api/tours/:slug` - Update tour
- `DELETE /api/tours/:slug` - Delete tour

### Hero Banners
- `GET /api/hero-banners` - List all hero banners
- `POST /api/hero-banners` - Create hero banner

### Logos & Ads
- `GET /api/logos` - List all logos
- `GET /api/ads` - List all ads

## Troubleshooting

### Database connection fails
- ✅ Verify PostgreSQL credentials are correct
- ✅ Check if EC2 security group allows connections from your deployment IP
- ✅ Ensure SSL is enabled (already configured in code)

### Admin panel not saving data
- ✅ Check browser console for API errors
- ✅ Verify `/api/health` endpoint returns status: "ok"
- ✅ Check server logs for database errors

### Categories not showing
- ✅ Run the schema.sql script first to create tables
- ✅ Import categories through admin panel
- ✅ Check `/api/categories` endpoint returns data

## Migration Complete! 🎉

Your app now uses PostgreSQL and all data will be:
- ✅ Shared across all browsers and devices
- ✅ Persisted permanently in the cloud database  
- ✅ Accessible to multiple admins simultaneously
