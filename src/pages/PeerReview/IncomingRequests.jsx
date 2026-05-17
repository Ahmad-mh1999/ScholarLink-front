import React from 'react';
import { Inbox, Loader2 } from 'lucide-react';

const IncomingRequests = ({ requests, isLoading, onRespond }) => {
  if (isLoading) {
    return (
      <div className="space-y-8 min-h-[400px]">
        {[1, 2].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse shadow-sm"></div>)}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-100 text-center space-y-6 flex flex-col items-center justify-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-[#F7FAFC] rounded-full flex items-center justify-center text-gray-200">
          <Inbox className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-primary tracking-tight italic opacity-60">No additional requests currently available</h3>
          <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
            New invitations will appear here as editors match your profile expertise with new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex px-4 py-1.5 bg-[#EBF1FF] rounded-lg">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
          {requests.length} Pending Invitations
        </span>
      </div>

      <div className="space-y-8">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-lg uppercase tracking-widest border border-accent/10">
                    {request.category_name || 'QUANTUM PHYSICS'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    Submitted {request.created_at_formatted || 'Oct 24, 2023'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-primary leading-tight tracking-tight">
                  {request.title}
                </h3>
                
                <p className="text-sm text-gray-400 font-medium">
                  By <span className="text-primary font-bold">{request.author_name}</span>
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(request.tags || ['#QuantumEntanglement', '#NonLocalTheory']).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#F7FAFC] text-[#A0AEC0] text-[10px] font-bold rounded-lg border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[180px]">
                <button 
                  onClick={() => onRespond(request.id, 'accept')}
                  className="w-full bg-primary hover:bg-[#152c4d] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                >
                  Accept Review
                </button>
                <button 
                  onClick={() => onRespond(request.id, 'decline')}
                  className="w-full bg-[#EBF1FF] hover:bg-gray-100 text-[#A0AEC0] py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Decline
                </button>
              </div>
            </div>

            {/* Unread Dot */}
            {!request.is_read && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="w-2.5 h-2.5 bg-accent rounded-full shadow-sm shadow-accent/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomingRequests;
