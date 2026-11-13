export interface MediaFormatOption {
  formatId: string;
  type: 'video' | 'audio';
  resolution: string;
  ext: string;
  filesizeText: string;
  filesizeBytes?: number;
  qualityLabel: string;
  hasAudio: boolean;
  hasVideo: boolean;
  fps?: number;
}

export interface MediaMetadata {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  durationFormatted: string;
  uploader?: string;
  platform: 'YouTube' | 'Instagram' | 'Facebook' | 'Generic';
  viewCount?: number;
  formats: MediaFormatOption[];
}

export interface DownloadJobState {
  id: string;
  status: 'pending' | 'downloading' | 'processing' | 'ready' | 'error' | 'expired';
  progress: number;
  message?: string;
  safeFilename?: string;
  targetExt?: string;
  fileSize?: number;
}
