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
import { initDatabase } from './services/postgresDatabase';

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
        console.log('Connecting to PostgreSQL database...');
        const connected = await initDatabase();
        if (connected) {
          console.log('✅ Connected to PostgreSQL successfully');
        } else {
          console.warn('⚠️ Database not connected - app will load with empty data');
        }
        setDbInitialized(true);
      } catch (error) {
        console.error('❌ Database initialization error:', error);
        console.warn('App will continue to load...');
        // Continue anyway to show the UI
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
          <p>Connecting to database...</p>
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
