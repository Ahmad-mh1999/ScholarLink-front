import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetLandingStatsQuery } from '../../api/baseApi';

const Hero = () => {
  const { data: stats, isLoading } = useGetLandingStatsQuery();
  return (
    <section className="relative bg-gradient-to-br from-[#1A365D] via-[#1A365D] to-[#2D3748] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#319795] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#319795] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#319795]/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#319795]/10 border border-[#319795]/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#319795]" />
            <span className="text-sm font-semibold text-[#319795]">
              Trusted by {isLoading ? '...' : stats?.total_researchers || 0}+ Researchers Worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
            Advance Your{' '}
            <span className="text-[#319795]">Research Career</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Streamline your publication journey with expert peer review, intelligent journal matching, 
            and comprehensive publication support. Join a global community of academics accelerating 
            their research impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#319795] text-white rounded-2xl font-bold hover:bg-[#287E7B] transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
            >
              Submit Your Manuscript
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Browse Published Articles
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {isLoading ? '...' : stats?.total_researchers || 0}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Researchers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {isLoading ? '...' : stats?.total_articles || 0}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {isLoading ? '...' : stats?.total_journals || 0}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Journals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">98%</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-24 lg:h-32">
          <path
            fill="#F7FAFC"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
