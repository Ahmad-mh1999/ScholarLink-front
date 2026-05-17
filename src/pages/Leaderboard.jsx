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
} from 'lucide-react';
import {
  useGetLeaderboardQuery,
  useGetMyPointsQuery,
  useGetPointsTransactionsQuery,
} from '../api/baseApi';

// ─── Reason display config ───
const REASON_CONFIG = {
  publish_article: { label: 'Published Article', icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
  receive_like: { label: 'Received Like', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  submit_review: { label: 'Submitted Review', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
  receive_comment: { label: 'Received Comment', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  receive_bookmark: { label: 'Received Bookmark', icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-50' },
};
const DEFAULT_REASON = { label: 'Activity', icon: Zap, color: 'text-gray-400', bg: 'bg-gray-50' };

const getReasonConfig = (reason) => REASON_CONFIG[reason] || DEFAULT_REASON;

// ─── Sub-component: My Points Summary Card ───
const MyPointsCard = ({ points, loading }) => {
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

  return (
    <div className="bg-primary p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-primary/20">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Your Points</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-serif font-bold text-white tracking-tighter">
              {points?.total || 0}
            </span>
            <span className="text-sm font-bold text-accent uppercase tracking-widest">pts</span>
          </div>
          <p className="text-sm text-blue-100/60 font-medium">
            {user?.first_name || user?.username || 'Scholar'} • {user?.institution || 'Keep contributing to earn more!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <FileText className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Publish</p>
            <p className="text-sm font-bold text-white">+10</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <MessageSquare className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Review</p>
            <p className="text-sm font-bold text-white">+5</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <Bookmark className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Bookmark</p>
            <p className="text-sm font-bold text-white">+3</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center">
            <Heart className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Like</p>
            <p className="text-sm font-bold text-white">+2</p>
          </div>
        </div>
      </div>
      <Crown className="absolute top-[-10px] right-[-10px] w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
    </div>
  );
};

// ─── Sub-component: Transaction Item ───
const TransactionItem = ({ transaction }) => {
  const config = getReasonConfig(transaction.reason);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-5 p-4 hover:bg-[#F7FAFC] rounded-2xl transition-all border-b border-gray-50 last:border-0">
      <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center ${config.color} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-primary tracking-tight">{config.label}</h4>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`text-sm font-bold ${transaction.points > 0 ? 'text-green-500' : 'text-red-400'}`}>
        {transaction.points > 0 ? '+' : ''}{transaction.points}
      </span>
    </div>
  );
};

// ─── Sub-component: Leaderboard Row ───
const LeaderboardRow = ({ entry, isCurrentUser }) => {
  const rankDisplay = () => {
    if (entry.rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (entry.rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (entry.rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-300">#{entry.rank}</span>;
  };

  return (
    <div className={`flex items-center gap-5 p-5 rounded-2xl transition-all ${
      isCurrentUser
        ? 'bg-accent/5 border border-accent/20 shadow-sm'
        : 'hover:bg-[#F7FAFC] border-b border-gray-50 last:border-0'
    }`}>
      {/* Rank */}
      <div className="w-10 flex items-center justify-center shrink-0">
        {rankDisplay()}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/5 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
        {entry.avatar ? (
          <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-primary/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-primary tracking-tight truncate">
          {entry.full_name || entry.username}
          {isCurrentUser && (
            <span className="ml-2 text-[10px] font-bold text-accent uppercase tracking-widest">(You)</span>
          )}
        </h4>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest truncate">
          {entry.institution || 'Scholar'}
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <span className="text-lg font-bold text-primary">{entry.total_points?.toLocaleString()}</span>
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">pts</p>
      </div>
    </div>
  );
};

// ─── Sub-component: Empty Leaderboard ───
const EmptyLeaderboard = () => (
  <div className="bg-white p-16 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
    <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mx-auto mb-6">
      <Trophy className="w-10 h-10" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-primary mb-3">No Rankings Yet</h3>
    <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto leading-relaxed">
      Start publishing and reviewing to earn points and climb the leaderboard.
    </p>
    <Link
      to="/submit"
      className="inline-flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
    >
      <FileText className="w-4 h-4" />
      Submit Research
    </Link>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Main Leaderboard Page Component
// ═══════════════════════════════════════════════════════════════════
const Leaderboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [txPage, setTxPage] = useState(1);

  // ─── API Hooks ───
  const { data: leaderboard, isLoading: lbLoading } = useGetLeaderboardQuery();
  const { data: myPoints, isLoading: pointsLoading } = useGetMyPointsQuery();
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
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Points & Leaderboard</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium ml-[52px]">
          Earn points by contributing to the research community
        </p>
      </div>

      {/* ═══ 2. My Points Summary ═══ */}
      <MyPointsCard points={myPoints} loading={pointsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ═══ Left Column (7/12): Leaderboard ═══ */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Global Rankings</p>
              <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Top Scholars</h2>
            </div>
            <Link
              to="/explore"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2 group"
            >
              Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {lbLoading ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5 p-5 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-50 rounded-lg w-1/3"></div>
                    <div className="h-3 bg-gray-50 rounded-lg w-1/4"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : leaderboard?.length > 0 ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-4 md:p-6 space-y-1">
              {leaderboard.map(entry => (
                <LeaderboardRow
                  key={entry.username}
                  entry={entry}
                  isCurrentUser={entry.username === user?.username}
                />
              ))}
            </div>
          ) : (
            <EmptyLeaderboard />
          )}
        </div>

        {/* ═══ Right Column (5/12): Transaction History ═══ */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Activity Log</p>
            <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Points History</h2>
          </div>

          {txLoading ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5 p-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-50 rounded-lg w-2/3"></div>
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3"></div>
                  </div>
                  <div className="h-5 w-12 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : txResults.length > 0 ? (
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-4 md:p-6">
              {txResults.map(tx => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}

              {/* Transaction Pagination */}
              {txTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 mt-4 border-t border-gray-50">
                  <button
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    Page {txPage} of {txTotalPages}
                  </span>
                  <button
                    onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                    disabled={txPage === txTotalPages}
                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[2rem] border border-gray-50 shadow-sm text-center">
              <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-2">No Activity Yet</h3>
              <p className="text-sm text-gray-400 font-medium">
                Start contributing to see your points history here.
              </p>
            </div>
          )}

          {/* ═══ How to Earn Points Card ═══ */}
          <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10 relative overflow-hidden group">
            <h3 className="text-lg font-bold text-primary tracking-tight mb-6">How to Earn Points</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  Publish Article
                </span>
                <span className="text-sm font-bold text-accent">+10 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  Submit Review
                </span>
                <span className="text-sm font-bold text-accent">+5 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                  </div>
                  Receive Bookmark
                </span>
                <span className="text-sm font-bold text-accent">+3 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  Receive Like
                </span>
                <span className="text-sm font-bold text-accent">+2 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                  </div>
                  Receive Comment
                </span>
                <span className="text-sm font-bold text-accent">+1 pt</span>
              </div>
            </div>
            <Star className="absolute bottom-[-15px] right-[-15px] w-24 h-24 text-accent opacity-5 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
