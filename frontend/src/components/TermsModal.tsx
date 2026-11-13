import React, { useEffect } from 'react';
import { X, FileText, Mail } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Terms of Service — HP Downloader
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
            <h4 className="font-bold text-gray-900 text-base mb-1">1. Acceptance of Terms</h4>
            <p>
              By accessing and using HP Downloader (created by Harsh Kumar), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this utility.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">2. Permitted & Lawful Use</h4>
            <p>
              HP Downloader is designed for personal, fair-use, and educational backup of media that you own, have explicit authorization to download, or which is licensed under public domain or Creative Commons. You agree not to use this service to infringe upon the intellectual property or copyright of any third party.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">3. Access Controls & Platform Protections</h4>
            <p>
              HP Downloader strictly respects digital rights management (DRM), platform authentication boundaries, paywalls, and private account protections. Our backend does not circumvent access restrictions, decrypt protected content, or harvest login credentials.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">4. Disclaimer of Warranty & Service Availability</h4>
            <p>
              The service is provided on an "as is" and "as available" basis without warranties of any kind. Service availability depends on source platforms' publicly accessible interfaces. We reserve the right to limit request volumes or block abusive requests.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 text-base mb-1">5. Creator Credit & Contact</h4>
            <p>
              HP Downloader is authored by Harsh Kumar. For support inquiries or copyright concerns, reach out to:
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
            Agree & Close
          </button>
        </div>
      </div>
    </div>
  );
};
