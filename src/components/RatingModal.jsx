import React, { useState } from 'react';
import { X, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRateArticleMutation } from '../api/baseApi';

const RatingModal = ({ slug, currentRating, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState(null);
  const [rateArticle, { isLoading }] = useRateArticleMutation();

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      await rateArticle({ slug, rating }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.data?.detail || err?.data?.rating?.[0] || 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Rate This Article</h3>
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

        {/* Rating Stars */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-gray-400 font-medium text-center">
            How would you rate this research article?
          </p>
          <div className="flex items-center justify-center gap-3">
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
                  className={`w-12 h-12 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-bold text-primary">
              {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Rating Labels */}
        <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-8 px-4">
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Great</span>
          <span>Excellent</span>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
            className="flex-1 bg-accent hover:bg-[#287E7B] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
