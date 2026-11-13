import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { UrlInput } from './components/UrlInput.js';
import { LoadingSkeleton } from './components/LoadingSkeleton.js';
import { ResultCard } from './components/ResultCard.js';
import { DownloadModal } from './components/DownloadModal.js';
import { SupportedPlatforms } from './components/SupportedPlatforms.js';
import { HowToUse } from './components/HowToUse.js';
import { Features } from './components/Features.js';
import { FaqSection } from './components/FaqSection.js';
import { Footer } from './components/Footer.js';
import { PrivacyModal } from './components/PrivacyModal.js';
import { TermsModal } from './components/TermsModal.js';
import { ContactModal } from './components/ContactModal.js';
import { MediaMetadata, MediaFormatOption, DownloadJobState } from './types.js';

export const App: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);

  // Download state
  const [activeJob, setActiveJob] = useState<DownloadJobState | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);

  // Modals
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  const [contactOpen, setContactOpen] = useState<boolean>(false);

  const pollIntervalRef = useRef<number | null>(null);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleAnalyze = async (url: string) => {
    setError(null);
    setIsLoading(true);
    setMetadata(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract video details.');
      }

      setMetadata(json.data);

      // Auto-update selected platform tab if matched
      if (json.data.platform === 'YouTube') setSelectedPlatform('youtube');
      else if (json.data.platform === 'Instagram') setSelectedPlatform('instagram');
      else if (json.data.platform === 'Facebook') setSelectedPlatform('facebook');

      // Scroll smoothly to result
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: MediaFormatOption) => {
    if (!metadata || isDownloading) return;

    setIsDownloading(true);
    setActiveFormatId(format.formatId);
    setError(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: metadata.url,
          formatId: format.formatId,
          formatType: format.type,
          title: metadata.title
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to initiate download job.');
      }

      const initialJob: DownloadJobState = {
        id: json.jobId,
        status: json.status,
        progress: json.progress,
        message: json.message,
        safeFilename: json.safeFilename,
        targetExt: format.ext
      };

      setActiveJob(initialJob);

      // Start polling job status
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/download/status/${initialJob.id}`);
          if (!pollRes.ok) return;
          const pollData = await pollRes.json();
          if (pollData.success && pollData.job) {
            setActiveJob(pollData.job);

            if (pollData.job.status === 'ready') {
              if (pollIntervalRef.current) {
                window.clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              setIsDownloading(false);
              // Trigger automatic file download
              triggerFileDownload(pollData.job.id, pollData.job.safeFilename);
            } else if (pollData.job.status === 'error' || pollData.job.status === 'expired') {
              if (pollIntervalRef.current) {
                window.clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              setIsDownloading(false);
            }
          }
        } catch (pollErr) {
          console.error('Job polling error:', pollErr);
        }
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Failed to start download.');
      setIsDownloading(false);
      setActiveFormatId(null);
    }
  };

  const triggerFileDownload = (jobId: string, filename: string) => {
    const downloadUrl = `/api/download/file/${jobId}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA] text-gray-900 font-sans selection:bg-brand-500/20">
      
      {/* Header */}
      <Header
        onPlatformSelect={(plat) => {
          setSelectedPlatform(plat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div id="hero">
          <Hero activePlatform={selectedPlatform} />
        </div>

        {/* URL Input Form */}
        <UrlInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          error={error}
          onClearError={() => setError(null)}
        />

        {/* Loading State Skeleton */}
        {isLoading && <LoadingSkeleton />}

        {/* Result Card */}
        {metadata && !isLoading && (
          <ResultCard
            metadata={metadata}
            onDownload={handleDownload}
            isDownloading={isDownloading}
            activeFormatId={activeFormatId}
          />
        )}

        {/* Supported Platforms Grid */}
        <SupportedPlatforms onSelectPlatform={setSelectedPlatform} />

        {/* 5-Step Download Guide */}
        <HowToUse />

        {/* Features & Benefits */}
        <Features />

        {/* FAQ Accordion */}
        <FaqSection />
      </main>

      {/* Footer with Harsh Kumar attribution */}
      <Footer
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Interactive Modals */}
      <DownloadModal
        job={activeJob}
        onClose={() => {
          setActiveJob(null);
          setIsDownloading(false);
          setActiveFormatId(null);
          if (pollIntervalRef.current) {
            window.clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }}
        onSaveFile={(jobId, filename) => triggerFileDownload(jobId, filename)}
      />

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

    </div>
  );
};
export default App;
