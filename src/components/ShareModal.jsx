import React, { useState } from 'react';
import { X, Share2, Copy, Check, Twitter, Linkedin, Mail, Link as LinkIcon } from 'lucide-react';

const ShareModal = ({ slug, onClose }) => {
  const [copied, setCopied] = useState(false);
  const articleUrl = `${window.location.origin}/article/${slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = 'Check out this research article';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareToEmail = () => {
    const subject = 'Research Article';
    const body = `I found this interesting research article: ${articleUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Share Article</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-6">
          {/* Social Media */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={shareToTwitter}
              className="flex flex-col items-center gap-2 p-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-2xl transition-all group"
            >
              <Twitter className="w-6 h-6 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-600">Twitter</span>
            </button>
            <button
              onClick={shareToLinkedIn}
              className="flex flex-col items-center gap-2 p-4 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 rounded-2xl transition-all group"
            >
              <Linkedin className="w-6 h-6 text-[#0077B5] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-600">LinkedIn</span>
            </button>
            <button
              onClick={shareToEmail}
              className="flex flex-col items-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all group"
            >
              <Mail className="w-6 h-6 text-gray-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-600">Email</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Article Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 truncate font-mono">
                {articleUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-primary text-white rounded-xl hover:bg-[#152c4d] transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center">
            Share this research with your network to help spread knowledge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
