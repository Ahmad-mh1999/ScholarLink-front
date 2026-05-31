import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FilterTabs from './FilterTabs';
import ArticleCard from './ArticleCard';

const TrendingArticles = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  // Mock data - replace with actual API call
  const mockArticles = [
    {
      id: 1,
      title: 'Advances in Machine Learning for Medical Diagnosis: A Comprehensive Review',
      authors: 'Dr. Sarah Chen, Prof. Michael Roberts, Dr. Emily Watson',
      category: 'Medical AI',
      abstract: 'This systematic review examines recent developments in machine learning applications for medical diagnosis, highlighting breakthrough algorithms and their clinical implementations.',
      readTime: '12 min',
      views: 2450,
      slug: 'advances-ml-medical-diagnosis'
    },
    {
      id: 2,
      title: 'Climate Change Impact on Biodiversity: Evidence from Long-term Ecological Studies',
      authors: 'Dr. James Anderson, Dr. Lisa Martinez, Prof. David Kim',
      category: 'Environmental Science',
      abstract: 'Analysis of 50-year ecological datasets reveals significant shifts in species distribution and ecosystem dynamics due to changing climate patterns.',
      readTime: '15 min',
      views: 1890,
      slug: 'climate-change-biodiversity'
    },
    {
      id: 3,
      title: 'Quantum Computing Applications in Cryptography: Current State and Future Prospects',
      authors: 'Prof. Alan Turing, Dr. Grace Hopper, Dr. Katherine Johnson',
      category: 'Quantum Computing',
      abstract: 'Exploring the potential of quantum algorithms to break classical cryptographic systems and the development of post-quantum cryptography solutions.',
      readTime: '18 min',
      views: 3200,
      slug: 'quantum-computing-cryptography'
    },
    {
      id: 4,
      title: 'Neuroplasticity in Adult Brain: Mechanisms and Therapeutic Implications',
      authors: 'Dr. Maria Garcia, Prof. John Smith, Dr. Anna Lee',
      category: 'Neuroscience',
      abstract: 'Investigating the molecular mechanisms underlying adult neuroplasticity and their applications in treating neurological disorders and cognitive decline.',
      readTime: '14 min',
      views: 1560,
      slug: 'neuroplasticity-adult-brain'
    },
    {
      id: 5,
      title: 'Sustainable Energy Storage: Next-Generation Battery Technologies',
      authors: 'Dr. Robert Johnson, Prof. Jennifer Williams, Dr. Thomas Brown',
      category: 'Energy',
      abstract: 'Comprehensive analysis of emerging battery technologies including solid-state batteries, lithium-sulfur systems, and their potential for grid-scale energy storage.',
      readTime: '16 min',
      views: 2100,
      slug: 'sustainable-energy-storage'
    },
    {
      id: 6,
      title: 'Social Media Impact on Mental Health: A Meta-Analysis of Recent Studies',
      authors: 'Dr. Emily Davis, Prof. Mark Thompson, Dr. Sarah Wilson',
      category: 'Psychology',
      abstract: 'Synthesizing findings from 200+ studies to understand the complex relationship between social media usage patterns and mental health outcomes across demographics.',
      readTime: '11 min',
      views: 2780,
      slug: 'social-media-mental-health'
    },
  ];

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // In production, this would trigger an API call with the filter parameter
  };

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A365D] mb-4">
            Trending & Latest Articles
          </h2>
          <p className="text-lg text-[#2D3748] max-w-2xl mx-auto">
            Discover cutting-edge research from leading academics across all disciplines.
          </p>
        </div>

        {/* Filter Tabs */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A365D] text-white rounded-2xl font-bold hover:bg-[#2D3748] transition-all shadow-lg"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingArticles;
