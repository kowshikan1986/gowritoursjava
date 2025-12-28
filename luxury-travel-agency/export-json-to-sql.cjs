const fs = require('fs');
const path = require('path');

// Read current database.json
const dbPath = path.join(__dirname, 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Generate timestamp for filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputPath = path.join(__dirname, `database_export_${timestamp}.sql`);

let sql = `-- PostgreSQL Database Export
-- Generated: ${new Date().toISOString()}
-- Database: gowritour

-- Start transaction
BEGIN;

-- Clear existing data
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE tours CASCADE;
TRUNCATE TABLE hero_banners CASCADE;
TRUNCATE TABLE logos CASCADE;
TRUNCATE TABLE ads CASCADE;

`;

// Export Categories
if (db.categories && db.categories.length > 0) {
  sql += `\n-- Categories (${db.categories.length} records)\n`;
  db.categories.forEach(cat => {
    const values = [
      `'${cat.id}'`,
      `'${cat.name.replace(/'/g, "''")}'`,
      `'${cat.slug}'`,
      cat.description ? `'${cat.description.replace(/'/g, "''")}'` : 'NULL',
      cat.image ? `'${cat.image.replace(/'/g, "''")}'` : 'NULL',
      cat.parent_id ? `'${cat.parent_id}'` : 'NULL',
      cat.visible !== null ? cat.visible : 'true',
      cat.sort_order !== null ? cat.sort_order : 'NULL',
      `'${cat.created_at}'`,
      `'${cat.updated_at}'`,
      cat.highlights ? `'${JSON.stringify(cat.highlights).replace(/'/g, "''")}'` : 'NULL'
    ];
    sql += `INSERT INTO categories (id, name, slug, description, image, parent_id, visible, sort_order, created_at, updated_at, highlights) VALUES (${values.join(', ')});\n`;
  });
}

// Export Tours
if (db.tours && db.tours.length > 0) {
  sql += `\n-- Tours (${db.tours.length} records)\n`;
  db.tours.forEach(tour => {
    const values = [
      `'${tour.id}'`,
      `'${tour.title.replace(/'/g, "''")}'`,
      tour.description ? `'${tour.description.replace(/'/g, "''")}'` : 'NULL',
      tour.price ? tour.price : 'NULL',
      tour.duration ? `'${tour.duration}'` : 'NULL',
      tour.image ? `'${tour.image.replace(/'/g, "''")}'` : 'NULL',
      tour.category_id ? `'${tour.category_id}'` : 'NULL',
      `'${tour.created_at}'`,
      `'${tour.updated_at}'`
    ];
    sql += `INSERT INTO tours (id, title, description, price, duration, image, category_id, created_at, updated_at) VALUES (${values.join(', ')});\n`;
  });
}

// Export Hero Banners
if (db.hero_banners && db.hero_banners.length > 0) {
  sql += `\n-- Hero Banners (${db.hero_banners.length} records)\n`;
  db.hero_banners.forEach(banner => {
    const values = [
      `'${banner.id}'`,
      `'${banner.title.replace(/'/g, "''")}'`,
      banner.subtitle ? `'${banner.subtitle.replace(/'/g, "''")}'` : 'NULL',
      banner.image ? `'${banner.image.replace(/'/g, "''")}'` : 'NULL',
      banner.link ? `'${banner.link}'` : 'NULL',
      banner.is_active !== undefined ? banner.is_active : 'true',
      banner.sort_order !== null ? banner.sort_order : 'NULL',
      `'${banner.created_at}'`,
      `'${banner.updated_at}'`
    ];
    sql += `INSERT INTO hero_banners (id, title, subtitle, image, link, is_active, sort_order, created_at, updated_at) VALUES (${values.join(', ')});\n`;
  });
}

// Export Logos
if (db.logos && db.logos.length > 0) {
  sql += `\n-- Logos (${db.logos.length} records)\n`;
  db.logos.forEach(logo => {
    const values = [
      `'${logo.id}'`,
      `'${logo.title.replace(/'/g, "''")}'`,
      `'${logo.name.replace(/'/g, "''")}'`,
      logo.image ? `'${logo.image.replace(/'/g, "''")}'` : 'NULL',
      logo.image_url ? `'${logo.image_url.replace(/'/g, "''")}'` : 'NULL',
      logo.is_active !== undefined ? logo.is_active : 'true',
      `'${logo.created_at}'`,
      `'${logo.updated_at}'`
    ];
    sql += `INSERT INTO logos (id, title, name, image, image_url, is_active, created_at, updated_at) VALUES (${values.join(', ')});\n`;
  });
}

// Export Ads
if (db.ads && db.ads.length > 0) {
  sql += `\n-- Ads (${db.ads.length} records)\n`;
  db.ads.forEach(ad => {
    const values = [
      `'${ad.id}'`,
      `'${ad.title.replace(/'/g, "''")}'`,
      ad.image ? `'${ad.image.replace(/'/g, "''")}'` : 'NULL',
      ad.link ? `'${ad.link}'` : 'NULL',
      ad.is_active !== undefined ? ad.is_active : 'true',
      `'${ad.created_at}'`,
      `'${ad.updated_at}'`
    ];
    sql += `INSERT INTO ads (id, title, image, link, is_active, created_at, updated_at) VALUES (${values.join(', ')});\n`;
  });
}

sql += `\n-- Commit transaction\nCOMMIT;\n`;

// Write to file
fs.writeFileSync(outputPath, sql, 'utf8');

console.log('\n✅ SQL Export Successful!');
console.log(`\nFile: ${outputPath}`);
console.log(`\nExported Data:`);
console.log(`  - Categories: ${db.categories.length}`);
console.log(`  - Tours: ${db.tours.length}`);
console.log(`  - Hero Banners: ${db.hero_banners.length}`);
console.log(`  - Logos: ${db.logos.length}`);
console.log(`  - Ads: ${db.ads.length}`);
console.log(`\nTotal records: ${db.categories.length + db.tours.length + db.hero_banners.length + db.logos.length + db.ads.length}`);
