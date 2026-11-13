import React, { useState } from 'react';
import { Download, Film, Music, Clock, User, Check, Sparkles, ExternalLink } from 'lucide-react';
import { MediaMetadata, MediaFormatOption } from '../types.js';

interface ResultCardProps {
  metadata: MediaMetadata;
  onDownload: (format: MediaFormatOption) => void;
  isDownloading: boolean;
  activeFormatId: string | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  metadata,
  onDownload,
  isDownloading,
  activeFormatId
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const videoFormats = metadata.formats.filter((f) => f.type === 'video');
  const audioFormats = metadata.formats.filter((f) => f.type === 'audio');

  const currentFormats = activeTab === 'video' ? videoFormats : audioFormats;

  const getPlatformBadge = () => {
    switch (metadata.platform) {
      case 'YouTube':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">YouTube</span>;
      case 'Instagram':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">Instagram</span>;
      case 'Facebook':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Facebook</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Media</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        
        {/* Media Preview Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-col md:flex-row gap-5 items-start">
          
          {/* Thumbnail with duration badge */}
          <div className="relative w-full md:w-72 flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-inner group">
            {metadata.thumbnail ? (
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <Film className="w-10 h-10 opacity-50" />
              </div>
            )}
            {metadata.duration > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-xs font-mono font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3 text-brand-500" />
                <span>{metadata.durationFormatted}</span>
              </div>
            )}
          </div>

          {/* Title and metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getPlatformBadge()}
              <span className="text-xs text-brand-600 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Ready to download</span>
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
              {metadata.title}
            </h3>

            {metadata.uploader && (
              <div className="flex items-center space-x-1.5 text-xs text-gray-600 mb-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">{metadata.uploader}</span>
              </div>
            )}

            <div className="pt-2 flex items-center space-x-2">
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors"
              >
                <span>View original post</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Format Selection Tabs */}
        <div className="px-5 md:px-6 pt-5">
          <div className="flex space-x-2 border-b border-gray-100 pb-3">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'video'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video (MP4)</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'video' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {videoFormats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'audio'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio Only (MP3)</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'audio' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {audioFormats.length}
              </span>
            </button>
          </div>
        </div>

        {/* Format Options List / Table */}
        <div className="p-5 md:p-6 space-y-2.5">
          {currentFormats.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No additional {activeTab} streams available for this source.</p>
          ) : (
            currentFormats.map((format) => {
              const isThisDownloading = isDownloading && activeFormatId === format.formatId;

              return (
                <div
                  key={format.formatId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 md:p-4 rounded-xl border border-gray-200 hover:border-brand-500/60 bg-white hover:bg-brand-50/20 transition-all gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      {format.ext}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm md:text-base">
                          {format.qualityLabel}
                        </span>
                        {format.resolution.includes('1080') && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-100 text-brand-700 uppercase">
                            Full HD
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        File Size: {format.filesizeText}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDownload(format)}
                    disabled={isDownloading}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                      isThisDownloading
                        ? 'bg-brand-600 shadow-none'
                        : isDownloading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/20'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isThisDownloading ? 'Processing...' : 'Download'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
