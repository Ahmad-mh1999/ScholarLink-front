import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Eye, ExternalLink, Inbox, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubmitReviewModal from '../../components/SubmitReviewModal';

const MyReviews = ({ reviews, isLoading, onSubmitSuccess }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse shadow-sm"></div>)}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center space-y-6 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[#F7FAFC] rounded-full flex items-center justify-center text-gray-200">
          <FileText className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-primary tracking-tight italic opacity-60">No active reviews or submissions</h3>
          <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
            Your scholarly evaluations and submitted manuscripts will appear here for tracking and management.
          </p>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-accent/10 text-accent border-accent/20';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pending': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {reviews.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                    {item.status?.replace('_', ' ') || 'Pending'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last updated {item.updated_at_formatted || '2 days ago'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors line-clamp-1">
                  {item.article_title || item.title}
                </h3>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold">{item.views_count || 0} Views</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">{item.role || 'Reviewer'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  to={`/article/${item.slug}`}
                  className="p-3 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all"
                  title="View Full Article"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
                {item.status === 'in_progress' && (
                  <button 
                    onClick={() => setSelectedReview(item)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#152c4d] transition-all shadow-lg shadow-primary/10 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Review Modal */}
      {selectedReview && (
        <SubmitReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSuccess={() => {
            setSelectedReview(null);
            onSubmitSuccess?.();
          }}
        />
      )}
    </>
  );
};

export default MyReviews;
