import React, { useState, useEffect } from 'react';
import { Download, Globe, Menu, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiUrl } from '../utils/api.js';

interface HeaderProps {
  onPlatformSelect: (platform: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPlatformSelect,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    // Quick health probe to display API status pill
    fetch(apiUrl('/api/health'))
      .then(res => res.json())
      .then(data => {
        setApiHealthy(data.status === 'healthy');
      })
      .catch(() => {
        setApiHealthy(false);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <a href="#" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 group-hover:text-brand-500 transition-colors">
                  HP Downloader
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-gray-500 leading-none">
                  By Harsh Kumar
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onPlatformSelect('youtube')}
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              YouTube
            </button>
            <button
              onClick={() => onPlatformSelect('instagram')}
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              Instagram
            </button>
            <button
              onClick={() => onPlatformSelect('facebook')}
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              Facebook
            </button>
            <a
              href="#how-to-use"
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              How to Use
            </a>
            <a
              href="#features"
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#faq"
              className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-500 hover:bg-brand-50/50 rounded-lg transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action: API Status & Contact */}
          <div className="hidden sm:flex items-center space-x-3">
            {apiHealthy !== null && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gray-50/80 border-gray-200">
                <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-brand-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-gray-600">{apiHealthy ? 'Engine Active' : 'Checking Server'}</span>
              </div>
            )}
            <button
              onClick={onOpenContact}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-brand-500 border border-gray-200 hover:border-brand-500 rounded-lg transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onPlatformSelect('youtube');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              YouTube Downloader
            </button>
            <button
              onClick={() => {
                onPlatformSelect('instagram');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Instagram Downloader
            </button>
            <button
              onClick={() => {
                onPlatformSelect('facebook');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Facebook Downloader
            </button>
            <a
              href="#how-to-use"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              How to Use
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Created by Harsh Kumar</span>
            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              Support Email
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
