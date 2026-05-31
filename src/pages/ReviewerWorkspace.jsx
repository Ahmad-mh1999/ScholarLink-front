import React, { useState } from 'react';
import { 
  useGetMyReviewRequestsQuery, 
  useGetMyReviewsQuery,
  useAcceptReviewRequestMutation,
  useRejectReviewRequestMutation,
  useSubmitReviewMutation,
  useUpdateArticleMutation
} from '../api/baseApi';
import { CheckCircle2, XCircle, Clock, FileText, Star, Send, Loader2, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const JOURNAL_OPTIONS = [
  { value: 'none', label: 'No Journal Nomination' },
  { value: 'nature', label: 'Nature' },
  { value: 'science', label: 'Science' },
  { value: 'cell', label: 'Cell' },
  { value: 'lancet', label: 'The Lancet' },
  { value: 'nejm', label: 'New England Journal of Medicine' },
  { value: 'ieee', label: 'IEEE Transactions' },
  { value: 'acm', label: 'ACM Publications' },
  { value: 'springer', label: 'Springer Nature' },
  { value: 'elsevier', label: 'Elsevier' },
  { value: 'wiley', label: 'Wiley' },
  { value: 'taylor', label: 'Taylor & Francis' },
  { value: 'sage', label: 'SAGE Publications' },
  { value: 'oxford', label: 'Oxford University Press' },
  { value: 'cambridge', label: 'Cambridge University Press' },
  { value: 'other', label: 'Other Journal' }
];

const ReviewerWorkspace = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'reviews'
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [decision, setDecision] = useState('');
  const [journalNomination, setJournalNomination] = useState('none');

  const { data: reviewRequests, isLoading: requestsLoading, refetch: refetchRequests } = useGetMyReviewRequestsQuery();
  const { data: myReviews, isLoading: reviewsLoading, refetch: refetchReviews } = useGetMyReviewsQuery();
  
  const [acceptRequest, { isLoading: accepting }] = useAcceptReviewRequestMutation();
  const [rejectRequest, { isLoading: rejecting }] = useRejectReviewRequestMutation();
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();
  const [updateArticle] = useUpdateArticleMutation();

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptRequest(requestId).unwrap();
      toast.success('Review request accepted');
      refetchRequests();
      refetchReviews();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectRequest(requestId).unwrap();
      toast.success('Review request rejected');
      refetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !decision) {
      toast.error('Please select a decision');
      return;
    }

    try {
      await submitReview({
        id: selectedReview.id,
        feedback,
        rating,
        status: decision,
      }).unwrap();

      // If approved and journal nominated, update article with journal nomination
      if (decision === 'approved' && journalNomination !== 'none' && selectedReview.article) {
        await updateArticle({
          slug: selectedReview.article.slug,
          journal_nomination: journalNomination,
        }).unwrap();
        toast.success(`Review submitted and nominated to ${JOURNAL_OPTIONS.find(j => j.value === journalNomination)?.label}`);
      } else {
        toast.success('Review submitted successfully');
      }

      setSelectedReview(null);
      setFeedback('');
      setRating(0);
      setDecision('');
      setJournalNomination('none');
      refetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const pendingRequests = reviewRequests?.filter(r => r.status === 'pending') || [];
  const inProgressReviews = myReviews?.filter(r => r.status === 'in_progress') || [];
  const completedReviews = myReviews?.filter(r => ['approved', 'rejected', 'revision'].includes(r.status)) || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A365D] mb-2">Reviewer Workspace</h1>
        <p className="text-[#2D3748]">Manage your assigned articles and submit peer reviews</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-[#319795] text-white'
              : 'bg-white text-[#2D3748] border border-gray-200 hover:border-[#319795]'
          }`}
        >
          Review Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'reviews'
              ? 'bg-[#319795] text-white'
              : 'bg-white text-[#2D3748] border border-gray-200 hover:border-[#319795]'
          }`}
        >
          My Reviews ({myReviews?.length || 0})
        </button>
      </div>

      {/* Review Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#319795] animate-spin" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#2D3748] font-medium">No pending review requests</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A365D] mb-2">{request.article?.title}</h3>
                    <p className="text-sm text-[#2D3748] mb-4 line-clamp-2">{request.article?.abstract}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Assigned by: {request.assigned_by?.first_name} {request.assigned_by?.last_name}</span>
                      <span>•</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={accepting}
                      className="flex items-center gap-2 px-4 py-2 bg-[#319795] text-white rounded-xl font-bold hover:bg-[#287E7B] transition-all disabled:opacity-50"
                    >
                      {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={rejecting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* In Progress Reviews */}
          {inProgressReviews.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A365D] mb-4">In Progress</h2>
              <div className="space-y-4">
                {inProgressReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#1A365D] mb-2">{review.article?.title}</h3>
                        <p className="text-sm text-[#2D3748] line-clamp-2">{review.article?.abstract}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full">
                        In Progress
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="w-full px-6 py-3 bg-[#1A365D] text-white rounded-2xl font-bold hover:bg-[#2D3748] transition-all"
                    >
                      Continue Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Reviews */}
          {completedReviews.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A365D] mb-4">Completed</h2>
              <div className="space-y-4">
                {completedReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1A365D] mb-2">{review.article?.title}</h3>
                        <p className="text-sm text-[#2D3748] mb-4 line-clamp-2">{review.feedback}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                            review.status === 'approved' ? 'bg-green-100 text-green-700' :
                            review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {review.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#319795] animate-spin" />
            </div>
          ) : inProgressReviews.length === 0 && completedReviews.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#2D3748] font-medium">No reviews yet</p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A365D]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold text-[#1A365D] mb-4">Submit Review</h2>
            <h3 className="text-lg font-bold text-[#2D3748] mb-4">{selectedReview.article?.title}</h3>
            
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 block">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        rating >= value ? 'bg-[#319795] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 block">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on the article..."
                  className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-[#2D3748] focus:ring-2 focus:ring-[#319795]/20 outline-none resize-none h-32"
                />
              </div>

              {/* Decision */}
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 block">Decision</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setDecision('approved')}
                    className={`px-4 py-3 rounded-2xl font-bold transition-all ${
                      decision === 'approved'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setDecision('revision')}
                    className={`px-4 py-3 rounded-2xl font-bold transition-all ${
                      decision === 'revision'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => setDecision('rejected')}
                    className={`px-4 py-3 rounded-2xl font-bold transition-all ${
                      decision === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Journal Nomination (only shown when approved) */}
              {decision === 'approved' && (
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Journal Nomination (Optional)
                  </label>
                  <select
                    value={journalNomination}
                    onChange={(e) => setJournalNomination(e.target.value)}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-[#2D3748] focus:ring-2 focus:ring-[#319795]/20 outline-none"
                  >
                    {JOURNAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Recommend a suitable journal for this manuscript based on your evaluation
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setFeedback('');
                    setRating(0);
                    setDecision('');
                    setJournalNomination('none');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-[#2D3748] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !decision}
                  className="flex-1 px-6 py-3 bg-[#319795] text-white rounded-2xl font-bold hover:bg-[#287E7B] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewerWorkspace;
