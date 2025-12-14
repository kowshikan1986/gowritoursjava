import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, ClockIcon, CurrencyPoundIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { servicesData } from '../data/servicesData';

const PageContainer = styled.div`
  padding-top: 0;
  background: #f9fafb;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  height: 50vh;
  position: relative;
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  color: white;
  padding-bottom: 4rem;
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
  font-size: 3rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
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
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 100px;
`;

const PriceTag = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 0.5rem;
`;

const PriceNote = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const BookButton = styled(Link)`
  display: block;
  width: 100%;
  background: #6A1B82;
  color: #FFFFFF;
  text-align: center;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(106, 27, 130, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(106, 27, 130, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(106, 27, 130, 0.35);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #6A1B82;
    width: 24px;
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

const PackageDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [packageData, setPackageData] = useState(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      // 1. Try fetching from API first
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/tours/${id}/`);
        const tour = response.data;
        
        // Map API response to component structure
        setPackageData({
          id: tour.slug,
          title: tour.title,
          code: null, // Add to API if needed
          price: `£${tour.price}`,
          duration: tour.duration,
          location: tour.location,
          description: tour.description,
          image: tour.featured_image,
          highlights: [], // Add to API if needed
          priceIncludes: [], // Add to API if needed
          itinerary: [], // Add to API if needed
          pickupPoints: [] // Add to API if needed
        });
        
        document.title = `${tour.title} | Luxury Travel Agency`;
        window.scrollTo(0, 0);
        return; // Exit if API fetch successful
      } catch (error) {
        console.log('Fetching from API failed, falling back to static data:', error);
      }

      // 2. Fallback to static data
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
      }
    };

    fetchPackageData();
  }, [id]);

  if (!packageData) {
    return <div>Loading...</div>;
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
                <p style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#666' }}>
                  {packageData.description}
                </p>
                
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
            
            <div style={{ marginTop: '2rem' }}>
              <SectionTitle style={{ fontSize: '1.2rem' }}>Tour Highlights</SectionTitle>
              {packageData.highlights && (
                <HighlightList>
                  {packageData.highlights.map((highlight, index) => (
                    <HighlightItem key={index}>
                      <CheckCircleIcon />
                      {highlight}
                    </HighlightItem>
                  ))}
                </HighlightList>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <SectionTitle style={{ fontSize: '1.2rem' }}>Price Includes</SectionTitle>
              {packageData.priceIncludes && (
                <HighlightList>
                  {packageData.priceIncludes.map((item, index) => (
                    <HighlightItem key={index}>
                      <CheckCircleIcon style={{ color: '#6A1B82' }} />
                      {item}
                    </HighlightItem>
                  ))}
                </HighlightList>
              )}
            </div>
          </BookingCard>
        </Sidebar>
      </ContentContainer>
    </PageContainer>
  );
};

export default PackageDetailPage;
