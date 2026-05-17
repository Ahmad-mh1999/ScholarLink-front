import React, { useState } from 'react';
import { Search, User, LogOut, Settings, Bookmark, FileText, BookOpen, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isReviewerPortal = location.pathname.startsWith('/reviewer');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const { user, logoutLoading } = useSelector((state) => state.auth);

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
    <nav className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-50">
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-xl">
          <BookOpen className="text-accent w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-serif font-bold text-primary tracking-tight leading-none">
            {isReviewerPortal ? 'Micro-Research' : 'ScholarLink'}
          </span>
          {isReviewerPortal && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Reviewer Portal
            </span>
          )}
        </div>
      </Link>

      {/* Global Search Bar */}
      <div className="flex-grow max-w-2xl mx-12">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, abstracts, or content..."
            className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 pl-14 pr-6 text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Action Icons & User Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell with Dropdown */}
        <NotificationBell />

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1.5 pl-4 hover:bg-[#F7FAFC] rounded-2xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary leading-none mb-1">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Academic Scholar'}
              </p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Researcher</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent overflow-hidden">
              <User className="w-6 h-6" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <Link to="/profile" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-primary transition-colors">
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link to="/my-articles" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-primary transition-colors">
                <FileText className="w-4 h-4" />
                My Articles
              </Link>
              <Link to="/bookmarks" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-primary transition-colors">
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-[#F7FAFC] hover:text-primary transition-colors border-b border-gray-50">
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
      </div>
    </nav>
  );
};

export default Navbar;
