import React from 'react';
import { Youtube, Instagram, Facebook, Video, Share2, Music } from 'lucide-react';

interface SupportedPlatformsProps {
  onSelectPlatform: (platform: string) => void;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({ onSelectPlatform }) => {
  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube Downloader',
      desc: 'Download YouTube videos, Shorts, and audio in 1080p Full HD or MP3 format with high-speed processing.',
      color: 'from-red-500 to-red-600',
      tag: 'Videos & Shorts',
      icon: <Youtube className="w-6 h-6 text-red-500" />
    },
    {
      id: 'instagram',
      name: 'Instagram Downloader',
      desc: 'Save Instagram Reels, video posts, and carousel media directly to your mobile phone or computer.',
      color: 'from-pink-500 to-purple-600',
      tag: 'Reels & Videos',
      icon: <Instagram className="w-6 h-6 text-pink-500" />
    },
    {
      id: 'facebook',
      name: 'Facebook Downloader',
      desc: 'Download public Facebook videos, Watch episodes, and Reels in crisp MP4 format without quality loss.',
      color: 'from-blue-600 to-blue-700',
      tag: 'Watch & Reels',
      icon: <Facebook className="w-6 h-6 text-blue-600" />
    }
  ];

  return (
    <section className="py-12 md:py-16 max-w-6xl mx-auto px-4" id="platforms">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Supported Media Platforms
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
          Optimized native extractors tailored to each platform's video and audio structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              onSelectPlatform(p.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-brand-50/50 transition-colors">
                {p.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {p.tag}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
              {p.name}
            </h3>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              {p.desc}
            </p>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-600">
              <span>Open extractor</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
