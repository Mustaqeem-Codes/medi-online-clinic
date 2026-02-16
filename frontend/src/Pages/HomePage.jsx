// frontend/src/pages/HomePage.jsx
import React from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Features from '../components/home/Features';
import DoctorCategories from '../components/home/DoctorCategories';
import Testimonials from '../components/home/Testimonials';
import Stats from '../components/home/Stats';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';
// import FloatingBookButton from '../components/home/FloatingBookButton'; // optional

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <DoctorCategories />
      <Testimonials />
      <Stats />
      <CTASection />
      <Footer />
    </>
  );
};

export default HomePage;