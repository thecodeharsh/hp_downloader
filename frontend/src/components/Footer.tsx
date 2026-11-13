import React from 'react';
import { Download, Mail, Heart, Shield, FileText, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact
}) => {
  return (
    <footer className="bg-[#1a1d2b] text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800/80">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Download className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                HP Downloader
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              HP Downloader is a high-speed, secure, and free online media extraction service created by <strong className="text-white font-medium">Harsh Kumar</strong>. Convert and save high-definition video and audio seamlessly.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-xs text-gray-400">
              <span>Creator & Lead Architect:</span>
              <span className="text-brand-400 font-semibold">Harsh Kumar</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Supported Media
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#hero" className="hover:text-brand-400 transition-colors">
                  YouTube Downloader
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-brand-400 transition-colors">
                  YouTube to MP3
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-brand-400 transition-colors">
                  Instagram Reels & Videos
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-brand-400 transition-colors">
                  Facebook Watch & Reels
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a
                  href="mailto:kum.harshofficial@gmail.com"
                  className="inline-flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">kum.harshofficial@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            All rights reserved © 2026 HP Downloader. Created by <span className="text-white font-semibold">Harsh Kumar</span>.
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">Privacy</button>
            <span>•</span>
            <button onClick={onOpenTerms} className="hover:text-white transition-colors">Terms</button>
            <span>•</span>
            <button onClick={onOpenContact} className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
