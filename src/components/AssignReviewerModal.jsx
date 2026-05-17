import React, { useState } from 'react';
import { X, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAssignReviewerMutation } from '../api/baseApi';

const AssignReviewerModal = ({ article, onClose, onSuccess }) => {
  const [reviewerUsername, setReviewerUsername] = useState('');
  const [error, setError] = useState(null);
  const [assignReviewer, { isLoading }] = useAssignReviewerMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerUsername.trim()) {
      setError('Please enter a reviewer username');
      return;
    }

    try {
      await assignReviewer({ slug: article.slug, reviewer: reviewerUsername.trim() }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.data?.detail || err?.data?.error || 'Failed to assign reviewer. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Assign Reviewer</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Info */}
        <div className="bg-gray-50 p-4 rounded-2xl mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Article</p>
          <p className="text-sm font-bold text-primary line-clamp-2">{article.title}</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-3">Reviewer Username</label>
            <input
              type="text"
              value={reviewerUsername}
              onChange={(e) => {
                setReviewerUsername(e.target.value);
                setError(null);
              }}
              placeholder="Enter reviewer's username"
              className="w-full bg-[#F7FAFC] border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reviewerUsername.trim()}
              className="flex-1 bg-accent hover:bg-[#287E7B] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Assign Reviewer
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center">
            The reviewer will receive a notification to review this article.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignReviewerModal;
