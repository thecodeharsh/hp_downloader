import React, { useEffect } from 'react';
import { X, ShieldCheck, Mail } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Privacy Policy — HP Downloader
              </h3>
              <p className="text-xs text-gray-500">Last updated: November 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">1. Information We Process</h4>
            <p>
              HP Downloader, created by Harsh Kumar, is built on a privacy-first foundation. We only process the media URLs you submit for the sole purpose of analyzing stream availability and providing downloadable formats. We do not require accounts, logins, credit cards, or personal identifiers.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">2. Temporary File Retention & Purging</h4>
            <p>
              When media streams require conversion or multiplexing (such as merging separate video and audio streams), the resultant files are stored in isolated, bounded temporary storage. Files are automatically scheduled for permanent deletion within 15 minutes or immediately after delivery. We do not maintain any persistent archives of user downloads.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">3. Server Logs & Request Security</h4>
            <p>
              Our backend records operational event logs strictly for diagnostic reliability, rate limiting, and Server-Side Request Forgery (SSRF) defense. Logs contain standard HTTP metadata (timestamps, response codes) and do not link queries to identified individuals.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">4. Cookies and Tracking</h4>
            <p>
              HP Downloader uses zero advertising cookies, third-party behavioral trackers, or fingerprinting scripts. Your session is stateless.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">5. Contact & Inquiries</h4>
            <p>
              If you have questions or inquiries regarding our privacy practices, please contact creator Harsh Kumar directly at:
            </p>
            <a
              href="mailto:kum.harshofficial@gmail.com"
              className="inline-flex items-center space-x-1.5 text-brand-600 font-semibold hover:underline mt-1"
            >
              <Mail className="w-4 h-4" />
              <span>kum.harshofficial@gmail.com</span>
            </a>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
