import React from 'react';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#319795]/30 transition-all duration-300 overflow-hidden">
      {/* Category Badge */}
      <div className="px-6 pt-6">
        <span className="inline-block px-3 py-1 bg-[#319795]/10 text-[#319795] text-xs font-bold uppercase tracking-wider rounded-full">
          {article.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-[#1A365D] mb-3 line-clamp-2 group-hover:text-[#319795] transition-colors">
          {article.title}
        </h3>

        {/* Authors */}
        <p className="text-sm text-[#2D3748] mb-3 line-clamp-1">
          {article.authors}
        </p>

        {/* Abstract Snippet */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">
          {article.abstract}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{article.views} views</span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          to={`/article/${article.slug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#319795] hover:text-[#287E7B] transition-colors group-hover:gap-3"
        >
          Read Article
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
