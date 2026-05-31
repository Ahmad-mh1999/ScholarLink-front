/**
 * MyPoints Page
 * Purpose: Displays user's current total points and detailed transaction history.
 * Route: /points/my
 * Features:
 *   - Total points summary with visual card
 *   - Complete transaction history with pagination
 *   - Points earning breakdown by category
 *   - Helper tooltips explaining how points are earned
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Star,
  User,
  FileText,
  MessageSquare,
  Bookmark,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  ArrowRight,
  Crown,
  Zap,
  Award,
  Info,
  HelpCircle,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {
  useGetMyPointsQuery,
  useGetPointsTransactionsQuery,
} from '../api/baseApi';
import { getPointsConfig, POINTS, formatPoints } from '../constants/points';

// ═══════════════════════════════════════════════════════════════════
// Sub-component: Points Summary Card
// Purpose: Displays total points with animated visual
// ═══════════════════════════════════════════════════════════════════
const PointsSummaryCard = ({ points, loading }) => {
  const { user } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="bg-primary p-10 rounded-[2.5rem] relative overflow-hidden animate-pulse">
        <div className="h-8 w-32 bg-white/10 rounded-lg mb-4"></div>
        <div className="h-16 w-24 bg-white/10 rounded-lg mb-6"></div>
        <div className="h-4 w-48 bg-white/10 rounded-lg"></div>
      </div>
    );
  }

  const totalPoints = points?.total || 0;
  const nextMilestone = Math.ceil((totalPoints + 1) / 100) * 100;
  const progressToNext = ((totalPoints % 100) / 100) * 100;

  return (
    <div className="bg-primary p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-primary/20">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Your Points</h3>
            <p className="text-sm text-blue-100/60">Keep contributing to earn more!</p>
          </div>
        </div>

        {/* Points Display */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-7xl font-serif font-bold text-white tracking-tighter">
            {totalPoints.toLocaleString()}
          </span>
          <span className="text-lg font-bold text-accent uppercase tracking-widest">points</span>
        </div>

        {/* Progress to Next Milestone */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-100/60">Progress to next milestone</span>
            <span className="text-white font-bold">{nextMilestone} pts</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <FileText className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Articles</p>
            <p className="text-lg font-bold text-white">+{POINTS.PUBLISH_ARTICLE}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <Bookmark className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Bookmarks</p>
            <p className="text-lg font-bold text-white">+{POINTS.RECEIVE_BOOKMARK}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <Heart className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Likes</p>
            <p className="text-lg font-bold text-white">+{POINTS.RECEIVE_LIKE}</p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <Crown className="absolute top-[-10px] right-[-10px] w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
      <Star className="absolute bottom-[-20px] left-[20%] w-24 h-24 text-accent opacity-10 group-hover:rotate-12 transition-transform duration-700" />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Sub-component: Transaction Item
// Purpose: Single transaction row with icon and details
// ═══════════════════════════════════════════════════════════════════
const TransactionItem = ({ transaction }) => {
  const config = getPointsConfig(transaction.reason);

  // Dynamic icon component
  const IconComponent = {
    FileText,
    MessageSquare,
    Bookmark,
    Heart,
    Zap,
  }[config.icon] || Zap;

  return (
    <div className="flex items-center gap-5 p-5 hover:bg-[#F7FAFC] rounded-2xl transition-all border-b border-gray-50 last:border-0">
      {/* Icon */}
      <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
        <IconComponent className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-primary tracking-tight">{config.label}</h4>
          {/* Tooltip on hover */}
          <div className="group/tooltip relative">
            <HelpCircle className="w-3.5 h-3.5 text-gray-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-lg">
              {config.description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
          {new Date(transaction.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <span className={`text-lg font-bold ${transaction.points > 0 ? 'text-green-500' : 'text-red-400'}`}>
          {transaction.points > 0 ? '+' : ''}{transaction.points}
        </span>
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">pts</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Sub-component: Points Earning Guide
// Purpose: Visual guide explaining how to earn points
// ═══════════════════════════════════════════════════════════════════
const PointsEarningGuide = () => {
  const earningMethods = [
    {
      icon: FileText,
      title: 'Publish Article',
      points: POINTS.PUBLISH_ARTICLE,
      description: 'Publishing an article gives you +10 points',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: '/submit',
      actionLabel: 'Submit Article',
    },
    {
      icon: Bookmark,
      title: 'Receive Bookmark',
      points: POINTS.RECEIVE_BOOKMARK,
      description: 'Each bookmark on your articles gives you +3 points',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      action: '/my-articles',
      actionLabel: 'View Articles',
    },
    {
      icon: Heart,
      title: 'Receive Like',
      points: POINTS.RECEIVE_LIKE,
      description: 'Each like on your articles gives you +2 points',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      action: '/my-articles',
      actionLabel: 'View Articles',
    },
    {
      icon: MessageSquare,
      title: 'Receive Comment',
      points: POINTS.RECEIVE_COMMENT,
      description: 'Each comment received gives you +1 point',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      action: '/my-articles',
      actionLabel: 'View Articles',
    },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-primary tracking-tight">How to Earn Points</h3>
          <p className="text-sm text-gray-400">Complete these actions to earn points</p>
        </div>
      </div>

      <div className="space-y-4">
        {earningMethods.map((method, index) => (
          <div
            key={method.title}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F7FAFC] transition-colors group"
          >
            {/* Icon */}
            <div className={`w-12 h-12 ${method.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
              <method.icon className={`w-5 h-5 ${method.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-primary tracking-tight">{method.title}</h4>
                {/* Tooltip */}
                <div className="group/tooltip relative">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-lg">
                    {method.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{method.description}</p>
            </div>

            {/* Points Badge */}
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${method.bgColor} ${method.color}`}>
                +{method.points} pts
              </span>
            </div>

            {/* Action Link */}
            <Link
              to={method.action}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                {method.actionLabel} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-8 pt-8 border-t border-gray-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary mb-1">Pro Tip</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Publishing high-quality articles is the fastest way to earn points. 
              Each published article gives you {POINTS.PUBLISH_ARTICLE} points, 
              plus additional points from engagement (likes, bookmarks, comments).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Sub-component: Empty Transactions State
// ═══════════════════════════════════════════════════════════════════
const EmptyTransactions = () => (
  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
    <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mx-auto mb-6">
      <Clock className="w-10 h-10" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-primary mb-3">No Activity Yet</h3>
    <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto leading-relaxed">
      Start contributing to the research community to earn points and see your activity here.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        to="/submit"
        className="inline-flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
      >
        <FileText className="w-4 h-4" />
        Submit Article
      </Link>
      <Link
        to="/leaderboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-sm transition-colors"
      >
        <Trophy className="w-4 h-4" />
        View Leaderboard
      </Link>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Main MyPoints Page Component
// ═══════════════════════════════════════════════════════════════════
const MyPoints = () => {
  const [txPage, setTxPage] = useState(1);

  // ─── API Hooks ───
  const { data: myPoints, isLoading: pointsLoading, error: pointsError } = useGetMyPointsQuery();
  const { data: transactions, isLoading: txLoading } = useGetPointsTransactionsQuery({ page: txPage });

  // ─── Derived Data ───
  const txResults = transactions?.results || [];
  const txCount = transactions?.count || 0;
  const txTotalPages = Math.ceil(txCount / 10);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ 1. Page Header ═══ */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">My Points</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium ml-[52px]">
          Track your contributions and earn rewards
        </p>
      </div>

      {/* ═══ 2. Points Summary Card ═══ */}
      <PointsSummaryCard points={myPoints} loading={pointsLoading} />

      {/* ═══ 3. Main Content Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ═══ Left Column (7/12): Transaction History ═══ */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">History</p>
              <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Points Activity</h2>
            </div>
            <Link
              to="/leaderboard"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2 group"
            >
              View Leaderboard <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {txLoading ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5 p-5 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-50 rounded-lg w-1/2"></div>
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : txResults.length > 0 ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-4 md:p-6">
              {txResults.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}

              {/* Transaction Pagination */}
              {txTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 mt-4 border-t border-gray-50">
                  <button
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    Page {txPage} of {txTotalPages}
                  </span>
                  <button
                    onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                    disabled={txPage === txTotalPages}
                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyTransactions />
          )}
        </div>

        {/* ═══ Right Column (5/12): Earning Guide ═══ */}
        <div className="lg:col-span-5 space-y-8">
          <PointsEarningGuide />

          {/* Quick Stats Card */}
          <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10">
            <h3 className="text-lg font-bold text-primary tracking-tight mb-6">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Current Rank</span>
                <span className="text-sm font-bold text-primary">#{myPoints?.rank || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Articles Published</span>
                <span className="text-sm font-bold text-primary">{myPoints?.articles_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reviews Submitted</span>
                <span className="text-sm font-bold text-primary">{myPoints?.reviews_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Engagement</span>
                <span className="text-sm font-bold text-primary">{myPoints?.engagement_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPoints;
