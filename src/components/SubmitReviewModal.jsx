import React, { useState } from 'react';
import { X, Star, MessageSquare, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubmitReviewMutation } from '../api/baseApi';

const SubmitReviewModal = ({ review, onClose, onSuccess }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [decision, setDecision] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState(null);

  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!feedback.trim()) {
      setError('Please provide feedback for the authors.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!decision) {
      setError('Please select a review decision.');
      return;
    }

    try {
      await submitReview({
        id: review.id,
        feedback: feedback.trim(),
        rating,
        decision,
        is_anonymous: isAnonymous,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.data?.detail || err?.data?.non_field_errors?.[0] || 'Failed to submit review. Please try again.');
    }
  };

  const decisions = [
    { value: 'approved', label: 'Approve', description: 'Article meets standards for publication', color: 'text-green-600 border-green-200 bg-green-50' },
    { value: 'revision', label: 'Request Revision', description: 'Minor changes required before approval', color: 'text-amber-600 border-amber-200 bg-amber-50' },
    { value: 'rejected', label: 'Reject', description: 'Article does not meet publication standards', color: 'text-red-600 border-red-200 bg-red-50' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Submit Review</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">
              Reviewing: <span className="text-primary font-bold line-clamp-1">{review?.article?.title || 'Article'}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Star className="w-3 h-3" /> Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-bold text-primary">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Decision */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> Decision
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {decisions.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDecision(d.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    decision === d.value
                      ? d.color + ' border-current'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <p className={`text-sm font-bold ${decision === d.value ? 'text-current' : 'text-primary'}`}>{d.label}</p>
                  <p className={`text-[10px] font-medium mt-1 ${decision === d.value ? 'text-current opacity-70' : 'text-gray-400'}`}>{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Detailed Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the authors. Include specific comments on methodology, analysis, conclusions, and suggestions for improvement..."
              rows={8}
              className="w-full bg-[#F7FAFC] border-none rounded-[2rem] p-8 text-primary font-medium placeholder-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-primary">Submit Anonymously</p>
                <p className="text-[10px] text-gray-400 font-medium">Your identity will not be revealed to the authors</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-accent hover:bg-[#287E7B] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;
