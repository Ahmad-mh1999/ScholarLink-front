import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  Search,
  Trash2,
  ArrowRight,
  BookOpen,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import {
  useGetBookmarksQuery,
  useBookmarkArticleMutation,
} from '../api/baseApi';

// ─── Sub-component: Bookmark Article Card ───
const BookmarkCard = ({ bookmark, onRemove, onArticleClick }) => {
  const article = bookmark.article;
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(article.slug);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row gap-6 p-6 md:p-8 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
      {/* Image */}
      <div
        onClick={() => onArticleClick(article)}
        className="w-full md:w-64 h-48 md:h-auto shrink-0 rounded-2xl overflow-hidden relative cursor-pointer"
      >
        <img
          src={article.cover_image || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-accent/90 backdrop-blur-md text-white text-[9px] font-bold rounded-full uppercase tracking-widest">
            {article.category?.name || 'Research'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-3">
          {/* Title + Remove Button */}
          <div className="flex justify-between items-start gap-4">
            <h3
              onClick={() => onArticleClick(article)}
              className="text-xl font-bold text-primary leading-snug tracking-tight group-hover:text-accent transition-colors line-clamp-2 cursor-pointer"
            >
              {article.title}
            </h3>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-2 text-accent hover:bg-accent/5 rounded-xl transition-all shrink-0 disabled:opacity-50"
              title="Remove bookmark"
            >
              {removing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <BookmarkCheck className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Abstract */}
          {article.abstract && (
            <p className="text-sm text-gray-500 font-medium leading-relaxed tracking-tight line-clamp-2 italic opacity-80">
              {article.abstract}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden border-2 border-white shadow-sm">
              {article.author?.avatar ? (
                <img src={article.author.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-none">
                {article.author?.first_name} {article.author?.last_name}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {article.author?.institution || 'Researcher'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{article.views_count?.toLocaleString() || 0}</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Heart className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{article.likes_count || 0}</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{article.comments_count || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Saved {new Date(bookmark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component: Compact List Item ───
const BookmarkListItem = ({ bookmark, onRemove, onArticleClick }) => {
  const article = bookmark.article;
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(article.slug);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-5 p-4 hover:bg-[#F7FAFC] rounded-2xl transition-all group border-b border-gray-50 last:border-0">
      {/* Thumbnail */}
      <div
        onClick={() => onArticleClick(article)}
        className="w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer"
      >
        <img
          src={article.cover_image || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div
        onClick={() => onArticleClick(article)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <h4 className="font-bold text-primary tracking-tight mb-1 group-hover:text-accent transition-colors line-clamp-1">
          {article.title}
        </h4>
        <p className="text-xs text-gray-400 font-medium">
          {article.author?.first_name} {article.author?.last_name} • {article.category?.name || 'Research'} • {article.views_count?.toLocaleString() || 0} views
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="p-2 text-accent/60 hover:text-accent hover:bg-accent/5 rounded-lg transition-all shrink-0 disabled:opacity-50"
        title="Remove bookmark"
      >
        {removing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

// ─── Sub-component: Empty State ───
const EmptyBookmarks = () => (
  <div className="bg-white p-16 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
    <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mx-auto mb-6">
      <Bookmark className="w-10 h-10" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-primary mb-3">No Bookmarks Yet</h3>
    <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto leading-relaxed">
      Save articles you find interesting to revisit them later. Bookmark any article by clicking the bookmark icon.
    </p>
    <Link
      to="/explore"
      className="inline-flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
    >
      <BookOpen className="w-4 h-4" />
      Explore Research
    </Link>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Main Bookmarks Page Component
// ═══════════════════════════════════════════════════════════════════
const Bookmarks = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // ─── API Hooks ───
  const { data, isLoading, isError } = useGetBookmarksQuery({ page });
  const [removeBookmark, { isLoading: isRemoving }] = useBookmarkArticleMutation();

  // ─── Derived Data ───
  const bookmarks = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  // Filter bookmarks by search query (client-side)
  const filteredBookmarks = searchQuery
    ? bookmarks.filter(b =>
        b.article?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.article?.author?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.article?.author?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.article?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarks;

  // ─── Handlers ───
  const handleRemoveBookmark = async (slug) => {
    await removeBookmark(slug).unwrap();
  };

  const handleArticleClick = (article) => {
    navigate(`/article/${article.slug}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ 1. Page Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">My Bookmarks</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium ml-[52px]">
            {isLoading ? 'Loading...' : `${totalCount} saved article${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-primary placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 focus:border-accent/20 outline-none transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="bg-white border border-gray-100 rounded-2xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                viewMode === 'card'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                viewMode === 'list'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 2. Content Area ═══ */}
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-6">
          {viewMode === 'card' ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2rem] border border-gray-50 animate-pulse flex flex-col md:flex-row gap-6 p-8">
                <div className="w-full md:w-64 h-48 bg-gray-100 rounded-2xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-50 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-50 rounded-lg w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-50 p-6 space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-5 p-4 animate-pulse">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-50 rounded-lg w-2/3"></div>
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isError ? (
        // Error State
        <div className="bg-white p-16 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-primary mb-2">Failed to Load Bookmarks</h3>
          <p className="text-sm text-gray-400 font-medium mb-6">Something went wrong. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-[#152c4d]"
          >
            Refresh Page
          </button>
        </div>
      ) : filteredBookmarks.length === 0 && !searchQuery ? (
        // Empty State (no bookmarks at all)
        <EmptyBookmarks />
      ) : filteredBookmarks.length === 0 && searchQuery ? (
        // No Search Results
        <div className="bg-white p-12 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">No Results Found</h3>
          <p className="text-sm text-gray-400 font-medium">
            No bookmarks match "{searchQuery}". Try a different search term.
          </p>
        </div>
      ) : (
        // ─── Bookmarks List ───
        <>
          {viewMode === 'card' ? (
            <div className="space-y-6">
              {filteredBookmarks.map(bookmark => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onRemove={handleRemoveBookmark}
                  onArticleClick={handleArticleClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-4 md:p-6">
              {filteredBookmarks.map(bookmark => (
                <BookmarkListItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  onRemove={handleRemoveBookmark}
                  onArticleClick={handleArticleClick}
                />
              ))}
            </div>
          )}

          {/* ═══ 3. Pagination ═══ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-primary hover:shadow-lg hover:shadow-slate-200/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        page === pageNum
                          ? 'bg-accent text-white shadow-lg shadow-teal-500/20'
                          : 'bg-white border border-gray-100 text-gray-400 hover:text-primary hover:shadow-md'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-primary hover:shadow-lg hover:shadow-slate-200/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══ 4. Quick Link to Explore ═══ */}
      {bookmarks.length > 0 && (
        <div className="flex items-center justify-center pt-4">
          <Link
            to="/explore"
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-accent transition-colors group"
          >
            <BookOpen className="w-4 h-4" />
            Discover more research
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
