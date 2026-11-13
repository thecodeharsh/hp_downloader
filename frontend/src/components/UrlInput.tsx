import React, { useState, useRef, useEffect } from 'react';
import { Link2, X, ClipboardPaste, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  error: string | null;
  onClearError: () => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onAnalyze,
  isLoading,
  selectedPlatform,
  onSelectPlatform,
  error,
  onClearError
}) => {
  const [url, setUrl] = useState('');
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'clipboard' in navigator && typeof navigator.clipboard?.readText === 'function') {
      setClipboardSupported(true);
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        onClearError();
        inputRef.current?.focus();
      }
    } catch (err) {
      console.log('Clipboard permission not granted or unavailable:', err);
    }
  };

  const handleClear = () => {
    setUrl('');
    onClearError();
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || isLoading) return;
    onAnalyze(trimmed);
  };

  const getPlaceholder = () => {
    switch (selectedPlatform) {
      case 'youtube':
        return 'Paste YouTube video or Shorts link here...';
      case 'instagram':
        return 'Paste Instagram video, Reels, or post link...';
      case 'facebook':
        return 'Paste Facebook video or Watch link...';
      default:
        return 'Paste YouTube, Instagram, or Facebook link...';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Primary Input Container matching reference visual structure */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl md:rounded-3xl border-2 md:border-[3px] border-gray-200 focus-within:border-brand-500 shadow-xl shadow-gray-200/50 p-2 md:p-3 transition-all duration-200 flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="flex items-center w-full flex-1 px-2 md:px-3">
          {/* Globe / Link Icon */}
          <div className="text-gray-400 mr-2.5 flex-shrink-0">
            <Link2 className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) onClearError();
            }}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            className="w-full py-2.5 md:py-3 text-base md:text-xl text-gray-900 placeholder:text-gray-400 bg-transparent outline-none font-medium truncate"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors ml-1"
              title="Clear input"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Paste Button */}
          {clipboardSupported && !url && !isLoading && (
            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors ml-2"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-gray-600" />
              <span>Paste</span>
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className={`w-full sm:w-auto px-6 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl text-white shadow-md flex items-center justify-center space-x-2 transition-all duration-150 active:scale-[0.98] ${
            !url.trim() || isLoading
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Download</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </>
          )}
        </button>
      </form>

      {/* Error Alert Banner */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Extraction Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={onClearError}
            className="text-red-400 hover:text-red-600 p-1"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Platform Switcher Pills */}
      <div className="mt-5 flex items-center justify-center flex-wrap gap-2 sm:gap-3">
        <span className="text-xs text-gray-500 font-medium mr-1 hidden sm:inline">Supported platforms:</span>
        <button
          type="button"
          onClick={() => onSelectPlatform('youtube')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
            selectedPlatform === 'youtube'
              ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span>YouTube</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectPlatform('instagram')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
            selectedPlatform === 'instagram'
              ? 'bg-pink-50 text-pink-700 border-pink-200 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-pink-600" />
          <span>Instagram</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectPlatform('facebook')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
            selectedPlatform === 'facebook'
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};
