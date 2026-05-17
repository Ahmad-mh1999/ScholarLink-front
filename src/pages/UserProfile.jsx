import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Users,
  Award,
  Mail,
  GraduationCap,
  Calendar,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  ChevronRight,
  Bookmark,
  Edit3,
  MapPin,
  Globe,
  Link as LinkIcon,
  BadgeCheck,
  Building2,
  BookOpen
} from 'lucide-react';
import {
  useGetUserProfileQuery,
  useGetMyArticlesQuery,
  useGetBookmarksQuery,
  useGetDraftsQuery,
  useFollowUserMutation,
  useGetArticlesQuery
} from '../api/baseApi';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('published');

  // Fetch user profile data
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfileQuery(username);

  // Fetch articles based on active tab
  // For viewing own profile, use useGetMyArticlesQuery
  // For viewing other user's profile, use useGetArticlesQuery with author parameter
  const isOwnProfile = profile?.username === username;
  
  const { data: publishedArticles, isLoading: isPublishedLoading } = isOwnProfile
    ? useGetMyArticlesQuery({ status: 'published' })
    : useGetArticlesQuery({ author: username, status: 'published' });
  
  const { data: bookmarks, isLoading: isBookmarksLoading } = useGetBookmarksQuery(undefined, { skip: activeTab !== 'bookmarks' });
  const { data: drafts, isLoading: isDraftsLoading } = useGetDraftsQuery(undefined, { skip: activeTab !== 'drafts' });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const userData = profile || {};

  const fullName = userData.first_name && userData.last_name
    ? `${userData.first_name} ${userData.last_name}`
    : userData.username || 'Academic Scholar';

  const getArticlesForTab = () => {
    switch (activeTab) {
      case 'published': return publishedArticles || [];
      case 'bookmarks': return bookmarks || [];
      case 'drafts': return drafts || [];
      default: return [];
    }
  };

  const isLoadingArticles = isPublishedLoading || isBookmarksLoading || isDraftsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="h-64 w-full rounded-3xl bg-gradient-to-r from-primary via-[#004d40] to-accent shadow-lg"></div>

        {/* Profile Card */}
        <div className="absolute top-36 left-0 right-0 px-8">
          <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col md:flex-row items-start gap-10 border border-gray-100">
            {/* Avatar with Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-serif">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {userData.academic_status && (
                <div className="absolute -bottom-3 -right-3 bg-accent p-3 rounded-2xl border-4 border-white shadow-lg">
                  <BadgeCheck className="w-6 h-6 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-2">{fullName}</h1>
                  <p className="text-accent font-semibold text-xl mb-1">@{userData.username}</p>
                  {userData.title && (
                    <p className="text-gray-600 font-medium">{userData.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => followUser(userData.username)}
                    disabled={isFollowing}
                    className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg ${
                      userData.is_following
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-accent text-white hover:opacity-90 shadow-teal-500/20'
                    } disabled:opacity-50`}
                  >
                    {isFollowing ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : userData.is_following ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    {isFollowing ? 'Loading...' : userData.is_following ? 'Following' : 'Follow'}
                  </button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Academic Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                {userData.institution && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F7FAFC] rounded-xl">
                    <Building2 className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-gray-600">{userData.institution}</span>
                  </div>
                )}
                {userData.field_of_study && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F7FAFC] rounded-xl">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-gray-600">{userData.field_of_study}</span>
                  </div>
                )}
                {userData.academic_status && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-xl">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-accent capitalize">{userData.academic_status}</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              {userData.email && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{userData.email}</span>
                  </div>
                  {userData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{userData.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacing for Hero Overlap */}
      <div className="h-32"></div>

      {/* About Section */}
      {userData.bio && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <h2 className="text-xl font-bold text-primary mb-4">About</h2>
          <p className="text-gray-600 font-medium leading-relaxed">{userData.bio}</p>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Publications</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-primary">{userData.posts_count || 0}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Network</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-accent">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-primary">{userData.network_count || 0}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Followers</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-accent">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-primary">{userData.followers?.length || 0}</span>
          </div>
        </div>

        <div className="bg-accent p-6 rounded-2xl shadow-lg border border-transparent hover:shadow-xl transition-shadow text-white">
          <p className="text-[10px] font-bold text-teal-100/60 uppercase tracking-widest mb-3">Academic Status</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <BadgeCheck className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-bold capitalize">{userData.academic_status || 'Researcher'}</span>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
        <h2 className="text-xl font-bold text-primary mb-6">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userData.orcid_id && (
            <div className="flex items-center gap-3 p-4 bg-[#F7FAFC] rounded-2xl">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ORCID</p>
                <p className="text-sm font-bold text-primary">{userData.orcid_id}</p>
              </div>
            </div>
          )}
          {userData.website && (
            <div className="flex items-center gap-3 p-4 bg-[#F7FAFC] rounded-2xl">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Website</p>
                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:text-accent transition-colors">
                  {userData.website}
                </a>
              </div>
            </div>
          )}
          {userData.date_joined && (
            <div className="flex items-center gap-3 p-4 bg-[#F7FAFC] rounded-2xl">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-primary">{new Date(userData.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expertise Section */}
      {userData.expertise && userData.expertise.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <h2 className="text-xl font-bold text-primary mb-6">Areas of Expertise</h2>
          <div className="flex flex-wrap gap-3">
            {userData.expertise.map((exp) => (
              <div key={exp.id} className="px-5 py-3 bg-accent/10 text-accent text-sm font-bold rounded-2xl">
                {exp.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs and Content Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
        {/* Tabs Header */}
        <div className="px-8 border-b border-gray-100">
          <div className="flex gap-12">
            <button 
              onClick={() => setActiveTab('published')}
              className={`py-6 text-sm font-bold transition-all relative ${
                activeTab === 'published' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Published Articles
              {activeTab === 'published' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>}
            </button>
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => setActiveTab('bookmarks')}
                  className={`py-6 text-sm font-bold transition-all relative ${
                    activeTab === 'bookmarks' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Bookmarks
                  {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('drafts')}
                  className={`py-6 text-sm font-bold transition-all relative ${
                    activeTab === 'drafts' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Drafts
                  {activeTab === 'drafts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Articles List */}
        <div className="p-8 space-y-6">
          {isLoadingArticles ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : getArticlesForTab().length > 0 ? (
            getArticlesForTab().map((article, index) => (
              <div 
                key={article.id || index} 
                className="p-6 bg-background rounded-2xl border border-gray-50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {article.category?.name || "Neural Networks"}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Published {article.published_at || "Oct 12, 2023"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                      {article.title || "Next-Generation Latency Optimization in Distributed Deep Learning"}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                      {article.abstract || "This research explores a novel architectural approach to reducing communication overhead in large-scale model training across disparate data centers..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-bold">{article.likes_count || "1.2k"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">{article.comments_count || "48"}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium italic">No articles found in this section.</p>
            </div>
          )}

          {/* Show More Button */}
          {getArticlesForTab().length > 0 && (
            <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2">
              Show More Articles
            </button>
          )}
        </div>
      </div>

      {/* Footer Branding (Optional but looks nice) */}
      <div className="text-center pb-8">
        <p className="text-xs text-gray-400 font-medium">
          © 2024 Academic Hub Platform. All research content is peer-verified.
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
