// SIMPLE CLEANUP SCRIPT
// 1. Open http://localhost:5173/admin in your browser
// 2. Login to admin panel
// 3. Open browser console (F12)
// 4. Copy and paste this entire code and press Enter

const categoriesToDelete = [
  'Executive MPV',
  'India Golden Triangle (Delhi–Agra–Jaipur)',
  'Kerala Backwaters',
  'Luxury Sedan',
  'Minibus/Coach'
];

async function cleanupCategories() {
  console.log('🗑️ Starting category cleanup...');
  
  // Import the database module
  const { deleteCategoryByName, getCategories } = await import('./src/services/database.js');
  
  const allCategories = getCategories();
  console.log(`Total categories before cleanup: ${allCategories.length}`);
  
  for (const categoryName of categoriesToDelete) {
    try {
      await deleteCategoryByName(categoryName);
      console.log(`✅ Deleted: ${categoryName}`);
    } catch (error) {
      console.error(`❌ Error deleting "${categoryName}":`, error);
    }
  }
  
  const remainingCategories = getCategories();
  console.log(`Total categories after cleanup: ${remainingCategories.length}`);
  console.log('✅ Category cleanup complete!');
  console.log('🔄 Refresh the page to see changes.');
}

// Run the cleanup
cleanupCategories();

