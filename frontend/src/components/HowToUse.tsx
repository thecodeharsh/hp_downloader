import React from 'react';
import { Copy, ClipboardCheck, Search, Sliders, HardDriveDownload } from 'lucide-react';

export const HowToUse: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Copy Media Link',
      desc: 'Open YouTube, Instagram, or Facebook and copy the URL from your browser address bar or video share menu.',
      icon: <Copy className="w-6 h-6 text-brand-500" />
    },
    {
      step: '02',
      title: 'Paste to HP Downloader',
      desc: 'Paste the link into the URL input box above or tap the "Paste" button to insert directly from your clipboard.',
      icon: <ClipboardCheck className="w-6 h-6 text-brand-500" />
    },
    {
      step: '03',
      title: 'Scan Available Formats',
      desc: 'Click Download or hit Enter. HP Downloader securely analyzes the media stream and discovers available formats.',
      icon: <Search className="w-6 h-6 text-brand-500" />
    },
    {
      step: '04',
      title: 'Choose Resolution or MP3',
      desc: 'Select 1080p Full HD, 720p HD, standard MP4, or high-bitrate 320 kbps MP3 audio.',
      icon: <Sliders className="w-6 h-6 text-brand-500" />
    },
    {
      step: '05',
      title: 'Save Instantly to Device',
      desc: 'Click the final download button to save the media file directly to your computer, tablet, or phone.',
      icon: <HardDriveDownload className="w-6 h-6 text-brand-500" />
    }
  ];

  return (
    <section className="py-14 md:py-20 bg-white border-y border-gray-100" id="how-to-use">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Quick 5-Step Guide
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            How to Download with HP Downloader
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Clean, fast, and effortless downloading workflow designed for all devices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/60 relative flex flex-col justify-between hover:bg-white hover:border-brand-500/40 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    {s.icon}
                  </div>
                  <span className="text-2xl font-black text-gray-300">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
