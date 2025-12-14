import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { servicesData } from '../../data/servicesData';

const normalize = (str = '') =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SectionContainer = styled.section`
  padding: 8rem 0;
  background: white;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;

  /* Hide scrollbar on WebKit */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7b5d9;
    border-radius: 10px;
  }
`;

const PackageCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 450px;
  min-width: 360px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: #f5f5f5; /* Fallback */
  scroll-snap-align: start;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;

  ${PackageCard}:hover & {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.9) 100%
    );
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const PackageTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
  font-family: 'Playfair Display', serif;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PackageLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  svg {
    width: 16px;
    height: 16px;
    color: #ffffff;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
  }
`;

const PackageDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const SubCategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SubCategoryChip = styled(Link)`
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  text-decoration: none;
`;

const SubToggle = styled.button`
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.6rem;
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(106, 27, 130, 0.9);
  color: #ffffff;
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;
`;

const CategoryName = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  z-index: 10;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ExploreButton = styled(Link)`
  background: #6A1B82;
  border: 2px solid #6A1B82;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(106, 27, 130, 0.3);

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(106, 27, 130, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(106, 27, 130, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
    stroke-width: 2.5px;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const ServiceCard = ({ service, index }) => {
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const hasPackages = service.packages && service.packages.length > 0;
  const [showSubs, setShowSubs] = useState(false);

  useEffect(() => {
    if (!hasPackages) return;

    const interval = setInterval(() => {
      setCurrentPackageIndex((prev) => (prev + 1) % service.packages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hasPackages, service.packages]);

  const currentData = hasPackages ? service.packages[currentPackageIndex] : service;
  
  // Resolve link: if cycling packages, link to package detail. Else service page.
  const linkTo = hasPackages && currentData.id 
    ? `/package/${currentData.id}` 
    : `/service/${service.id}`;
  const categorySlug = service.id || service.slug || normalize(service.title);

  return (
    <PackageCard
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentData.title || service.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <CardImage image={currentData.image || service.image} />
          
          {/* Show Category Name if we are cycling packages inside a category */}
          {hasPackages && (
            <CategoryName>
              {service.title}
            </CategoryName>
          )}

          <CardContent>
            <PackageTitle>{currentData.title}</PackageTitle>
            <PackageLocation>
              <MapPinIcon />
              {currentData.location || service.location}
            </PackageLocation>
            
            <PackageDescription>
              {currentData.description || currentData.shortDescription}
            </PackageDescription>

            {service.subcategories && service.subcategories.length > 0 && (
              <>
                <SubToggle type="button" onClick={() => setShowSubs((v) => !v)}>
                  {showSubs ? 'Hide Subcategories' : 'View Subcategories'}
                </SubToggle>
                {showSubs && (
                  <SubCategoryList>
                    {service.subcategories.map((sub) => (
                      <SubCategoryChip
                        key={sub.slug || sub.id}
                        to={`/service/${categorySlug}?sub=${sub.slug || sub.id || ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.name}
                      </SubCategoryChip>
                    ))}
                  </SubCategoryList>
                )}
              </>
            )}

            <CardFooter>
              <Price>{currentData.price}</Price>
              <ExploreButton to={linkTo}>
                Explore
                <ArrowRightIcon />
              </ExploreButton>
            </CardFooter>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </PackageCard>
  );
};

const TourPackages = () => {
  const [services, setServices] = useState(servicesData);
  const [cruiseServices, setCruiseServices] = useState([]);
  const [transferServices, setTransferServices] = useState([]);
  const [vehicleServices, setVehicleServices] = useState([]);
  const [sriLankaServices, setSriLankaServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories/');
        const apiCategories = response.data;
        
        // Map API data to the structure used by the frontend
        const mappedServices = servicesData.map(staticService => {
          const staticSlug = normalize(staticService.id || staticService.title);
          // Find matching category from API (assuming slug or title match)
          // Since slugs might differ slightly, we can try to match by normalized title
          const apiCategory = apiCategories.find(
            cat => normalize(cat.name) === staticSlug || normalize(cat.slug) === staticSlug
          );

          if (apiCategory) {
            // Map the nested tours
            const apiPackages = apiCategory.tours ? apiCategory.tours.map(tour => ({
              id: tour.slug, // Use slug as ID for frontend routing
              title: tour.title,
              price: `From £${tour.price}`,
              location: tour.location,
              description: tour.description,
              image: tour.featured_image, // API returns full URL or relative path? Django Rest Framework usually returns full URL if request context is passed
              duration: tour.duration
            })) : [];

            const apiSubCategories = apiCategory.subcategories ? apiCategory.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              image: sub.image,
            })) : [];

            // If API has packages, use them. Otherwise fallback to static packages.
            // Also map category image if available
            return {
              ...staticService,
              image: apiCategory.image || staticService.image,
              packages: apiPackages.length > 0 ? apiPackages : staticService.packages,
              subcategories: apiSubCategories
            };
          }
          return staticService;
        });

        // Append any API categories not already mapped, so all main categories appear
        const usedSlugs = new Set(mappedServices.map(s => normalize(s.id || s.title)));
        const extraServices = apiCategories
          .filter(cat => !usedSlugs.has(normalize(cat.slug || cat.name)))
          .map(cat => {
            const apiPackages = cat.tours ? cat.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              price: tour.price ? `From £${tour.price}` : 'From £—',
              location: tour.location,
              description: tour.description,
              image: tour.featured_image,
              duration: tour.duration
            })) : [];

            const apiSubCategories = cat.subcategories ? cat.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              image: sub.image,
            })) : [];

            return {
              id: cat.slug || cat.name,
              title: cat.name,
              location: cat.description || '',
              price: apiPackages[0]?.price || 'From £—',
              shortDescription: cat.description || '',
              fullDescription: cat.description || '',
              image: cat.image || '',
              packages: apiPackages,
              subcategories: apiSubCategories,
              features: [],
              seo: { title: cat.name, description: cat.description || '' },
            };
          });

        const combined = [...mappedServices, ...extraServices];

        // Keep only main tour categories
        const allowedTourSlugs = new Set([
          'uk-tours',
          'european-tours',
          'world-tours',
          'group-tours',
          'private-tours',
        ]);
        const tourOnly = combined.filter(cat =>
          allowedTourSlugs.has(normalize(cat.id || cat.title))
        );

        // Capture Cruises separately
        const mapCategoryToCards = (cat, fallbackLabel) => {
          if (!cat) return [];
          if (cat.tours && cat.tours.length > 0) {
            return cat.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              location: tour.location || fallbackLabel,
              price: tour.price ? `From £${tour.price}` : 'From £—',
              shortDescription: tour.description || '',
              fullDescription: tour.description || '',
              image: tour.featured_image || cat.image || '',
              packages: [
                {
                  id: tour.slug,
                  title: tour.title,
                  price: tour.price ? `From £${tour.price}` : 'From £—',
                  location: tour.location,
                  description: tour.description,
                  image: tour.featured_image,
                  duration: tour.duration,
                },
              ],
              subcategories: cat.subcategories || [],
              features: [],
              seo: { title: tour.title, description: tour.description || '' },
            }));
          }
          // fallback single card
          return [
            {
              id: cat.slug || cat.name,
              title: cat.name,
              location: cat.description || fallbackLabel,
              price: 'From £—',
              shortDescription: cat.description || '',
              fullDescription: cat.description || '',
              image: cat.image || '',
              packages: [],
              subcategories: cat.subcategories || [],
              features: [],
              seo: { title: cat.name, description: cat.description || '' },
            },
          ];
        };

        const cruisesCat = apiCategories.find(cat => normalize(cat.slug || cat.name) === 'cruises');
        const transfersCat = apiCategories.find(cat => normalize(cat.slug || cat.name) === 'airport-transfers');
        const vehicleCat = apiCategories.find(cat => normalize(cat.slug || cat.name) === 'vehicle-hire');
        const sriLankaCat = apiCategories.find(cat => normalize(cat.slug || cat.name) === 'india-sri-lanka-tours');
        const otherCat = apiCategories.find(cat => normalize(cat.slug || cat.name) === 'other-servies');

        const cruisesMapped = mapCategoryToCards(cruisesCat, 'Cruise');
        const transfersMapped = mapCategoryToCards(transfersCat, 'Airport Transfer');
        const vehicleMapped = mapCategoryToCards(vehicleCat, 'Vehicle Hire');
        const sriLankaMapped = mapCategoryToCards(sriLankaCat, 'Sri Lanka Tours');
        const otherMapped = mapCategoryToCards(otherCat, 'Other Services');

        setServices(tourOnly);
        setCruiseServices(cruisesMapped);
        setTransferServices(transfersMapped);
        setVehicleServices(vehicleMapped);
        setSriLankaServices(sriLankaMapped);
        setOtherServices(otherMapped);
      } catch (error) {
        console.error('Error fetching services from API:', error);
        // Fallback to static data is automatic since initial state is servicesData
      }
    };

    fetchServices();
  }, []);

  return (
    <SectionContainer>
      <Container>
        <SectionHeader>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Exclusive Holiday Packages
          </SectionTitle>
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore our curated selection of premium tour packages designed for the ultimate travel experience
          </SectionSubtitle>
        </SectionHeader>

        <Grid>
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </Grid>

        {cruiseServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Cruises
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {cruiseServices.map((service, index) => (
                <ServiceCard key={`cruise-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>
        )}

        {transferServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Airport Transfers
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {transferServices.map((service, index) => (
                <ServiceCard key={`transfer-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>
        )}

        {vehicleServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Vehicle Hire
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {vehicleServices.map((service, index) => (
                <ServiceCard key={`vehicle-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>
        )}

        {sriLankaServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Sri Lanka Tours
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {sriLankaServices.map((service, index) => (
                <ServiceCard key={`slt-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>
        )}

        {otherServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Other Services
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {otherServices.map((service, index) => (
                <ServiceCard key={`other-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>
        )}
      </Container>
    </SectionContainer>
  );
};

export default TourPackages;
