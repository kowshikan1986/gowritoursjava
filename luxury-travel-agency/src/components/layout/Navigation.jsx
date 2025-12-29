import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFrontendData, getCachedData, normalize } from '../../services/frontendData';
import { onDataChange } from '../../services/postgresDatabase';

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
    pointer-events: ${props => props.$isMobileMenuOpen ? 'auto' : 'none'};
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 96px);
    overflow-y: auto;
    z-index: 1200;
  }
`;

const NavItem = styled.div`
  position: relative;
  pointer-events: auto;
  
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

const DropdownPanel = styled.div`
  position: absolute;
  top: 115%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle at 20% 20%, rgba(122, 55, 180, 0.08), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(89, 131, 252, 0.08), transparent 40%),
    #ffffff;
  border: 1px solid #e2d9ff;
  border-radius: 18px;
  box-shadow: 0 22px 55px rgba(50, 30, 97, 0.18);
  padding: 1.2rem 1.5rem 1.5rem;
  min-width: 420px;
  max-width: 720px;
  z-index: 50;
  backdrop-filter: blur(10px);
  pointer-events: auto;

  @media (max-width: 768px) {
    position: static;
    transform: none;
    width: 100%;
    box-shadow: none;
    border: 1px solid #ede9fe;
    margin-top: 0.5rem;
    max-width: none;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(106, 27, 130, 0.08);
  pointer-events: auto;
`;

const DropdownTitle = styled.span`
  font-weight: 700;
  color: #1f2937;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
`;

const DropdownSubtitle = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const DropdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.7rem;
  pointer-events: auto;
`;

const DropdownPill = styled.button`
  width: 100%;
  text-align: left;
  background: linear-gradient(180deg, rgba(106, 27, 130, 0.06) 0%, rgba(106, 27, 130, 0.02) 100%);
  border: 1px solid rgba(106, 27, 130, 0.16);
  padding: 0.6rem 0.7rem;
  font-size: 0.9rem;
  color: #43325f;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  pointer-events: auto;

  &:hover {
    background: rgba(106, 27, 130, 0.16);
    color: #3f1b82;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(76, 29, 149, 0.16);
  }
`;

const L2Link = styled.a`
  display: block;
  width: 100%;
  text-align: left;
  background: rgba(106,27,130,0.04);
  border: 1px dashed rgba(106, 27, 130, 0.16);
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  color: #43325f;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  pointer-events: auto !important;
  text-decoration: none;
  margin-left: 1rem;
  grid-column: 1 / -1;
  position: relative;
  z-index: 100;

  &:hover {
    background: rgba(106,27,130,0.12);
    color: #3f1b82;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(76, 29, 149, 0.16);
  }
  
  &:active {
    background: rgba(106,27,130,0.20);
    transform: translateY(0);
  }
