import React, { useState } from 'react';
import { X, Copy, Check, FileText, Quote } from 'lucide-react';
import { useGetCitationQuery } from '../api/baseApi';

const CitationModal = ({ slug, onClose }) => {
  const [copied, setCopied] = useState(null);
  const { data: citation, isLoading } = useGetCitationQuery(slug);

  const copyToClipboard = (text, format) => {
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const formats = [
    { key: 'apa', label: 'APA 7th Edition', icon: FileText },
    { key: 'mla', label: 'MLA 9th Edition', icon: Quote },
    { key: 'chicago', label: 'Chicago Style', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Quote className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Cite This Article</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {formats.map((_, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl animate-pulse">
                <div className="h-4 bg-gray-200 rounded-lg w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {formats.map((format) => {
              const Icon = format.icon;
              const citationText = citation?.[`citation_${format.key}`] || '';
              return (
                <div key={format.key} className="bg-gray-50 p-6 rounded-2xl group hover:bg-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{format.label}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(citationText, format.key)}
                      className="flex items-center gap-2 text-xs font-bold text-accent hover:text-primary transition-colors"
                    >
                      {copied === format.key ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed font-mono bg-white p-4 rounded-xl border border-gray-100">
                    {citationText || 'Citation not available'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center">
            Use these citations in your research papers. Always verify citation format requirements for your specific journal or institution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitationModal;
