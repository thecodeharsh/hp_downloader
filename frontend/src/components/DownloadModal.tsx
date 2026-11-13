import React, { useEffect } from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, X, FileVideo } from 'lucide-react';
import { DownloadJobState } from '../types.js';

interface DownloadModalProps {
  job: DownloadJobState | null;
  onClose: () => void;
  onSaveFile: (jobId: string, filename: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ job, onClose, onSaveFile }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const isReady = job.status === 'ready';
  const isError = job.status === 'error';
  const isPending = !isReady && !isError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Close dialog (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          
          {/* Status Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-inner">
            {isReady ? (
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : isError ? (
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <Loader2 className="w-9 h-9 animate-spin" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {isReady ? 'Download Ready!' : isError ? 'Download Failed' : 'Preparing Your Media'}
          </h3>

          <p className="text-xs text-gray-500 mb-4 px-4 truncate">
            {job.safeFilename || 'HP_Downloader_Media'}
          </p>

          {/* Progress Bar */}
          {isPending && (
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-3 relative">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, job.progress)}%` }}
              />
            </div>
          )}

          {/* Progress Message */}
          <p className={`text-sm font-medium ${isError ? 'text-red-600' : 'text-gray-600'} mb-6`}>
            {job.message || (isReady ? 'Your media file has been generated and is ready to save.' : 'Fetching streams...')}
          </p>

          {/* Action Buttons */}
          {isReady && (
            <button
              onClick={() => onSaveFile(job.id, job.safeFilename || 'download')}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Save File to Device</span>
            </button>
          )}

          {isError && (
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-colors"
            >
              Dismiss
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
