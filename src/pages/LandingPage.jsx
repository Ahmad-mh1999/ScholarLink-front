import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import TrendingArticles from '../components/landing/TrendingArticles';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Trending Articles Section */}
      <TrendingArticles />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
