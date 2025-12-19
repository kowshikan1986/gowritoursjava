import React from 'react';
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

const AppContainer = styled.div`
  min-height: 100vh;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  padding-top: ${props => props.$noHeader ? '0' : '80px'};
`;

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

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
