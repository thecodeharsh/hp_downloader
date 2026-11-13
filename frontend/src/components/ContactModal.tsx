import React, { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Thank you! Your message has been sent successfully.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try emailing directly.');
      }
    } catch {
      setErrorMsg('Network error. You may email us directly at kum.harshofficial@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Contact & Support
              </h3>
              <p className="text-xs text-gray-500">HP Downloader — Created by Harsh Kumar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {/* Direct Support Card */}
          <div className="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">
                Direct Support Email
              </span>
              <a
                href="mailto:kum.harshofficial@gmail.com"
                className="text-sm md:text-base font-bold text-brand-700 hover:underline flex items-center space-x-1.5 mt-0.5"
              >
                <Mail className="w-4 h-4" />
                <span>kum.harshofficial@gmail.com</span>
              </a>
            </div>
          </div>

          {successMsg ? (
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto" />
              <h4 className="text-lg font-bold text-gray-900">Message Delivered</h4>
              <p className="text-sm text-gray-600">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="mt-2 px-4 py-2 text-xs font-bold text-brand-600 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 text-sm outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 text-sm outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry about HP Downloader features"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 text-sm outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 text-sm outline-none font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
