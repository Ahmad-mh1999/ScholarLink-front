import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetCategoryDetailQuery, useGetArticlesQuery } from '../api/baseApi';
import { FileText, Eye, Heart, Bookmark, Clock, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  const { slug } = useParams();
  const { data: category, isLoading: isLoadingCategory } = useGetCategoryDetailQuery(slug);
  const { data: articles, isLoading: isLoadingArticles } = useGetArticlesQuery({ category__slug: slug });

  if (isLoadingCategory || isLoadingArticles) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryData = category || {};
  const articlesList = articles?.results || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#004d40] rounded-3xl p-12 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest opacity-80">Category</span>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-3">{categoryData.name || 'Category'}</h1>
        <p className="text-white/80 font-medium max-w-2xl">
          {categoryData.description || 'Explore research articles in this category.'}
        </p>
        <div className="flex items-center gap-6 mt-6 text-sm font-medium opacity-70">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {articlesList.length} Articles
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Updated recently
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
            Sort by
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 font-medium">
          Showing {articlesList.length} articles
        </p>
      </div>

      {/* Articles Grid */}
      {articlesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesList.map((article) => (
            <Link
              key={article.slug}
              to={`/article/${article.slug}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={article.cover_image || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {article.category_name || categoryData.name}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {article.abstract || 'No abstract available.'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Heart className="w-3.5 h-3.5" />
                      {article.likes_count || 0}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">
                    {article.created_at_formatted || 'Recently'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary mb-2">No Articles Found</h3>
          <p className="text-gray-400 font-medium">
            There are no articles in this category yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
