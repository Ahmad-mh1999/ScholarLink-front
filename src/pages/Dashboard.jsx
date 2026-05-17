import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Eye, 
  Star, 
  TrendingUp, 
  Edit3, 
  Plus, 
  Bookmark, 
  Users, 
  ArrowRight,
  Clock,
  MessageSquare,
  Trophy,
  BookOpen,
  AlertCircle,
  Send,
  BarChart3,
  User,
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { 
  useGetStatsQuery, 
  useGetTrendingArticlesQuery, 
  useGetMostReadQuery,
  useGetMyArticlesQuery,
  useGetMyPointsQuery,
  useGetUnreadNotificationsCountQuery,
  useGetNotificationsQuery,
} from '../api/baseApi';

// ─── Sub-component: Stat Card ───
const StatCard = ({ icon: Icon, value, label, trend, loading, accent }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    <div className={`w-12 h-12 ${accent ? 'bg-accent/10' : 'bg-accent/5'} rounded-xl flex items-center justify-center ${accent ? 'text-accent' : 'text-accent'} mb-4 group-hover:bg-accent group-hover:text-white transition-all`}>
      <Icon className="w-6 h-6" />
    </div>
    {loading ? (
      <div className="h-8 w-20 bg-gray-100 animate-pulse rounded mb-2"></div>
    ) : (
      <h3 className="text-4xl font-bold text-primary mb-1 tracking-tight">{value}</h3>
    )}
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</p>
    {trend && (
      <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-500">
        <TrendingUp className="w-3 h-3" />
        {trend}
      </div>
    )}
  </div>
);

