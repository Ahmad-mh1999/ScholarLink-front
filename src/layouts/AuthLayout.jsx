import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, heroTitle, heroText }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Hero Section */}
        <div className="hidden md:flex md:w-5/12 bg-primary relative overflow-hidden p-12 flex-col justify-between text-white">
          {/* Background Pattern (Simple Dot Grid) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 text-2xl font-serif">
            <BookOpen className="text-accent w-8 h-8" />
            <span className="font-bold tracking-tight">Researcher</span>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mb-20">
            <h1 className="text-5xl lg:text-6xl font-serif leading-tight mb-8">
              {heroTitle || "Empowering Global Research Collaboration"}
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed opacity-80">
              {heroText || "Join a curated network of scholars, researchers, and students dedicated to high-impact academic inquiry and cross-disciplinary innovation."}
            </p>
          </div>

          {/* Social Proof Placeholder */}
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 inline-flex items-center gap-4 border border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-accent border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium">Joined by 40k+ Peer Reviewers</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="flex-grow md:w-7/12 bg-[#F7FAFC] flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-12 flex flex-col md:flex-row justify-between items-center text-[11px] text-gray-400 uppercase tracking-widest font-medium">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="text-primary font-serif lowercase tracking-normal text-lg normal-case">[Platform Name]</span>
          <span>© 2024 [Platform Name]. The Academic Research Platform.</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Ethical Guidelines</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
