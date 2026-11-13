import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is HP Downloader free to use?',
      a: 'Yes, HP Downloader is 100% free to use. You can download videos and audio as often as you like with zero subscriptions, hidden fees, or account registration requirements.'
    },
    {
      q: 'Can I extract audio only as an MP3?',
      a: 'Absolutely. Whenever you analyze a video, HP Downloader offers dedicated high-quality audio extraction options (up to 320 kbps MP3), ideal for podcasts, music clips, and sound recordings.'
    },
    {
      q: 'What video resolutions and formats are available?',
      a: 'We support Full HD (1080p), HD (720p), Standard Definition (480p), and 360p in universal MP4 container format, ensuring compatibility across all modern smart TVs, phones, tablets, and media players.'
    },
    {
      q: 'Does HP Downloader store or log my downloaded files?',
      a: 'No. HP Downloader respects user privacy. We do not store or inspect your personal information. Any temporary files generated during streaming conversion are automatically deleted from server memory within minutes of delivery.'
    },
    {
      q: 'Does it work smoothly on mobile and desktop?',
      a: 'Yes! HP Downloader is engineered with a responsive design that functions seamlessly on iPhone (Safari/Chrome), Android, iPads, macOS, and Windows computers.'
    },
    {
      q: 'Why does an error appear for certain videos?',
      a: 'HP Downloader adheres strictly to platform security and copyright standards. Videos that are marked private by the owner, age-restricted, gated behind account logins, or protected by digital rights management (DRM) cannot be downloaded.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-14 md:py-20 bg-white border-t border-gray-100" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Got Questions?
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Everything you need to know about downloading video and audio with HP Downloader.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-gray-900 hover:text-brand-600 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