// ─── Sub-component: Trending Article Card ───
const TrendingCard = ({ article, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full cursor-pointer"
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={article.cover_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'} 
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4">
        <span className="px-4 py-1.5 bg-accent/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
          {article.category?.name || 'Research'}
        </span>
      </div>
    </div>
    <div className="p-8 flex flex-col flex-1">
      <h3 className="text-xl font-bold text-primary mb-3 leading-snug tracking-tight group-hover:text-accent transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 font-medium mb-4">
        {article.author?.first_name} {article.author?.last_name} • {article.views_count?.toLocaleString() || 0} views
      </p>
      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">
          {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <MessageSquare className="w-3 h-3" /> {article.comments_count || 0}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <Star className="w-3 h-3" /> {article.likes_count || 0}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Sub-component: Draft Item ───
const DraftItem = ({ draft, onEdit }) => (
  <div 
    onClick={() => onEdit(draft)}
    className="group cursor-pointer p-4 -mx-2 rounded-2xl hover:bg-[#F7FAFC] transition-all"
  >
    <div className="flex items-center justify-between mb-1">
      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-accent transition-colors">
        {draft.updated_at ? new Date(draft.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
      </p>
      <Edit3 className="w-3 h-3 text-gray-200 group-hover:text-accent transition-colors" />
    </div>
    <h4 className="text-sm font-bold text-primary leading-tight line-clamp-2 tracking-tight group-hover:text-accent transition-colors">
      {draft.title || 'Untitled Draft'}
    </h4>
    <div className="mt-3 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
      <div className="h-full bg-accent/40 group-hover:bg-accent transition-all duration-500" style={{ width: `${draft.abstract ? 75 : draft.description ? 50 : 25}%` }}></div>
    </div>
  </div>
);

// ─── Sub-component: Recommended Article Item ───
const RecommendationItem = ({ article, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-3xl border border-gray-50 flex items-center gap-6 group hover:shadow-lg hover:shadow-slate-200/40 transition-all cursor-pointer"
  >
    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
      <FileText className="w-6 h-6" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-primary tracking-tight mb-1 group-hover:text-accent transition-colors line-clamp-1">
        {article.title}
      </h4>
      <p className="text-xs text-gray-400 font-medium">
        {article.author?.first_name} {article.author?.last_name} • {article.views_count?.toLocaleString() || 0} views
      </p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-bold rounded-lg border border-accent/10">
        {article.category?.name || 'Research'}
      </span>
      <Eye className="w-4 h-4 text-gray-200 group-hover:text-accent transition-colors" />
    </div>
  </div>
);

// ─── Sub-component: Quick Action Card ───
const QuickAction = ({ icon: Icon, label, description, to, color }) => (
  <Link 
    to={to}
    className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex items-center gap-5"
  >
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-primary text-sm tracking-tight group-hover:text-accent transition-colors">{label}</h4>
      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
  </Link>
);

// ─── Sub-component: Empty State ───
const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => (
  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
    <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
    <p className="text-sm text-gray-400 font-medium mb-6 max-w-sm mx-auto">{description}</p>
    {actionLabel && actionTo && (
      <Link 
        to={actionTo}
        className="inline-flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </Link>
    )}
  </div>
);

// ─── Sub-component: Loading Skeleton ───
const SectionSkeleton = ({ count = 2, height = 'h-80' }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-white rounded-[2rem] animate-pulse`}></div>
    ))}
  </div>
);

// ─── Sub-component: Activity Feed Item ───
const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'manuscript': return <FileText className="w-4 h-4 text-accent" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'verification': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'milestone': return <Trophy className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 -mx-2 rounded-2xl hover:bg-[#F7FAFC] transition-all group cursor-pointer">
      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-primary leading-tight mb-1 line-clamp-2 group-hover:text-accent transition-colors">
          {activity.title}
        </p>
        <p className="text-xs text-gray-400 font-medium line-clamp-1 mb-1">
          {activity.description}
        </p>
        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">
          {activity.created_at_formatted || 'Recently'}
        </p>
      </div>
      {!activity.is_read && (
        <div className="w-2 h-2 bg-accent rounded-full shrink-0 mt-2" />
      )}
    </div>
  );
};

// ─── Sub-component: Recent Activity Feed ───
const RecentActivityFeed = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary tracking-tight">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary tracking-tight">Recent Activity</h3>
          <Link to="/notifications" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
            View All
          </Link>
        </div>
        <div className="text-center py-8">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">No recent activity</p>
          <p className="text-xs text-gray-300 mt-1">Your notifications will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-primary tracking-tight">Recent Activity</h3>
        <Link to="/notifications" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-1">
        {activities.slice(0, 5).map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ═══════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ─── API Hooks ───
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetStatsQuery();
  const { data: trending, isLoading: trendingLoading } = useGetTrendingArticlesQuery();
  const { data: mostRead, isLoading: mostReadLoading } = useGetMostReadQuery({ period: 'week' });
  const { data: myArticles, isLoading: myArticlesLoading } = useGetMyArticlesQuery({ page_size: 10 });
  const { data: myPoints, isLoading: pointsLoading } = useGetMyPointsQuery();
  const { data: unreadData } = useGetUnreadNotificationsCountQuery();
  const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery({ page_size: 5 });

  // ─── Derived Data ───
  const drafts = myArticles?.results?.filter(a => a.status === 'draft') || [];
  const underReview = myArticles?.results?.filter(a => a.status === 'under_review') || [];
  const published = myArticles?.results?.filter(a => a.status === 'published') || [];
  const unreadCount = unreadData?.unread_count || 0;

  // Format large numbers
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Handle draft edit → navigate to submit page with edit mode
  const handleEditDraft = (draft) => {
    navigate(`/submit?edit=${draft.slug}`);
  };

  // Handle article click → navigate to article detail
  const handleArticleClick = (article) => {
    navigate(`/article/${article.slug}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ 1. Welcome Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-serif font-bold text-primary tracking-tight">
            Welcome back, {user?.first_name || 'Scholar'}!
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Academic Profile:</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">
              {user?.academic_status?.replace('_', ' ') || 'Researcher'}
            </span>
            {user?.institution && (
              <>
                <span className="text-[10px] text-gray-200">•</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                  {user.institution}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/submit" 
            className="flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            New Submission
          </Link>
          {unreadCount > 0 && (
            <Link 
              to="/notifications"
              className="flex items-center gap-2 bg-primary hover:bg-[#152c4d] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount} New
            </Link>
          )}
        </div>
      </div>

      {/* ═══ 2. Stats Row ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          value={published.length || stats?.total_articles || 0} 
          label="Published Articles" 
          loading={statsLoading && myArticlesLoading}
          trend={stats?.total_articles ? `${stats.total_articles} platform-wide` : null}
        />
        <StatCard 
          icon={Eye} 
          value={formatNumber(published.reduce((sum, a) => sum + (a.views_count || 0), 0))} 
          label="Total Views" 
          loading={myArticlesLoading}
        />
        <StatCard 
          icon={Star} 
          value={myPoints?.total || 0} 
          label="Academic Points" 
          loading={pointsLoading}
          accent
        />
        <StatCard 
          icon={Users} 
          value={user?.network_count || 0} 
          label="Network" 
          loading={false}
        />
      </div>

      {/* ═══ 3. Quick Actions ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction 
          icon={Edit3}
          label="Submit Manuscript"
          description="Publish new research"
          to="/submit"
          color="bg-accent"
        />
        <QuickAction 
          icon={BookOpen}
          label="Explore Research"
          description="Browse latest articles"
          to="/explore"
          color="bg-primary"
        />
        <QuickAction 
          icon={Send}
          label="Peer Review"
          description="Review incoming requests"
          to="/peer-review"
          color="bg-[#6B46C1]"
        />
        <QuickAction 
          icon={Trophy}
          label="Leaderboard"
          description="Points & rankings"
          to="/leaderboard"
          color="bg-[#D69E2E]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ═══ Left Column (8/12) ═══ */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* ═══ 4. Trending Articles Section ═══ */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Current Discourse</p>
                <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">Trending Articles</h2>
              </div>
              <Link 
                to="/explore"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2 group"
              >
                View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {trendingLoading ? (
              <SectionSkeleton count={2} height="h-80" />
            ) : trending?.results?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {trending.results.slice(0, 4).map(article => (
                  <TrendingCard 
                    key={article.id} 
                    article={article} 
                    onClick={() => handleArticleClick(article)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={TrendingUp}
                title="No Trending Articles Yet"
                description="Be the first to publish research and start trending in the community."
                actionLabel="Submit Research"
                actionTo="/submit"
              />
            )}
          </section>

          {/* ═══ 5. Most Read / Recommended Section ═══ */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Curated Feed</p>
                <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">Most Read This Week</h2>
              </div>
              <Link 
                to="/explore"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2 group"
              >
                Explore More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {mostReadLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse"></div>)}
              </div>
            ) : mostRead?.length > 0 ? (
              <div className="space-y-4">
                {mostRead.slice(0, 5).map(article => (
                  <RecommendationItem 
                    key={article.id} 
                    article={article} 
                    onClick={() => handleArticleClick(article)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={BookOpen}
                title="No Articles Found"
                description="Start exploring the research feed to discover new publications."
                actionLabel="Browse Feed"
                actionTo="/explore"
              />
            )}
          </section>

          {/* ═══ 6. My Articles Overview ═══ */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Your Research</p>
                <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">My Articles</h2>
              </div>
              <Link 
                to="/my-articles"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2 group"
              >
                Manage All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {myArticlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse"></div>)}
              </div>
            ) : myArticles?.results?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Drafts Card */}
                <div className="bg-white p-8 rounded-2xl border border-gray-50 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-bold text-primary">{drafts.length}</span>
                  </div>
                  <h4 className="font-bold text-primary text-sm mb-1">Drafts</h4>
                  <p className="text-[10px] text-gray-400 font-medium">In progress</p>
                  {drafts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-bold text-primary line-clamp-1">{drafts[0].title || 'Untitled'}</p>
                      <p className="text-[10px] text-gray-300 mt-1">Last edited recently</p>
                    </div>
                  )}
                </div>

                {/* Under Review Card */}
                <div className="bg-white p-8 rounded-2xl border border-gray-50 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-bold text-primary">{underReview.length}</span>
                  </div>
                  <h4 className="font-bold text-primary text-sm mb-1">Under Review</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Awaiting decision</p>
                  {underReview.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-bold text-primary line-clamp-1">{underReview[0].title}</p>
                      <p className="text-[10px] text-gray-300 mt-1">Submitted for review</p>
                    </div>
                  )}
                </div>

                {/* Published Card */}
                <div className="bg-white p-8 rounded-2xl border border-gray-50 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-bold text-primary">{published.length}</span>
                  </div>
                  <h4 className="font-bold text-primary text-sm mb-1">Published</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Live & accessible</p>
                  {published.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-bold text-primary line-clamp-1">{published[0].title}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{published[0].views_count || 0} views</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState 
                icon={FileText}
                title="No Articles Yet"
                description="Start your research journey by submitting your first manuscript."
                actionLabel="Submit Research"
                actionTo="/submit"
              />
            )}
          </section>
        </div>

        {/* ═══ Right Column (4/12) Sidebar ═══ */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* ═══ 7. Recent Activity Feed ═══ */}
          <RecentActivityFeed 
            activities={notificationsData?.results || []} 
            loading={notificationsLoading} 
          />

          {/* ═══ 8. Recent Drafts ═══ */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-primary tracking-tight">Recent Drafts</h3>
              <Link to="/my-articles" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                View All
              </Link>
            </div>
            
            {drafts.length > 0 ? (
              <div className="space-y-2">
                {drafts.slice(0, 4).map(draft => (
                  <DraftItem 
                    key={draft.id} 
                    draft={draft} 
                    onEdit={handleEditDraft} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Edit3 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No drafts yet</p>
                <p className="text-[10px] text-gray-300 mt-1">Start writing your next manuscript</p>
              </div>
            )}
            
            <Link 
              to="/submit"
              className="w-full bg-primary hover:bg-[#152c4d] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-6"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">New Manuscript</span>
            </Link>
          </div>

          {/* ═══ 8. Points & Activity Widget ═══ */}
          <div className="bg-accent/5 p-10 rounded-[2.5rem] border border-accent/10 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary tracking-tight">Academic Points</h3>
                <Link to="/leaderboard" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                  Leaderboard
                </Link>
              </div>
              
              {pointsLoading ? (
                <div className="h-10 w-24 bg-accent/10 animate-pulse rounded-lg mb-4"></div>
              ) : (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-serif font-bold text-accent tracking-tighter">
                    {myPoints?.total || 0}
                  </span>
                  <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">pts</span>
                </div>
              )}
              
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 opacity-80">
                Earn points by publishing, reviewing, and engaging with the research community.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-400 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-accent" /> Publish Article
                  </span>
                  <span className="font-bold text-accent">+10 pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-400 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-accent" /> Submit Review
                  </span>
                  <span className="font-bold text-accent">+5 pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-400 flex items-center gap-2">
                    <Bookmark className="w-3 h-3 text-accent" /> Receive Bookmark
                  </span>
                  <span className="font-bold text-accent">+3 pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-400 flex items-center gap-2">
                    <Star className="w-3 h-3 text-accent" /> Receive Like
                  </span>
                  <span className="font-bold text-accent">+2 pts</span>
                </div>
              </div>
            </div>
            <Trophy className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-accent opacity-5 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* ═══ 9. Network Growth Widget ═══ */}
          <div className="bg-primary p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white tracking-tight mb-4">Network Growth</h3>
              <p className="text-sm text-blue-100/70 font-medium leading-relaxed mb-8">
                You have <span className="text-white font-bold">{user?.network_count || 0} connections</span> in your academic network. 
                Keep publishing and reviewing to expand your reach.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  ))}
                </div>
                <Link 
                  to="/explore"
                  className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                >
                  Discover Researchers
                </Link>
              </div>
            </div>
            <BarChart3 className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* ═══ 10. Platform Stats Widget ═══ */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <h3 className="text-lg font-bold text-primary tracking-tight mb-6">Platform Overview</h3>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-50 animate-pulse rounded-lg"></div>)}
              </div>
            ) : statsError ? (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                Unable to load platform stats
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Total Articles
                  </span>
                  <span className="text-sm font-bold text-primary">{stats?.total_articles?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" /> Active Authors
                  </span>
                  <span className="text-sm font-bold text-primary">{stats?.total_authors?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> Categories
                  </span>
                  <span className="text-sm font-bold text-primary">{stats?.total_categories || 0}</span>
                </div>
                {stats?.most_viewed && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Most Viewed</p>
                    <p className="text-xs font-bold text-primary line-clamp-2">{stats.most_viewed}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ 11. Resources Links ═══ */}
          <div className="space-y-6 px-4">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Resources</p>
            <div className="space-y-4">
              <Link to="/bookmarks" className="flex items-center gap-4 text-sm font-bold text-gray-500 hover:text-primary transition-colors group w-full text-left">
                <Bookmark className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
                My Bookmarks
              </Link>
              <Link to="/settings" className="flex items-center gap-4 text-sm font-bold text-gray-500 hover:text-primary transition-colors group w-full text-left">
                <Edit3 className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
                Account Settings
              </Link>
              <Link to="/profile" className="flex items-center gap-4 text-sm font-bold text-gray-500 hover:text-primary transition-colors group w-full text-left">
                <User className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
                My Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
