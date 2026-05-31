import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A365D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#319795] p-2 rounded-xl">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight">
                Researcher
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering researchers worldwide with tools for peer review, journal matching, and publication support.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#319795] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#319795] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#319795] transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/explore" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Browse Articles
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Submit Research
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/category/all" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h3 className="text-lg font-bold mb-4">For Authors</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link to="/points/my" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Points System
                </Link>
              </li>
              <li>
                <Link to="/my-articles" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  My Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* For Reviewers */}
          <div>
            <h3 className="text-lg font-bold mb-4">For Reviewers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Become a Reviewer
                </Link>
              </li>
              <li>
                <Link to="/peer-review" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Review Guidelines
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-300 hover:text-[#319795] transition-colors text-sm">
                  Top Reviewers
                </Link>
              </li>
              <li>
                <a href="mailto:support@example.com" className="text-gray-300 hover:text-[#319795] transition-colors text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Researcher. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-gray-400 hover:text-[#319795] transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-[#319795] transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-400 hover:text-[#319795] transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
