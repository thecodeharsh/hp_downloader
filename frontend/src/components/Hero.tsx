import React from 'react';
import { Sparkles, Shield, Zap, Film } from 'lucide-react';

interface HeroProps {
  activePlatform?: string;
}

export const Hero: React.FC<HeroProps> = ({ activePlatform }) => {
  const getPlatformTitle = () => {
    if (activePlatform === 'youtube') return 'YouTube Video Downloader';
    if (activePlatform === 'instagram') return 'Instagram Video & Reels Downloader';
    if (activePlatform === 'facebook') return 'Facebook Video & Reels Downloader';
    return 'Universal Video & Audio Downloader';
  };

  return (
    <section className="pt-8 pb-4 md:pt-14 md:pb-6 text-center px-4 max-w-4xl mx-auto">
      
      {/* Category Tag */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs md:text-sm font-semibold mb-4 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5" />
        <span>HP Downloader — Created by Harsh Kumar</span>
      </div>

      {/* Main H1 Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight md:leading-[1.15] mb-3">
        {getPlatformTitle()}
      </h1>

      {/* Subtitle H2 */}
      <h2 className="text-base sm:text-lg md:text-xl font-normal text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
        Download high-definition videos in 1080p, 720p, or extract MP3 audio directly from YouTube, Instagram, and Facebook with zero watermarks.
      </h2>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500 font-medium pt-1">
        <div className="flex items-center space-x-1.5">
          <Film className="w-4 h-4 text-brand-500" />
          <span>Full HD 1080p Support</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-brand-500" />
          <span>Instant Extraction</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-brand-500" />
          <span>No Ads or Software Required</span>
        </div>
      </div>

    </section>
  );
};
