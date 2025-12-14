import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { servicesData } from '../data/servicesData';

const PageContainer = styled.div`
  padding-top: 0;
`;

const HeroSection = styled.div`
  height: 60vh;
  position: relative;
  display: flex;
  align-items: center;
  justify_content: center;
  color: white;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${props => props.bgImage});
  background-size: cover;
  background-position: top center;
  margin-bottom: 4rem;
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
  z-index: 2;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const TextContent = styled.div`
  h2 {
    font-size: 2.5rem;
    font-family: 'Playfair Display', serif;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    
    span {
      color: #6A1B82;
    }
  }

  p {
    color: #666;
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const FeatureItem = styled(motion.li)`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #4a4a4a;
  font-size: 1.05rem;

  &:before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(106, 27, 130, 0.1);
    color: #6A1B82;
    border-radius: 50%;
    margin-right: 1rem;
    font-weight: bold;
    font-size: 0.8rem;
  }
`;

const ImageContainer = styled(motion.div)`
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 500px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  /* Purple accent border */
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid rgba(106, 27, 130, 0.2);
    border-radius: 20px;
    pointer-events: none;
  }
`;

const PackagesSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-family: 'Playfair Display', serif;
    color: #1a1a1a;
  }
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PackageCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 400px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

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
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
`;

const PackageLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
    color: #6A1B82;
  }
`;

const PackageDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #6A1B82;
`;

const ExploreButton = styled(Link)`
  background: #6A1B82;
  border: 2px solid #6A1B82;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(106, 27, 130, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(106, 27, 130, 0.25);
  }
`;

const CTASection = styled.div`
  background: #f9fafb;
  padding: 5rem 2rem;
  text-align: center;
  margin-top: 2rem;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 27, 130, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 27, 130, 0.4);
  }
`;

const NotFound = styled.div`
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  h1 {
    font-size: 3rem;
    color: #6A1B82;
    margin-bottom: 1rem;
  }
`;

const ServicePage = () => {
  const { id } = useParams();
  const service = servicesData.find(s => s.id === id);

  useEffect(() => {
    if (service) {
      document.title = `${service.seo.title} | Luxury Travel Agency`;
      window.scrollTo(0, 0);
    }
  }, [service]);

  if (!service) {
    return (
      <NotFound>
        <h1>Service Not Found</h1>
        <p>The service you are looking for does not exist.</p>
        <br />
        <CTAButton to="/">Back to Home</CTAButton>
      </NotFound>
    );
  }

  return (
    <PageContainer>
      <HeroSection bgImage={service.image}>
        <HeroContent>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {service.title}
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {service.shortDescription}
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        <TextContent>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Experience <span>Luxury</span></h2>
            <p>{service.fullDescription}</p>
            
            <h3>Key Highlights</h3>
            <FeaturesList>
              {service.features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {feature}
                </FeatureItem>
              ))}
            </FeaturesList>
          </motion.div>
        </TextContent>

        <ImageContainer
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src={service.image} alt={service.title} />
        </ImageContainer>
      </ContentSection>

      {service.packages && service.packages.length > 0 && (
        <PackagesSection>
          <SectionHeader>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Available Packages
            </motion.h2>
          </SectionHeader>
          <PackagesGrid>
            {service.packages.map((pkg, index) => (
              <PackageCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardImage image={pkg.image} />
                <CardContent>
                  <PackageTitle>{pkg.title}</PackageTitle>
                  <PackageLocation>
                    <MapPinIcon />
                    {pkg.location}
                  </PackageLocation>
                  <PackageDescription>{pkg.description}</PackageDescription>
                  <CardFooter>
                    <Price>{pkg.price}</Price>
                    <ExploreButton to={`/package/${pkg.id}`}>
                      View Details
                      <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                    </ExploreButton>
                  </CardFooter>
                </CardContent>
              </PackageCard>
            ))}
          </PackagesGrid>
        </PackagesSection>
      )}

      <CTASection>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '1rem', color: '#1a1a1a' }}>
            Ready to Plan Your Trip?
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Contact our travel experts today to customize your {service.title} experience.
          </p>
          <CTAButton to="/#contact">Inquire Now</CTAButton>
        </motion.div>
      </CTASection>
    </PageContainer>
  );
};

export default ServicePage;
