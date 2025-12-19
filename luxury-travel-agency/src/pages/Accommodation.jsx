import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Page = styled.div`
  background: #f9fafb;
  min-height: 60vh;
  padding: 6rem 2rem 4rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #1a1a1a;
`;

const Subtitle = styled(motion.p)`
  color: #666;
  margin-top: 0.5rem;
`;

const Accommodation = () => {
  return (
    <Page>
      <Container>
        <Title initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Accommodation</Title>
        <Subtitle initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Explore our curated list of luxury hotels, villas, and boutique stays. Contact us to tailor stays to your itinerary.
        </Subtitle>
      </Container>
    </Page>
  );
};

export default Accommodation;
