import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

export interface DownloadJob {
  id: string;
  url: string;
  formatId: string;
  formatType: 'video' | 'audio';
  targetExt: string;
  title: string;
  safeFilename: string;
  status: 'pending' | 'downloading' | 'processing' | 'ready' | 'error' | 'expired';
  progress: number;
  message?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: number;
  expiresAt: number;
}

class JobManager {
  private jobs: Map<string, DownloadJob> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureTempDir();
    this.startCleanupTimer();
  }

  private ensureTempDir() {
    try {
      if (!fs.existsSync(config.tempDir)) {
        fs.mkdirSync(config.tempDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create temp directory:', err);
    }
  }

  public createJob(params: {
    url: string;
    formatId: string;
    formatType: 'video' | 'audio';
    targetExt: string;
    title: string;
    safeFilename: string;
  }): DownloadJob {
    const activeCount = [...this.jobs.values()].filter(job => ['pending', 'downloading', 'processing'].includes(job.status)).length;
    if (activeCount >= config.maxConcurrentDownloads) {
      throw Object.assign(new Error('The download service is busy. Please try again shortly.'), { status: 429 });
    }
    const id = uuidv4();
    const now = Date.now();
    const expiresAt = now + config.jobTtlMinutes * 60 * 1000;

    const job: DownloadJob = {
      id,
      url: params.url,
      formatId: params.formatId,
      formatType: params.formatType,
      targetExt: params.targetExt,
      title: params.title,
      safeFilename: params.safeFilename,
      status: 'pending',
      progress: 0,
      createdAt: now,
      expiresAt
    };

    this.jobs.set(id, job);
    return job;
  }

  public getJob(id: string): DownloadJob | undefined {
    const job = this.jobs.get(id);
    if (
      job &&
      Date.now() > job.expiresAt &&
      !['pending', 'downloading', 'processing'].includes(job.status) &&
      !(job as DownloadJob & { streaming?: number }).streaming
    ) {
      this.removeJob(id);
      return undefined;
    }
    return job;
  }

  public updateJob(id: string, updates: Partial<DownloadJob>): DownloadJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  public removeJob(id: string) {
    const job = this.jobs.get(id);
    if (job && (job as DownloadJob & { streaming?: number }).streaming) return;
    if (job?.filePath && fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
      } catch (err) {
        console.error(`Error deleting temp file for job ${id}:`, err);
      }
    }
    this.jobs.delete(id);
  }

  private startCleanupTimer() {
    // Run cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 2 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public cleanupExpired() {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (now > job.expiresAt) {
        if (['pending', 'downloading', 'processing'].includes(job.status)) continue;
        this.removeJob(id);
      }
    }

    // Also sweep orphaned files in temp directory older than TTL
    try {
      if (fs.existsSync(config.tempDir)) {
        const files = fs.readdirSync(config.tempDir);
        const activeJobIds = [...this.jobs.values()]
          .filter(job => ['pending', 'downloading', 'processing'].includes(job.status))
          .map(job => job.id);
        for (const file of files) {
          if (activeJobIds.some(id => file.startsWith(`${id}.`))) continue;
          const filePath = path.join(config.tempDir, file);
          const stats = fs.statSync(filePath);
          const ageMinutes = (now - stats.mtimeMs) / (1000 * 60);
          if (ageMinutes > config.jobTtlMinutes) {
            try {
              fs.unlinkSync(filePath);
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (err) {
      console.error('Error during temp sweep:', err);
    }
  }

  public destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const jobManager = new JobManager();
