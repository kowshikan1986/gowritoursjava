import React from 'react';
import Hero from '../components/sections/Hero';
import PromotionalBanner from '../components/sections/PromotionalBanner';
import TourPackages from '../components/sections/TourPackages';
import Services from '../components/sections/Services';

const Home = () => {
  return (
    <>
      <Hero />
      <PromotionalBanner />
      <TourPackages />
      <Services />
    </>
  );
};

export default Home;
