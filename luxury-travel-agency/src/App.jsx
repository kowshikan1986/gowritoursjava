import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Destinations from './components/sections/Destinations';
import Accommodation from './pages/Accommodation';
import ServicePage from './pages/ServicePage';
import PackageDetailPage from './pages/PackageDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import CategoryEditPage from './pages/CategoryEditPage';
import { initDatabase } from './services/database';
import { importAllCategories } from './services/importData';

const AppContainer = styled.div`
  min-height: 100vh;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  padding-top: ${props => props.$noHeader ? '0' : '80px'};
`;

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        await initDatabase();
        
        // Auto-seed if database is empty - force re-seed for debugging
        // Check if we need to clear and re-seed (for development)
        const shouldClearAndReseed = localStorage.getItem('force_reseed') === 'true';
        if (shouldClearAndReseed) {
          console.log('Force re-seed detected, clearing IndexedDB...');
          // Clear IndexedDB
          const dbName = 'travel_agency_db';
          const deleteRequest = indexedDB.deleteDatabase(dbName);
          await new Promise((resolve, reject) => {
            deleteRequest.onsuccess = resolve;
            deleteRequest.onerror = reject;
          });
          localStorage.removeItem('force_reseed');
          console.log('Database cleared, reloading...');
          window.location.reload();
          return;
        }
        
        try {
          console.log('Attempting to seed database...');
          const result = await importAllCategories();
          console.log('Database seeded successfully:', result);
        } catch (seedErr) {
          // If seeding fails (e.g., data already exists), that's okay
          console.log('Database seeding skipped (data may already exist):', seedErr.message);
        }
        
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Continue anyway to allow the app to run
        setDbInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  if (!dbInitialized) {
    return (
      <AppContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p>Initializing database</p>
        </div>
      </AppContainer>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Separate component to use useLocation hook
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <AppContainer>
      {!isAdminPage && <Header />}
      <MainContent $noHeader={isAdminPage}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service/:id" element={<ServicePage />} />
          <Route path="/package/:id" element={<PackageDetailPage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/category/edit/:id" element={<CategoryEditPage />} />
        </Routes>
      </MainContent>
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <Footer />}
    </AppContainer>
  );
}

export default App;
