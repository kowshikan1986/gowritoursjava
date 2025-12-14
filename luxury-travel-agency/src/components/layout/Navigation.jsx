import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import client from '../../api/client';

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    position: fixed;
    top: 96px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    transform: ${props => props.$isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)'};
    opacity: ${props => props.$isMobileMenuOpen ? '1' : '0'};
    visibility: ${props => props.$isMobileMenuOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 96px);
    overflow-y: auto;
  }
`;

const NavItem = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const NavLink = styled(motion.a)`
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #6A1B82;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #6A1B82;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.5rem 0;
    justify-content: center;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
  z-index: 100;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  padding: 1rem;
  width: 90vw;
  max-width: 1100px;
  max-height: 70vh;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
  }

  @media (max-width: 768px) {
    position: static;
    transform: none;
    box-shadow: none;
    background: #f9fafb;
    margin-top: 0.5rem;
    padding: 0.5rem;
    display: ${props => props.$isOpen ? 'block' : 'none'};
    grid-template-columns: 1fr;
  }
`;

const GroupTitle = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 0.75rem 1.5rem;
  color: #4a4a4a;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(106, 27, 130, 0.05);
    color: #6A1B82;
    padding-left: 1.75rem;
  }
`;

const CTAButton = styled(motion.button)`
  background: #6A1B82;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 2px solid #6A1B82;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 27, 130, 0.3);

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 27, 130, 0.4);
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
    padding: 1rem 2rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const Navigation = ({ isMobileMenuOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState(null);
  const allowedTourSlugs = useMemo(
    () =>
      new Set([
        'uk-tours',
        'european-tours',
        'world-tours',
        'group-tours',
        'private-tours',
      ]),
    []
  );

  const normalize = (str = '') =>
    str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const tourCategories = useMemo(
    () =>
      (menuCategories || []).filter((cat) => {
        const slug = cat.slug || cat.id || cat.name;
        return allowedTourSlugs.has(normalize(slug));
      }),
    [menuCategories, allowedTourSlugs]
  );

  useEffect(() => {
    if (isDropdownOpen && tourCategories.length && !selectedCatSlug) {
      const firstWithSubs =
        tourCategories.find((c) => c.subcategories && c.subcategories.length > 0) ||
        tourCategories[0];
      setSelectedCatSlug(firstWithSubs?.slug || firstWithSubs?.id || firstWithSubs?.name);
    }
  }, [isDropdownOpen, tourCategories, selectedCatSlug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/categories/');
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setMenuCategories(data);
      } catch (err) {
        // keep menu static if API fails
      }
    };
    fetchCategories();
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDropdownEnter = () => {
    if (window.innerWidth > 768) {
      setIsDropdownOpen(true);
    }
  };

  const handleDropdownLeave = () => {
    if (window.innerWidth > 768) {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <Nav $isMobileMenuOpen={isMobileMenuOpen} id="mobile-navigation">
      <NavItem>
        <NavLink
          href="/"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Home
        </NavLink>
      </NavItem>
      <NavItem
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
      >
        <NavLink
          href="#"
          onClick={toggleDropdown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Tours
          <ChevronDownIcon style={{ width: '16px', height: '16px', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </NavLink>
        <AnimatePresence>
          {(isDropdownOpen || (window.innerWidth <= 768 && isDropdownOpen)) && (
            <DropdownMenu
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              $isOpen={isDropdownOpen}
            >
              <div>
                <GroupTitle>Categories</GroupTitle>
                <GroupList>
                  {(tourCategories.length ? tourCategories : []).map((cat) => (
                    <DropdownItem
                      key={cat.id || cat.slug || cat.name}
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCatSlug(cat.slug || cat.id || cat.name);
                      }}
                      onMouseEnter={() => setSelectedCatSlug(cat.slug || cat.id || cat.name)}
                      style={{
                        fontWeight: (cat.slug || cat.id || cat.name) === selectedCatSlug ? 700 : 500,
                      }}
                    >
                      {cat.name}
                    </DropdownItem>
                  ))}
                </GroupList>
              </div>
              <div>
                <GroupList>
                  {(() => {
                    const cat =
                      tourCategories.find(
                        (c) => (c.slug || c.id || c.name) === selectedCatSlug
                      );
                    if (!cat) {
                      return (
                        <DropdownItem to="#" onClick={(e) => e.preventDefault()}>
                          Select a category to view subcategories
                        </DropdownItem>
                      );
                    }
                    const subs = cat.subcategories && cat.subcategories.length > 0
                      ? cat.subcategories
                      : [];
                    if (!subs.length) {
                      return (
                        <DropdownItem to="#" onClick={(e) => e.preventDefault()}>
                          No subcategories for this category
                        </DropdownItem>
                      );
                    }
                    return subs.map((sub) => (
                      <DropdownItem
                        key={sub.id || sub.slug}
                        to={`/service/${cat?.slug || cat?.id || ''}`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {sub.name}
                      </DropdownItem>
                    ));
                  })()}
                </GroupList>
              </div>
            </DropdownMenu>
          )}
        </AnimatePresence>
      </NavItem>

      <NavItem>
        <NavLink
          href="/service/cruises"
          onClick={(e) => { e.preventDefault(); navigate('/service/cruises'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cruises
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/service/airport-transfers"
          onClick={(e) => { e.preventDefault(); navigate('/service/airport-transfers'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Airport Transfers
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/service/vehicle-hire"
          onClick={(e) => { e.preventDefault(); navigate('/service/vehicle-hire'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Vehicle Hire
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/service/india-sri-lanka-tours"
          onClick={(e) => { e.preventDefault(); navigate('/service/india-sri-lanka-tours'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sri Lanka Tours
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/service/other-servies"
          onClick={(e) => { e.preventDefault(); navigate('/service/other-servies'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Other Services
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/contact-us"
          onClick={(e) => {
            e.preventDefault();
            navigate('/contact-us');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact
        </NavLink>
      </NavItem>

      <NavItem>
        <NavLink
          href="/admin"
          onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Admin
        </NavLink>
      </NavItem>

      <CTAButton
        onClick={(e) => handleNavClick(e, 'contact')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Book Now
      </CTAButton>
    </Nav>
  );
};

export default Navigation;
