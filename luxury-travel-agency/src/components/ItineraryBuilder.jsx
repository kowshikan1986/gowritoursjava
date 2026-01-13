import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  CurrencyPoundIcon, 
  CheckCircleIcon, 
  PlusIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const BuilderContainer = styled.div`
  max-width: 100%;
`;

const SectionHeader = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Playfair Display', serif;
  
  svg {
    width: 28px;
    height: 28px;
    color: #6A1B82;
  }
`;

const DefaultTourCard = styled(motion.div)`
  background: linear-gradient(135deg, #6A1B82 0%, #8B5CF6 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  }
`;

const DefaultTourBadge = styled.span`
  background: rgba(255,255,255,0.2);
  padding: 0.35rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
  backdrop-filter: blur(4px);
`;

const DefaultTourTitle = styled.h4`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  font-family: 'Playfair Display', serif;
`;

const DefaultTourMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    opacity: 0.95;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const OptionalToursSection = styled.div`
  margin-top: 2rem;
`;

const OptionalTourCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  border: 2px solid ${props => props.isAdded ? '#10b981' : '#e5e7eb'};
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isAdded ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'};
  
  &:hover {
    border-color: ${props => props.isAdded ? '#10b981' : '#6A1B82'};
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
`;

const OptionalTourHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  background: ${props => props.isAdded ? 'rgba(16, 185, 129, 0.05)' : 'transparent'};
`;

const OptionalTourInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const TourCheckbox = styled(motion.div)`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid ${props => props.isAdded ? '#10b981' : '#d1d5db'};
  background: ${props => props.isAdded ? '#10b981' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

const TourName = styled.h5`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const TourQuickInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: #6b7280;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  @media (max-width: 640px) {
    display: none;
  }
`;

const TourPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #6A1B82;
  white-space: nowrap;
`;

const ExpandButton = styled(motion.button)`
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const TourDetails = styled(motion.div)`
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
`;

const DetailSection = styled.div`
  margin-top: 1.25rem;
  
  h6 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #6A1B82;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const HighlightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  
  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #4a4a4a;
    padding: 0.5rem;
    background: white;
    border-radius: 8px;
    
    svg {
      width: 16px;
      height: 16px;
      color: #10b981;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const PrerequisitesList = styled.div`
  background: #fef3c7;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #f59e0b;
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #92400e;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    
    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.isAdded ? `
    background: #fef2f2;
    color: #dc2626;
    border: 2px solid #fecaca;
    
    &:hover {
      background: #fee2e2;
    }
  ` : `
    background: #6A1B82;
    color: white;
    border: 2px solid #6A1B82;
    
    &:hover {
      background: #5a1670;
    }
  `}
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SummarySection = styled(motion.div)`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2.5rem;
  color: white;
`;

const SummaryTitle = styled.h4`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Playfair Display', serif;
  
  svg {
    width: 24px;
    height: 24px;
    color: #fbbf24;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  
  &:last-of-type {
    border-bottom: none;
  }
  
  span:first-child {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    
    svg {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
  }
  
  span:last-child {
    font-weight: 600;
    color: #a5f3fc;
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(255,255,255,0.2);
  
  span:first-child {
    font-size: 1.2rem;
    font-weight: 700;
  }
  
  span:last-child {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fbbf24;
  }
`;

const TotalDuration = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #a5f3fc;
  }
  
  span {
    font-size: 1rem;
    color: #e5e7eb;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-style: italic;
`;

// Sample optional tours data (this would normally come from the database)
const defaultOptionalTours = [
  {
    id: 'shanklin-chine',
    name: 'Shanklin Chine Adventure',
    duration: '1.5 hours',
    price: 15,
    description: 'Explore the magical ravine with its stunning waterfalls and rare plants.',
    highlights: [
      'Beautiful waterfall views',
      'Rare plant species',
      'Historic pathways',
      'Heritage center visit',
      'Photo opportunities'
    ],
    prerequisites: 'Comfortable walking shoes required. Moderate fitness level needed.',
    category: 'Nature'
  },
  {
    id: 'needles-boat',
    name: 'The Needles Boat Trip',
    duration: '45 minutes',
    price: 12,
    description: 'Get up close to the famous Needles rocks and lighthouse from the sea.',
    highlights: [
      'Close-up views of The Needles',
      'Historic lighthouse',
      'Alum Bay colored sands',
      'Sea bird spotting',
      'Commentary throughout'
    ],
    prerequisites: 'Subject to weather conditions. Not suitable for those with severe motion sickness.',
    category: 'Adventure'
  },
  {
    id: 'osborne-house',
    name: 'Osborne House Royal Tour',
    duration: '2.5 hours',
    price: 25,
    description: 'Visit Queen Victoria\'s beloved seaside palace and its stunning gardens.',
    highlights: [
      'Queen Victoria\'s private rooms',
      'Swiss Cottage grounds',
      'Beautiful Italian gardens',
      'Beach and bathing machine',
      'Royal family history'
    ],
    prerequisites: 'English Heritage property. Some areas require stair climbing.',
    category: 'Heritage'
  },
  {
    id: 'garlic-farm',
    name: 'Isle of Wight Garlic Farm',
    duration: '1.5 hours',
    price: 8,
    description: 'Visit the famous garlic farm with tastings and farm shop.',
    highlights: [
      'Farm tour',
      'Garlic tastings',
      'Farm shop visit',
      'Restaurant sampling',
      'Unique garlic products'
    ],
    prerequisites: 'No special requirements. Restaurant booking recommended.',
    category: 'Food & Drink'
  },
  {
    id: 'steam-railway',
    name: 'Isle of Wight Steam Railway',
    duration: '1 hour',
    price: 18,
    description: 'Journey through beautiful countryside on a vintage steam train.',
    highlights: [
      'Victorian steam locomotive',
      'Scenic countryside views',
      'Historic stations',
      'Railway museum',
      'Gift shop'
    ],
    prerequisites: 'Trains run on scheduled times. Check timetable in advance.',
    category: 'Heritage'
  },
  {
    id: 'blackgang-chine',
    name: 'Blackgang Chine Theme Park',
    duration: '3 hours',
    price: 22,
    description: 'Britain\'s oldest amusement park with themed lands and attractions.',
    highlights: [
      'Dinosaur land',
      'Pirate cove',
      'Fairy village',
      'Maze and gardens',
      'Cliff-top views'
    ],
    prerequisites: 'Ideal for families. Some attractions have height restrictions.',
    category: 'Family Fun'
  }
];

const ItineraryBuilder = ({ defaultTour, optionalTours = defaultOptionalTours, onSelectionChange }) => {
  const [addedTours, setAddedTours] = useState([]);
  const [expandedTour, setExpandedTour] = useState(null);
  
  const baseTour = defaultTour || {
    name: 'Isle of Wight Discovery Tour',
    duration: '8 hours',
    price: 60,
    childPrice: 45,
    description: 'Explore the beautiful Isle of Wight with guided stops at key attractions.',
    included: ['Coach transport', 'Professional guide', 'Ferry crossing', 'All entrance fees']
  };
  
  const toggleTour = (tourId) => {
    setAddedTours(prev => {
      const newSelection = prev.includes(tourId)
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId];
      
      if (onSelectionChange) {
        const selectedTours = optionalTours.filter(t => newSelection.includes(t.id));
        onSelectionChange(selectedTours);
      }
      
      return newSelection;
    });
  };
  
  const toggleExpand = (tourId, e) => {
    e.stopPropagation();
    setExpandedTour(prev => prev === tourId ? null : tourId);
  };
  
  const calculateTotal = () => {
    const addedToursData = optionalTours.filter(t => addedTours.includes(t.id));
    const optionalTotal = addedToursData.reduce((sum, tour) => sum + tour.price, 0);
    return baseTour.price + optionalTotal;
  };
  
  const calculateTotalDuration = () => {
    const addedToursData = optionalTours.filter(t => addedTours.includes(t.id));
    let totalMinutes = 0;
    
    // Parse base tour duration
    const baseMatch = baseTour.duration.match(/(\d+)/);
    if (baseMatch) {
      totalMinutes += parseInt(baseMatch[1]) * 60;
    }
    
    // Add optional tours duration
    addedToursData.forEach(tour => {
      const hourMatch = tour.duration.match(/(\d+\.?\d*)\s*hour/);
      const minMatch = tour.duration.match(/(\d+)\s*min/);
      if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1]);
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };
  
  return (
    <BuilderContainer>
      {/* Default Tour Package */}
      <SectionHeader>
        <CalendarDaysIcon /> Day 1 Itinerary
      </SectionHeader>
      
      <DefaultTourCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DefaultTourBadge>✓ Included in Package</DefaultTourBadge>
        <DefaultTourTitle>{baseTour.name}</DefaultTourTitle>
        <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>{baseTour.description}</p>
        <DefaultTourMeta>
          <div><ClockIcon /> {baseTour.duration}</div>
          <div><CurrencyPoundIcon /> Adult: £{baseTour.price}</div>
          {baseTour.childPrice && <div>Child: £{baseTour.childPrice}</div>}
        </DefaultTourMeta>
        {baseTour.included && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Includes:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {baseTour.included.map((item, idx) => (
                <span key={idx} style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '0.35rem 0.75rem', 
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}>
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </DefaultTourCard>
      
      {/* Optional Additional Tours */}
      <OptionalToursSection>
        <SectionHeader>
          <SparklesIcon /> Optional Additional Tours
        </SectionHeader>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', marginTop: '-1rem' }}>
          Enhance your Day 1 experience with these optional excursions. Click to see details and add to your itinerary.
        </p>
        
        {optionalTours.map((tour, index) => {
          const isAdded = addedTours.includes(tour.id);
          const isExpanded = expandedTour === tour.id;
          
          return (
            <OptionalTourCard
              key={tour.id}
              isAdded={isAdded}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <OptionalTourHeader 
                isAdded={isAdded}
                onClick={(e) => toggleExpand(tour.id, e)}
              >
                <OptionalTourInfo>
                  <TourCheckbox
                    isAdded={isAdded}
                    onClick={(e) => { e.stopPropagation(); toggleTour(tour.id); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAdded && <CheckCircleIcon />}
                  </TourCheckbox>
                  <div>
                    <TourName>{tour.name}</TourName>
                    <TourQuickInfo>
                      <span><ClockIcon /> {tour.duration}</span>
                      <span style={{ 
                        background: '#f3f4f6', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {tour.category}
                      </span>
                    </TourQuickInfo>
                  </div>
                </OptionalTourInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <TourPrice>+£{tour.price}</TourPrice>
                  <ExpandButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </ExpandButton>
                </div>
              </OptionalTourHeader>
              
              <AnimatePresence>
                {isExpanded && (
                  <TourDetails
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p style={{ color: '#4a4a4a', lineHeight: '1.6', paddingTop: '1rem' }}>
                      {tour.description}
                    </p>
                    
                    <DetailSection>
                      <h6><SparklesIcon /> Highlights</h6>
                      <HighlightsList>
                        {tour.highlights.map((highlight, idx) => (
                          <li key={idx}>
                            <CheckCircleIcon />
                            {highlight}
                          </li>
                        ))}
                      </HighlightsList>
                    </DetailSection>
                    
                    {tour.prerequisites && (
                      <DetailSection>
                        <h6><ExclamationTriangleIcon /> Prerequisites & Notes</h6>
                        <PrerequisitesList>
                          <p>
                            <ExclamationTriangleIcon />
                            {tour.prerequisites}
                          </p>
                        </PrerequisitesList>
                      </DetailSection>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <AddButton
                        isAdded={isAdded}
                        onClick={() => toggleTour(tour.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isAdded ? (
                          <>
                            <MinusIcon /> Remove from Itinerary
                          </>
                        ) : (
                          <>
                            <PlusIcon /> Add to Itinerary
                          </>
                        )}
                      </AddButton>
                    </div>
                  </TourDetails>
                )}
              </AnimatePresence>
            </OptionalTourCard>
          );
        })}
      </OptionalToursSection>
      
      {/* Summary Section */}
      <SummarySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <SummaryTitle>
          <CalendarDaysIcon /> Your Day 1 Itinerary Summary
        </SummaryTitle>
        
        <SummaryItem>
          <span><CheckCircleIcon /> {baseTour.name}</span>
          <span>£{baseTour.price}</span>
        </SummaryItem>
        
        {addedTours.length > 0 ? (
          <>
            {optionalTours
              .filter(t => addedTours.includes(t.id))
              .map(tour => (
                <SummaryItem key={tour.id}>
                  <span><PlusIcon /> {tour.name}</span>
                  <span>+£{tour.price}</span>
                </SummaryItem>
              ))
            }
          </>
        ) : (
          <EmptyMessage>No optional tours added yet</EmptyMessage>
        )}
        
        <TotalRow>
          <span>Total Day 1 Cost</span>
          <span>£{calculateTotal()}</span>
        </TotalRow>
        
        <TotalDuration>
          <ClockIcon />
          <span>Estimated Duration: {calculateTotalDuration()}</span>
        </TotalDuration>
      </SummarySection>
    </BuilderContainer>
  );
};

export default ItineraryBuilder;
