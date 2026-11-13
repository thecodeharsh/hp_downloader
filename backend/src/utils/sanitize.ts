/**
 * Utilities for filename sanitization, byte/duration formatting, and safe error parsing.
 */

/**
 * Sanitizes a title string into a safe, filesystem-compatible filename.
 */
export function sanitizeFilename(title: string, fallback: string = 'media'): string {
  if (!title || typeof title !== 'string') return fallback;

  // First strip path traversal tokens
  let cleaned = title.replace(/\.\.+[/\\]+/g, '').replace(/\.\.+/g, '');

  // Replace reserved windows & POSIX characters: < > : " / \ | ? * and control chars
  cleaned = cleaned
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip leading/trailing dots, underscores, or spaces
  cleaned = cleaned.replace(/^[\s._-]+|[\s._-]+$/g, '');

  // Truncate to maximum safe length (120 chars) to prevent filesystem issues
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 120).trim();
  }

  return cleaned.length > 0 ? cleaned : fallback;
}

/**
 * Formats bytes into human-readable strings (e.g. 14.5 MB).
 */
export function formatBytes(bytes?: number | null): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Removes query strings, credentials, cookie paths, and excessive output before logging yt-dlp diagnostics. */
export function sanitizeExtractionDiagnostics(text: string, sensitivePaths: string[] = []): string {
  let sanitized = String(text || '').slice(-6000);
  for (const filePath of sensitivePaths) {
    if (filePath) sanitized = sanitized.split(filePath).join('[cookie-file]');
  }
  return sanitized
    .replace(/(?:set-)?cookie\s*:\s*[^\r\n]+/gi, '[cookie-header-redacted]')
    .replace(/authorization\s*:\s*[^\r\n]+/gi, '[authorization-header-redacted]')
    .replace(/https?:\/\/[^\s"'<>]+/gi, value => {
      try {
        const parsed = new URL(value.replace(/[),.;]+$/, ''));
        return `${parsed.protocol}//${parsed.host}/[path-redacted]`;
      } catch {
        return '[url-redacted]';
      }
    });
}

/**
 * Maps raw backend/yt-dlp errors to clear, user-friendly explanations.
 */
export function mapExtractionError(errText: string): { status: number; message: string; details?: string } {
  const lower = errText.toLowerCase();

  if (lower.includes("confirm you're not a bot") || lower.includes('not a bot') || lower.includes('automated queries') || lower.includes('unusual traffic')) {
    return {
      status: 503,
      message: 'The platform flagged this server request as automated or requires sign-in. Try again later. HP Downloader cannot bypass platform access restrictions.'
    };
  }
  if (lower.includes('http error 429') || lower.includes('too many requests') || lower.includes('rate limit')) {
    return {
      status: 429,
      message: 'The platform is rate-limiting requests from this server. Wait before retrying; repeated retries may continue to be blocked.'
    };
  }

  if (lower.includes('private video') || lower.includes('this video is private')) {
    return {
      status: 403,
      message: 'This media is private and requires authentication. HP Downloader respects user privacy and cannot access private content.'
    };
  }
  if (lower.includes('age restricted') || lower.includes('confirm your age')) {
    return {
      status: 403,
      message: 'This content is age-restricted. HP Downloader does not access age-restricted content.'
    };
  }
  if (lower.includes('sign in') || lower.includes('authentication required')) {
    return {
      status: 403,
      message: 'The platform requires an authorized session for this media. A service administrator can configure a server-side cookie secret for content they are authorized to access; private and age-restricted content remain unsupported.'
    };
  }
  if (lower.includes('eai_again') || lower.includes('enotfound') || lower.includes('econnreset') || lower.includes('etimedout') || lower.includes('enetunreach') || lower.includes('network is unreachable') || lower.includes('temporary failure in name resolution')) {
    return {
      status: 502,
      message: 'HP Downloader could not reach the source platform. Check the link and try again later.'
    };
  }
  if (lower.includes('video unavailable') || lower.includes('not available') || lower.includes('removed')) {
    return {
      status: 404,
      message: 'The requested media is unavailable, deleted, or cannot be accessed.'
    };
  }
  if (lower.includes('drm') || lower.includes('protected') || lower.includes('encrypted')) {
    return {
      status: 403,
      message: 'This media is DRM-protected. HP Downloader does not bypass digital rights management protections.'
    };
  }
  if (lower.includes('copyright') || lower.includes('copyright claim')) {
    return {
      status: 403,
      message: 'This video is unavailable due to a copyright claim.'
    };
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      status: 504,
      message: 'The platform request timed out. Please try again or verify the link.'
    };
  }
  if (lower.includes('unsupported url') || lower.includes('no suitable extractor')) {
    return {
      status: 400,
      message: 'This URL format is not currently supported. Please verify the URL is a valid YouTube, Instagram, or Facebook link.'
    };
  }

  return {
    status: 500,
    message: 'Failed to process media from the source URL. Please ensure the link is public and accessible.'
  };
}
