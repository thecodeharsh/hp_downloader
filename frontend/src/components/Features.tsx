import React from 'react';
import { Film, Music, Smartphone, ShieldCheck, Zap, Infinity } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      title: 'Full High Definition',
      desc: 'Download videos up to 1080p Full HD resolution with clear audio track synchronization.',
      icon: <Film className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Studio Quality Audio (MP3)',
      desc: 'Extract pristine audio tracks from any video in high-bitrate MP3 format up to 320 kbps.',
      icon: <Music className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Shorts & Reels Ready',
      desc: 'Seamlessly capture vertical YouTube Shorts and Instagram Reels with full sound and quality.',
      icon: <Smartphone className="w-6 h-6 text-brand-500" />
    },
    {
      title: '100% Free & Unlimited',
      desc: 'No hidden fees, no limits on download count, and no registration or account setup required.',
      icon: <Infinity className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'High-Speed Processing',
      desc: 'Engineered with optimized streaming backend adapters for fast format scanning and delivery.',
      icon: <Zap className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Privacy & Security Guard',
      desc: 'Zero user tracking or cookie accumulation. Server files are automatically wiped after delivery.',
      icon: <ShieldCheck className="w-6 h-6 text-brand-500" />
    }
  ];

  return (
    <section className="py-14 md:py-20 max-w-6xl mx-auto px-4" id="features">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Core Capabilities
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
          What You Can Download with HP Downloader
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
          Built for creators, students, and media enthusiasts who need dependable, high-fidelity media downloads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-brand-500/40 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 flex-shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