`;

const Navigation = ({ isMobileMenuOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [openSlug, setOpenSlug] = useState(null);
  const [expandedSubSlug, setExpandedSubSlug] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Immediately try cached data first
        const cached = getCachedData();
        if (cached && cached.allCategories && cached.allCategories.length > 0) {
          setMenuCategories(cached.allCategories);
          return; // Use cached data, skip fetch
        }
        
        // Only fetch if no cache
        const { categories, allCategories } = await fetchFrontendData();
        const roots = (allCategories && allCategories.length ? allCategories : categories) || [];
        
        if (roots && roots.length > 0) {
          setMenuCategories(roots);
        } else {
          setMenuCategories([]);
        }
      } catch (err) {
        console.error('Navigation: Failed to fetch categories:', err.message);
        setMenuCategories([]);
      }
    };
    
    // Load immediately
    fetchCategories();
    
    // Listen for database changes
    const unsubscribe = onDataChange((type) => {
      if (type === 'categories') {
        fetchCategories();
      }
    });
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCategories();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Click outside handler to close dropdowns
    const handleClickOutside = (e) => {
      // Close dropdown if clicking outside navigation
      if (!e.target.closest('nav')) {
        setOpenSlug(null);
        setExpandedSubSlug(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleClickOutside);
    };
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

  return (
    <Nav $isMobileMenuOpen={isMobileMenuOpen}>
      <NavItem>
        <NavLink
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname !== '/') {
              navigate('/');
            }
            setOpenSlug(null);
            setExpandedSubSlug(null);
            if (onClose) onClose(); // Close mobile menu
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Home
        </NavLink>
      </NavItem>

      {(() => {
        // Get all root categories (no parent_id) and sort them
        const rootCategories = (menuCategories || [])
          .filter((c) => !c.parent_id)
          .sort((a, b) => {
            // Sort by sort_order first, then by name
            const orderA = a.sort_order ?? 999;
            const orderB = b.sort_order ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return (a.name || '').localeCompare(b.name || '');
          });

        return rootCategories.map((category) => {
          const categorySlug = category.slug || category.id || normalize(category.name || '');
          const label = category._navLabel || category.name;
          
          // Get direct children (L1 subcategories)
          const directChildren = (menuCategories || []).filter(
            (c) => c.parent_id === category.id || c.parent_id === categorySlug
          );
          
          const hasDropdown = directChildren.length > 0;
          
          return (
            <NavItem
              key={categorySlug}
              onMouseEnter={() => {
                if (window.innerWidth > 768 && hasDropdown) setOpenSlug(categorySlug);
              }}
            >
              <NavLink
                href={`/service/${categorySlug}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (window.innerWidth <= 768) {
                    // Mobile: toggle dropdown if has children, else navigate
                    if (hasDropdown) {
                      const nextState = openSlug === categorySlug ? null : categorySlug;
                      setOpenSlug(nextState);
                      if (nextState === null) setExpandedSubSlug(null);
                    } else {
                      navigate(`/service/${categorySlug}`);
                      if (onClose) onClose(); // Close mobile menu
                    }
                  } else {
                    // Desktop: navigate
                    navigate(`/service/${categorySlug}`);
                    setOpenSlug(null);
                    setExpandedSubSlug(null);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {label}
                {hasDropdown && window.innerWidth <= 768 && ' ▼'}
              </NavLink>
              
              {/* Dropdown Menu - Only render if has children */}
              {hasDropdown && openSlug === categorySlug && (
                <DropdownPanel
                  onMouseEnter={() => {
                    // Keep dropdown open when hovering over it
                    if (window.innerWidth > 768) {
                      setOpenSlug(categorySlug);
                    }
                  }}
                >
                  <DropdownHeader>
                    <DropdownTitle>{label}</DropdownTitle>
                    <DropdownSubtitle>{directChildren.length} options</DropdownSubtitle>
                  </DropdownHeader>
                  
                  <DropdownGrid>
                    {directChildren
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((child) => {
                        const childSlug = child.slug || child.id || normalize(child.name || '');
                        const grandchildren = (menuCategories || []).filter((c) => c.parent_id === child.id);
                        const hasGrandchildren = grandchildren.length > 0;
                        const isExpanded = expandedSubSlug === childSlug;
                                          
                        return (
                          <React.Fragment key={childSlug}>
                            {/* L1 Item */}
                            <DropdownPill
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (hasGrandchildren) {
                                  setExpandedSubSlug(isExpanded ? null : childSlug);
                                } else {
                                  navigate(`/service/${childSlug}`);
                                  setOpenSlug(null);
                                  setExpandedSubSlug(null);
                                  if (onClose) onClose(); // Close mobile menu
                                }
                              }}
                              onMouseEnter={() => {
                                if (hasGrandchildren && window.innerWidth > 768) {
                                  setExpandedSubSlug(childSlug);
                                }
                              }}
                              style={{
                                fontWeight: isExpanded ? 600 : 500,
                                background: isExpanded ? 'rgba(106,27,130,0.12)' : 'linear-gradient(180deg, rgba(106, 27, 130, 0.06) 0%, rgba(106, 27, 130, 0.02) 100%)',
                                cursor: 'pointer',
                              }}
                            >
                              {child.name}
                              {hasGrandchildren && ' ›'}
                            </DropdownPill>
                                              
                            {/* L2 Items - Show below L1 */}
                            {hasGrandchildren && isExpanded && (() => {
                              // Custom sorting for airport-transfers and vehicle-hire
                              const airportOrder = {
                                'heathrow-lhr': 1,
                                'gatwick-lgw': 2,
                                'stansted-airport-stn': 3,
                                'luton-airport-ltn': 4,
                                'city-airport-lcy': 5
                              };
                              
                              const vehicleOrder = {
                                'saloon-car': 1,
                                'estate-car': 2,
                                'mpv': 3,
                                'mpv-plus': 4,
                                '8-seater': 5,
                                '16-seater': 6,
                                '23-seater': 7,
                                '33-seater': 8,
                                '51-seater': 9,
                                '83-seater': 10
                              };
                              
                              const sortedGrandchildren = grandchildren.sort((a, b) => {
                                const slugA = normalize(a.slug || a.name || '');
                                const slugB = normalize(b.slug || b.name || '');
                                
                                // Check if parent is airport-transfers
                                if (childSlug === 'airport-transfers') {
                                  const orderA = airportOrder[slugA] || 999;
                                  const orderB = airportOrder[slugB] || 999;
                                  return orderA - orderB;
                                }
                                
                                // Check if parent is vehicle-hire
                                if (childSlug === 'vehicle-hire') {
                                  const orderA = vehicleOrder[slugA] || 999;
                                  const orderB = vehicleOrder[slugB] || 999;
                                  return orderA - orderB;
                                }
                                
                                return (a.sort_order || 0) - (b.sort_order || 0);
                              });
                              
                              return sortedGrandchildren.map((grandchild) => {
                                const grandchildSlug = grandchild.slug || grandchild.id || normalize(grandchild.name || '');
                                // For airport-transfers and vehicle-hire subcategories, link to parent instead
                                // Check if parent (child) is airport-transfers or vehicle-hire
                                const parentCategory = menuCategories.find(c => c.id === grandchild.parent_id);
                                const parentSlug = parentCategory?.slug;
                                const targetSlug = (parentSlug === 'airport-transfers' || parentSlug === 'vehicle-hire') ? parentSlug : grandchildSlug;
                                return (
                                  <L2Link
                                    key={grandchildSlug}
                                    href={`/service/${targetSlug}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate(`/service/${targetSlug}`);
                                      setOpenSlug(null);
                                      setExpandedSubSlug(null);
                                      if (onClose) onClose();
                                    }}
                                  >
                                    ↳ {grandchild.name}
                                  </L2Link>
                                );
                              });
                            })()}
                          </React.Fragment>
                        );
                      })}
                  </DropdownGrid>
                </DropdownPanel>
              )}
            </NavItem>
          );
        });
      })()}

      <NavItem>
        <NavLink
          href="/contact-us"
          onClick={(e) => {
            e.preventDefault();
            navigate('/contact-us');
            if (onClose) onClose(); // Close mobile menu
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact
        </NavLink>
      </NavItem>

      <CTAButton
        onClick={(e) => {
          handleNavClick(e, 'contact');
          if (onClose) onClose(); // Close mobile menu
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Book Now
      </CTAButton>
    </Nav>
  );
};

export default Navigation;
