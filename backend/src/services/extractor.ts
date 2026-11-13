import { spawn, execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { validateMediaUrl } from '../utils/ssrf.js';
import { sanitizeFilename, formatBytes, formatDuration, mapExtractionError, sanitizeExtractionDiagnostics } from '../utils/sanitize.js';
import { jobManager, DownloadJob } from './jobManager.js';

const execFileAsync = promisify(execFile);

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
  vcodec?: string;
  acodec?: string;
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

let activeAnalysisCount = 0;

/** Copies an optional Render secret file to a short-lived, owner-only temp file for yt-dlp. */
function prepareCookiesFile(): string | undefined {
  if (!config.ytDlpCookiesFile) return undefined;

  const tempPath = path.join(config.tempDir, `.yt-dlp-cookies-${uuidv4()}.txt`);
  try {
    if (!fs.statSync(config.ytDlpCookiesFile).isFile()) throw new Error('Cookie secret is not a file');
    fs.copyFileSync(config.ytDlpCookiesFile, tempPath, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(tempPath, 0o600);
    return tempPath;
  } catch {
    try { fs.unlinkSync(tempPath); } catch { /* no temp copy was created */ }
    console.error('[yt-dlp] configured cookie secret file is unavailable; extraction aborted');
    throw Object.assign(new Error('The server-side media authentication configuration is unavailable. Please contact support.'), { status: 503 });
  }
}

function removeCookiesFile(filePath?: string): void {
  if (!filePath) return;
  try { fs.unlinkSync(filePath); } catch { /* already removed or unavailable */ }
}

/**
 * Extracts and deduplicates clean format options from raw yt-dlp dump-json.
 */
function processFormats(rawFormats: any[]): MediaFormatOption[] {
  if (!Array.isArray(rawFormats) || rawFormats.length === 0) {
    return [
      {
        formatId: 'best',
        type: 'video',
        resolution: 'Best Available',
        ext: 'mp4',
        filesizeText: 'Automatic',
        qualityLabel: 'HD MP4 (Best)',
        hasAudio: true,
        hasVideo: true
      },
      {
        formatId: 'bestaudio',
        type: 'audio',
        resolution: 'Audio',
        ext: 'mp3',
        filesizeText: 'Automatic',
        qualityLabel: 'MP3 High Quality',
        hasAudio: true,
        hasVideo: false
      }
    ];
  }

  const videoOptions: MediaFormatOption[] = [];
  const audioOptions: MediaFormatOption[] = [];

  // Map known heights to friendly labels
  const seenHeights = new Set<number>();

  // Filter video formats (MP4 preferred, with height)
  const videoCandidates = rawFormats.filter(
    f => f.vcodec && f.vcodec !== 'none' && f.height && typeof f.height === 'number'
  );

  // Sort descending by resolution height
  videoCandidates.sort((a, b) => (b.height || 0) - (a.height || 0));

  for (const f of videoCandidates) {
    const h = f.height;
    // Keep prominent resolutions: 2160, 1440, 1080, 720, 480, 360, 240, 144
    if (!seenHeights.has(h)) {
      seenHeights.add(h);

      let qualityLabel = `${h}p`;
      if (h >= 2160) qualityLabel = '4K UHD (2160p)';
      else if (h >= 1440) qualityLabel = '2K QHD (1440p)';
      else if (h >= 1080) qualityLabel = '1080p Full HD';
      else if (h >= 720) qualityLabel = '720p HD';
      else if (h >= 480) qualityLabel = '480p Standard';
      else if (h >= 360) qualityLabel = '360p Medium';
      else qualityLabel = `${h}p Low`;

      const size = f.filesize || f.filesize_approx;
      const hasAudio = f.acodec && f.acodec !== 'none';

      videoOptions.push({
        formatId: f.format_id,
        type: 'video',
        resolution: `${h}p`,
        ext: 'mp4',
        filesizeText: formatBytes(size),
        filesizeBytes: size,
        qualityLabel,
        hasAudio: !!hasAudio,
        hasVideo: true,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec
      });
    }
  }

  // Audio formats (MP3 / Audio extract)
  audioOptions.push(
    {
      formatId: 'audio-high',
      type: 'audio',
      resolution: 'Audio',
      ext: 'mp3',
      filesizeText: 'Best (~320 kbps)',
      qualityLabel: 'MP3 High Quality (320 kbps)',
      hasAudio: true,
      hasVideo: false
    },
    {
      formatId: 'audio-med',
      type: 'audio',
      resolution: 'Audio',
      ext: 'mp3',
      filesizeText: 'Standard (~192 kbps)',
      qualityLabel: 'MP3 Medium Quality (192 kbps)',
      hasAudio: true,
      hasVideo: false
    },
    {
      formatId: 'audio-low',
      type: 'audio',
      resolution: 'Audio',
      ext: 'mp3',
      filesizeText: 'Compact (~128 kbps)',
      qualityLabel: 'MP3 Standard (128 kbps)',
      hasAudio: true,
      hasVideo: false
    }
  );

  // If no video formats were extracted, add best video fallback
  if (videoOptions.length === 0) {
    videoOptions.push({
      formatId: 'bestvideo+bestaudio/best',
      type: 'video',
      resolution: 'Best Quality',
      ext: 'mp4',
      filesizeText: 'Automatic',
      qualityLabel: 'Best Video MP4',
      hasAudio: true,
      hasVideo: true
    });
  }

  return [...videoOptions, ...audioOptions];
}

/**
 * Executes yt-dlp to inspect and extract video metadata without downloading.
 */
export async function analyzeMedia(rawUrl: string): Promise<MediaMetadata> {
  const validation = await validateMediaUrl(rawUrl);
  if (!validation.valid || !validation.normalizedUrl) {
    throw { status: 400, message: validation.reason || 'Invalid media URL' };
  }
  if (validation.platform === 'generic') {
    throw { status: 400, message: 'This site is not supported. Please use a YouTube, Instagram, or Facebook link.' };
  }
  if (activeAnalysisCount >= config.maxConcurrentDownloads) {
    throw { status: 429, message: 'The media service is busy. Please try again shortly.' };
  }
  activeAnalysisCount++;

  const url = validation.normalizedUrl;

  const args = [
    '-m',
    'yt_dlp',
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    '--socket-timeout',
    '15',
    url
  ];
  let cookiesFile: string | undefined;

  try {
    cookiesFile = prepareCookiesFile();
    if (cookiesFile) args.splice(args.length - 1, 0, '--cookies', cookiesFile);
    const { stdout } = await execFileAsync(config.pythonPath, args, {
      timeout: config.analyzeTimeoutMs,
      maxBuffer: 20 * 1024 * 1024 // 20 MB buffer for detailed format json
    });

    const info = JSON.parse(stdout.trim());

    let platformName: 'YouTube' | 'Instagram' | 'Facebook' | 'Generic' = 'Generic';
    if (validation.platform === 'youtube') platformName = 'YouTube';
    else if (validation.platform === 'instagram') platformName = 'Instagram';
    else if (validation.platform === 'facebook') platformName = 'Facebook';

    // Pick best thumbnail
    let thumbnail = info.thumbnail;
    if (Array.isArray(info.thumbnails) && info.thumbnails.length > 0) {
      // Pick highest resolution or last
      const bestThumb = info.thumbnails[info.thumbnails.length - 1];
      thumbnail = bestThumb.url || thumbnail;
    }

    const formats = processFormats(info.formats || []);

    return {
      id: info.id || 'media',
      url,
      title: info.title || 'Untitled Media',
      description: info.description ? info.description.substring(0, 300) : undefined,
      thumbnail,
      duration: info.duration || 0,
      durationFormatted: formatDuration(info.duration),
      uploader: info.uploader || info.channel || info.creator,
      platform: platformName,
      viewCount: info.view_count,
      formats
    };
  } catch (err: any) {
    const stderr = err?.stderr || err?.message || String(err);
    const mapped = err?.status
      ? { status: err.status, message: err.message }
      : (err?.killed || err?.code === 'ETIMEDOUT'
          ? { status: 504, message: 'The platform request timed out. Please try again or verify the link.' }
          : mapExtractionError(stderr));
    console.error(`[yt-dlp analyze] status=${mapped.status} code=${err?.code || 'n/a'} killed=${Boolean(err?.killed)} ${sanitizeExtractionDiagnostics(stderr, [cookiesFile || ''])}`);
    if (err?.status) throw err;
    throw mapped;
  } finally {
    removeCookiesFile(cookiesFile);
    activeAnalysisCount--;
  }
}

/**
 * Initiates an asynchronous download job and tracks real-time progress.
 */
export async function initiateDownloadJob(params: {
  url: string;
  formatId: string;
  formatType: 'video' | 'audio';
  title?: string;
}): Promise<DownloadJob> {
  if (params.formatType === 'audio' && !/^audio-(high|med|low)$/.test(params.formatId)) {
    throw Object.assign(new Error('Invalid audio format selection.'), { status: 400 });
  }
  if (params.formatType === 'video' && !/^(best|bestvideo\+bestaudio\/best|[\w.-]{1,30})$/.test(params.formatId)) {
    throw Object.assign(new Error('Invalid video format selection.'), { status: 400 });
  }
  const validation = await validateMediaUrl(params.url);
  if (!validation.valid || !validation.normalizedUrl) {
    throw { status: 400, message: validation.reason || 'Invalid media URL' };
  }
  if (validation.platform === 'generic') {
    throw Object.assign(new Error('This site is not supported. Please use a YouTube, Instagram, or Facebook link.'), { status: 400 });
  }

  const url = validation.normalizedUrl;
  const isAudio = params.formatType === 'audio';
  const targetExt = isAudio ? 'mp3' : 'mp4';
  const baseTitle = params.title || 'HP_Downloader_Media';
  const safeTitle = sanitizeFilename(baseTitle);

  const job = jobManager.createJob({
    url,
    formatId: params.formatId,
    formatType: params.formatType,
    targetExt,
    title: baseTitle,
    safeFilename: `${safeTitle}.${targetExt}`
  });

  let cookiesFile: string | undefined;
  try {
    cookiesFile = prepareCookiesFile();
  } catch (err) {
    jobManager.removeJob(job.id);
    throw err;
  }

  const outputPattern = path.join(config.tempDir, `${job.id}.%(ext)s`);

  // Build safe yt-dlp arguments array
  const args = [
    '-u', // Unbuffered binary stdout and stderr
    '-m',
    'yt_dlp',
    '--no-playlist',
    '--no-warnings',
    '--socket-timeout',
    '20',
    '--newline' // For progress percentage parsing
  ];
  args.push('--max-filesize', `${config.maxFileSizeMB}M`);

  if (isAudio) {
    // Extract audio and convert to MP3
    args.push('-x', '--audio-format', 'mp3');
    if (params.formatId === 'audio-high') {
      args.push('--audio-quality', '0'); // Best 320k
    } else if (params.formatId === 'audio-med') {
      args.push('--audio-quality', '2'); // ~192k
    } else {
      args.push('--audio-quality', '5'); // ~128k
    }
  } else {
    // Video: Download specified format and merge with best audio into MP4 container
    if (params.formatId && params.formatId !== 'best') {
      args.push('-f', `${params.formatId}+bestaudio/best`, '--merge-output-format', 'mp4');
    } else {
      args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '--merge-output-format', 'mp4');
    }
  }

  args.push('-o', outputPattern, url);
  if (cookiesFile) args.splice(args.length - 1, 0, '--cookies', cookiesFile);

  jobManager.updateJob(job.id, {
    status: 'downloading',
    progress: 5,
    message: 'Starting secure media stream...'
  });

  // Spawn background download process
  const child = spawn(config.pythonPath, args, {
    shell: false,
    timeout: config.downloadTimeoutMs
  });

  let capturedStdout = '';
  let capturedStderr = '';
  let spawnFailed = false;
  const captureTail = (existing: string, chunk: string) => (existing + chunk).slice(-12000);

  child.stdout.on('data', data => {
    const text = data.toString();
    capturedStdout = captureTail(capturedStdout, text);
    // Parse progress e.g. [download]  45.2% of 12.34MiB at 3.45MiB/s
    const match = text.match(/\[download\]\s+([\d.]+)%/);
    if (match && match[1]) {
      const pct = parseFloat(match[1]);
      if (!isNaN(pct)) {
        jobManager.updateJob(job.id, {
          status: 'downloading',
          progress: Math.min(95, Math.max(5, Math.round(pct))),
          message: `Downloading: ${Math.round(pct)}%`
        });
      }
    } else if (text.includes('[ExtractAudio]') || text.includes('[Merger]')) {
      jobManager.updateJob(job.id, {
        status: 'processing',
        progress: 96,
        message: 'Optimizing and merging audio/video streams...'
      });
    }
  });

  child.stderr.on('data', data => {
    const text = data.toString();
    capturedStderr = captureTail(capturedStderr, text);
  });

  child.on('close', (code, signal) => {
    removeCookiesFile(cookiesFile);
    if (code === 0) {
      // Find the created file matching the job ID
      try {
        const files = fs.readdirSync(config.tempDir);
        const matchedFile = files.find(f => f.startsWith(`${job.id}.`) && !f.endsWith('.part') && !f.endsWith('.ytdl'));
        if (matchedFile) {
          const finalPath = path.join(config.tempDir, matchedFile);
          const stats = fs.statSync(finalPath);
          if (!stats.isFile() || stats.size === 0) {
            jobManager.updateJob(job.id, { status: 'error', message: 'The media platform returned an empty or invalid file. Please try again.' });
            fs.unlinkSync(finalPath);
            return;
          }
          if (stats.size > config.maxFileSizeMB * 1024 * 1024) {
            fs.unlinkSync(finalPath);
            jobManager.updateJob(job.id, { status: 'error', message: `This file exceeds the ${config.maxFileSizeMB} MB download limit.` });
            return;
          }
          jobManager.updateJob(job.id, {
            status: 'ready',
            progress: 100,
            filePath: finalPath,
            fileSize: stats.size,
            mimeType: isAudio ? 'audio/mpeg' : 'video/mp4',
            message: 'Ready for instant download!'
          });
          return;
        }
      } catch (err) {
        console.error('Error verifying completed download file:', err);
      }

      jobManager.updateJob(job.id, {
        status: 'error',
        message: 'Download process completed but output file was not found.'
      });
    } else {
      const failureText = signal ? 'download timed out' : (capturedStderr || capturedStdout);
      const mapped = mapExtractionError(failureText);
      const diagnostics = sanitizeExtractionDiagnostics(failureText, [cookiesFile || '']);
      console.error(`[yt-dlp download] status=${mapped.status} code=${code ?? 'null'} signal=${signal || 'none'} ${diagnostics}`);
      jobManager.updateJob(job.id, {
        status: 'error',
        message: spawnFailed
          ? 'The media processing service could not be started. Please try again later.'
          : mapped.message
      });
    }
  });

  child.on('error', err => {
    removeCookiesFile(cookiesFile);
    spawnFailed = true;
    console.error('yt-dlp spawn failed:', (err as NodeJS.ErrnoException).code || 'unknown process error');
    jobManager.updateJob(job.id, {
      status: 'error',
      message: 'Failed to start media extractor process.'
    });
  });

  return job;
}
