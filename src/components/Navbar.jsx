import React, { useState } from 'react';
import { Search, User, LogOut, Settings, Bookmark, FileText, BookOpen, Loader2, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isReviewerPortal = location.pathname.startsWith('/reviewer');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const { user, logoutLoading, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="h-20 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-[#1A365D] p-2 rounded-xl">
          <BookOpen className="text-[#319795] w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-serif font-bold text-[#1A365D] tracking-tight leading-none">
            Researcher
          </span>
          {isReviewerPortal && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Reviewer Portal
            </span>
          )}
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-[#2D3748] hover:text-[#319795] transition-colors">
          Home
        </Link>
        <Link to="/explore" className="text-sm font-medium text-[#2D3748] hover:text-[#319795] transition-colors">
          Articles
        </Link>
        <Link to="/leaderboard" className="text-sm font-medium text-[#2D3748] hover:text-[#319795] transition-colors">
          Leaderboard
        </Link>
        <Link to="/about" className="text-sm font-medium text-[#2D3748] hover:text-[#319795] transition-colors">
          About
        </Link>
      </div>

      {/* Global Search Bar - Desktop */}
      <div className="hidden md:flex flex-grow max-w-xl mx-8">
        <form onSubmit={handleSearch} className="relative group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#319795] transition-colors w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 pl-14 pr-6 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#319795]/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Submit Research Button */}
            <Link
              to="/submit"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-[#319795] text-white rounded-2xl font-bold hover:bg-[#287E7B] transition-all shadow-lg shadow-teal-500/30"
            >
              <FileText className="w-4 h-4" />
              Submit Research
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 pl-4 hover:bg-[#F7FAFC] rounded-2xl transition-all border border-transparent hover:border-gray-100"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#1A365D] leading-none mb-1">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Academic Scholar'}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Researcher</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#319795]/10 border-2 border-[#319795]/20 flex items-center justify-center text-[#319795] overflow-hidden">
                  <User className="w-6 h-6" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link to="/profile" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-[#1A365D] transition-colors">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link to="/my-articles" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-[#1A365D] transition-colors">
                    <FileText className="w-4 h-4" />
                    My Articles
                  </Link>
                  <Link to="/bookmarks" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-[#1A365D] transition-colors">
                    <Bookmark className="w-4 h-4" />
                    Bookmarks
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-[#1A365D] transition-colors border-b border-gray-50">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {logoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {logoutLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Public Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-[#1A365D] hover:text-[#319795] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-[#319795] text-white rounded-2xl font-bold hover:bg-[#287E7B] transition-all shadow-lg shadow-teal-500/30"
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-[#F7FAFC] rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#1A365D]" /> : <Menu className="w-6 h-6 text-[#1A365D]" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && !isAuthenticated && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-lg lg:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" className="block py-2 text-sm font-medium text-[#2D3748] hover:text-[#319795]">
              Home
            </Link>
            <Link to="/explore" className="block py-2 text-sm font-medium text-[#2D3748] hover:text-[#319795]">
              Articles
            </Link>
            <Link to="/leaderboard" className="block py-2 text-sm font-medium text-[#2D3748] hover:text-[#319795]">
              Leaderboard
            </Link>
            <Link to="/about" className="block py-2 text-sm font-medium text-[#2D3748] hover:text-[#319795]">
              About
            </Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full py-3 text-center text-sm font-bold text-[#1A365D] border border-gray-200 rounded-2xl hover:border-[#319795] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full py-3 text-center text-sm font-bold text-white bg-[#319795] rounded-2xl hover:bg-[#287E7B] transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
