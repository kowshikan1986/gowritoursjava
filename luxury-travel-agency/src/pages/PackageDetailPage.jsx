import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, ClockIcon, CurrencyPoundIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { initDatabase, getTours, isDatabaseReady } from '../services/database';
import { servicesData } from '../data/servicesData';

const PageContainer = styled.div`
  padding-top: 0;
  background: #f9fafb;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  height: 60vh;
  position: relative;
  background-image: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.9) 100%
  ), url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  color: white;
  padding-bottom: 4rem;

  @media (max-width: 768px) {
    height: 50vh;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Badge = styled.span`
  background: #6A1B82;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
  opacity: 0.9;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: -3rem auto 0;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    margin-top: 2rem;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 968px) {
    margin-top: 2rem;
  }
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;

  @media (max-width: 968px) {
    position: relative;
    top: 0;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const PriceTag = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #6A1B82;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PriceNote = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const BookButton = styled(Link)`
  display: block;
  width: 100%;
  background: linear-gradient(135deg, #6A1B82 0%, #7C2E9B 100%);
  color: #FFFFFF;
  text-align: center;
  padding: 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(106, 27, 130, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(106, 27, 130, 0.45);
    background: linear-gradient(135deg, #7C2E9B 0%, #6A1B82 100%);
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(106, 27, 130, 0.4);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  border-bottom: 3px solid #6A1B82;
  padding-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #6A1B82;
    width: 28px;
    height: 28px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HighlightList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const HighlightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #4a4a4a;
  line-height: 1.5;

  svg {
    width: 20px;
    height: 20px;
    color: #10b981; /* Green check */
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ItineraryItem = styled.div`
  margin-bottom: 2rem;
  border-left: 2px solid #e5e7eb;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: '${props => props.day}';
    position: absolute;
    left: -1rem;
    top: 0;
    width: 2rem;
    height: 2rem;
    background: #6A1B82;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
  }
`;

const DayTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const DayDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 1rem 0;
  margin-right: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.active ? '#6A1B82' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#6A1B82' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #6A1B82;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #1a1a1a;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const OfferBanner = styled.div`
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  color: #78350f;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
`;

const InfoBox = styled.div`
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  border-left: 4px solid #6A1B82;
`;

const GalleryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const GalleryImage = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const GalleryImageContent = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  color: white;
  z-index: 1;
  
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-family: 'Playfair Display', serif;
  }
  
  p {
    font-size: 0.9rem;
    line-height: 1.4;
    opacity: 0.95;
    margin: 0;
  }
`;

const PackageDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPackageData = async () => {
      setLoading(true);
      setNotFound(false);
      
      console.log('PackageDetailPage: Looking for package with id:', id);
      
      // 1. Try fetching from local SQL database first
      try {
        await initDatabase();
        
        // Wait for database to be fully ready with retry
        let retries = 0;
        while (!isDatabaseReady() && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        console.log('PackageDetailPage: Database ready after', retries, 'retries');
        
        const tours = getTours();
        console.log('PackageDetailPage: Found tours in database:', tours.length, tours.map(t => ({ slug: t.slug, id: t.id, title: t.title })));
        
        const tour = tours.find(t => t.slug === id || String(t.id) === String(id));
        console.log('PackageDetailPage: Matched tour:', tour ? tour.title : 'NOT FOUND (slug: ' + id + ')');
        
        if (!tour && tours.length > 0) {
          console.log('PackageDetailPage: Available slugs:', tours.map(t => t.slug));
        }
        
        if (tour) {
          // Parse details_json
          let details = {};
          try {
            details = JSON.parse(tour.details_json || '{}');
            console.log('PackageDetailPage: Parsed tour details:', details);
          } catch (e) {
            console.error('Failed to parse tour details:', e);
          }
          
          // Map database tour to component structure
          setPackageData({
            id: tour.slug,
            title: tour.title,
            code: tour.tour_code,
            price: `£${tour.price}`,
            duration: tour.duration,
            location: tour.location,
            description: tour.description,
            image: tour.featured_image,
            highlights: details.highlights || [],
            priceIncludes: details.priceIncludes || [],
            itinerary: details.itinerary || [],
            pickupPoints: details.pickupPoints || [],
            earlyBirdOffer: details.earlyBirdOffer || null,
            hotels: details.hotels || '',
            starDifference: details.starDifference || [],
            additionalExcursions: details.additionalExcursions || [],
            galleryImages: details.galleryImages || [],
          });
          
          document.title = `${tour.title} | Luxury Travel Agency`;
          window.scrollTo(0, 0);
          setLoading(false);
          return; // Exit if database fetch successful
        }
      } catch (error) {
        console.log('Fetching from local database failed, falling back to static data:', error);
      }

      // 2. Fallback to static data from servicesData
      let foundPackage = null;
      for (const service of servicesData) {
        if (service.packages) {
          foundPackage = service.packages.find(p => p.id === id);
          if (foundPackage) break;
        }
      }
      
      if (foundPackage) {
        setPackageData(foundPackage);
        document.title = `${foundPackage.title} | Luxury Travel Agency`;
        window.scrollTo(0, 0);
      } else {
        console.log('PackageDetailPage: Package not found in database or static data');
        setNotFound(true);
      }
      
      setLoading(false);
    };

    fetchPackageData();
  }, [id]);

  if (loading) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading tour details...</p>
        </div>
      </PageContainer>
    );
  }

  if (notFound || !packageData) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Tour Not Found</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>The tour "{id}" could not be found.</p>
          <Link to="/service/tours" style={{ color: '#6A1B82', textDecoration: 'underline' }}>Browse all tours</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection bgImage={packageData.image}>
        <HeroContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {packageData.code && <Badge>Code: {packageData.code}</Badge>}
            <Title>{packageData.title}</Title>
            <MetaInfo>
              <div><MapPinIcon /> {packageData.location}</div>
              <div><ClockIcon /> {packageData.duration}</div>
            </MetaInfo>
          </motion.div>
        </HeroContent>
      </HeroSection>

      <ContentContainer>
        <MainContent>
          <TabContainer>
            <TabButton 
              active={activeTab === 'itinerary'} 
              onClick={() => setActiveTab('itinerary')}
            >
              Itinerary
            </TabButton>
            <TabButton 
              active={activeTab === 'pickups'} 
              onClick={() => setActiveTab('pickups')}
            >
              Pick Up Points
            </TabButton>
          </TabContainer>

          <AnimatePresence mode="wait">
            {activeTab === 'itinerary' && (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Early Bird Offer */}
                {packageData.earlyBirdOffer && (
                  <OfferBanner>
                    {packageData.earlyBirdOffer}
                  </OfferBanner>
                )}
                
                <p style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#666' }}>
                  {packageData.description}
                </p>
                
                {/* Tour Highlights */}
                {packageData.highlights && packageData.highlights.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Tour Highlights</SectionTitle>
                    <HighlightList>
                      {packageData.highlights.map((highlight, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon />
                          {highlight}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {/* Price Includes */}
                {packageData.priceIncludes && packageData.priceIncludes.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Price Includes</SectionTitle>
                    <HighlightList>
                      {packageData.priceIncludes.map((item, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon style={{ color: '#6A1B82' }} />
                          {item}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {/* The Star Difference */}
                {packageData.starDifference && packageData.starDifference.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> The Star Difference</SectionTitle>
                    <HighlightList>
                      {packageData.starDifference.map((item, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon style={{ color: '#fbbf24' }} />
                          {item}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                  <div>
                    <SectionTitle><CalendarIcon /> Day-wise Itinerary</SectionTitle>
                    {packageData.itinerary.map((item) => (
                      <ItineraryItem key={item.day} day={item.day}>
                        <DayTitle>Day {item.day}: {item.title}</DayTitle>
                        <DayDescription>{item.description}</DayDescription>
                      </ItineraryItem>
                    ))}
                  </div>
                ) : (
                  <p>Itinerary details coming soon.</p>
                )}
                
                {/* Hotels */}
                {packageData.hotels && (
                  <InfoBox>
                    <h4 style={{ marginBottom: '0.5rem', color: '#6A1B82' }}>Hotels</h4>
                    <p style={{ margin: 0, color: '#4a4a4a' }}>{packageData.hotels}</p>
                  </InfoBox>
                )}
                
                {/* Additional Excursions */}
                {packageData.additionalExcursions && packageData.additionalExcursions.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <SectionTitle>Additional Excursions</SectionTitle>
                    <Table>
                      <thead>
                        <tr>
                          <th>Excursions</th>
                          <th>Adult</th>
                          <th>Child</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packageData.additionalExcursions.map((exc, index) => (
                          <tr key={index}>
                            <td>{exc.name}</td>
                            <td>{exc.adult}</td>
                            <td>{exc.child}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'pickups' && (
              <motion.div
                key="pickups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle><MapPinIcon /> Pick Up Points</SectionTitle>
                {packageData.pickupPoints && packageData.pickupPoints.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Departure Point</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageData.pickupPoints.map((point, index) => (
                        <tr key={index}>
                          <td>{point.location}</td>
                          <td>{point.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>Contact us for pick up details.</p>
                )}
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                  Please Note: All pick ups are Northbound Services and all drops will be Southbound Services. Pick ups are subject to availability and change.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </MainContent>

        <Sidebar>
          <BookingCard>
            <PriceTag>{packageData.price}</PriceTag>
            <PriceNote>Per person based on twin sharing</PriceNote>
            <BookButton to="/#contact">Book This Tour</BookButton>
            
            {/* Tour Gallery */}
            {packageData.galleryImages && packageData.galleryImages.length > 0 ? (
              <GalleryGrid>
                {packageData.galleryImages.map((item, index) => (
                  <GalleryImage key={index} bgImage={item.image}>
                    <GalleryImageContent>
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                    </GalleryImageContent>
                  </GalleryImage>
                ))}
              </GalleryGrid>
            ) : (
              <GalleryGrid>
                <GalleryImage bgImage="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop">
                  <GalleryImageContent>
                    <h4>Edinburgh Castle</h4>
                    <p>Explore the historic fortress overlooking Scotland's capital</p>
                  </GalleryImageContent>
                </GalleryImage>
                
                <GalleryImage bgImage="https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=2071&auto=format&fit=crop">
                  <GalleryImageContent>
                    <h4>Glasgow Cathedral</h4>
                    <p>Visit the stunning medieval cathedral in the heart of Glasgow</p>
                  </GalleryImageContent>
                </GalleryImage>
                
                <GalleryImage bgImage="https://images.unsplash.com/photo-1580709413627-83c5e5e6df80?q=80&w=2070&auto=format&fit=crop">
                  <GalleryImageContent>
                    <h4>Scottish Highlands</h4>
                    <p>Discover breathtaking landscapes and scenic routes</p>
                  </GalleryImageContent>
                </GalleryImage>
              </GalleryGrid>
            )}
          </BookingCard>
        </Sidebar>
      </ContentContainer>
    </PageContainer>
  );
};

export default PackageDetailPage;
