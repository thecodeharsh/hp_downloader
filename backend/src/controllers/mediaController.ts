import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import { analyzeMedia, initiateDownloadJob } from '../services/extractor.js';
import { jobManager } from '../services/jobManager.js';

const analyzeSchema = z.object({
  url: z.string().min(1, 'Media URL is required').url('Must be a valid URL')
});

const downloadSchema = z.object({
  url: z.string().min(1, 'Media URL is required').url('Must be a valid URL'),
  formatId: z.string().min(1, 'Format ID is required'),
  formatType: z.enum(['video', 'audio']).default('video'),
  title: z.string().optional()
});

export async function analyzeHandler(req: Request, res: Response): Promise<void> {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid request body'
      });
      return;
    }

    const metadata = await analyzeMedia(parsed.data.url);
    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (err: any) {
    const status = err?.status || 500;
    const message = err?.message || 'Failed to analyze URL';
    res.status(status).json({
      success: false,
      error: message
    });
  }
}

export async function downloadHandler(req: Request, res: Response): Promise<void> {
  try {
    const parsed = downloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid request parameters'
      });
      return;
    }

    const job = await initiateDownloadJob(parsed.data);
    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message || 'Download job initiated',
      safeFilename: job.safeFilename
    });
  } catch (err: any) {
    const status = err?.status || 500;
    const message = err?.message || 'Failed to initiate download';
    res.status(status).json({
      success: false,
      error: message
    });
  }
}

export async function jobStatusHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, error: 'Job ID is required' });
    return;
  }

  const job = jobManager.getJob(id);
  if (!job) {
    res.status(404).json({
      success: false,
      error: 'Job not found or has expired. Please try again.'
    });
    return;
  }

  if (job.status === 'ready') {
    try {
      const stats = job.filePath ? fs.statSync(job.filePath) : null;
      if (!stats?.isFile() || stats.size <= 0) {
        jobManager.updateJob(id, { status: 'error', message: 'The completed download file is missing or empty. Please start the download again.' });
      }
    } catch {
      jobManager.updateJob(id, { status: 'error', message: 'The completed download file is no longer available. Please start the download again.' });
    }
  }

  const currentJob = jobManager.getJob(id);
  if (!currentJob) {
    res.status(404).json({ success: false, error: 'Job not found or has expired. Please try again.' });
    return;
  }

  res.status(200).json({
    success: true,
    job: {
      id: currentJob.id,
      status: currentJob.status,
      progress: currentJob.progress,
      message: currentJob.message,
      fileSize: currentJob.fileSize,
      safeFilename: currentJob.safeFilename,
      targetExt: currentJob.targetExt,
      createdAt: currentJob.createdAt,
      expiresAt: currentJob.expiresAt
    }
  });
}

export async function streamFileHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, error: 'Job ID is required' });
    return;
  }

  const job = jobManager.getJob(id);
  if (!job || job.status !== 'ready' || !job.filePath) {
    res.status(404).json({
      success: false,
      error: 'Download file is not ready or has expired.'
    });
    return;
  }

  let fileStats: fs.Stats;
  try {
    fileStats = fs.statSync(job.filePath);
  } catch {
    res.status(404).json({
      success: false,
      error: 'File no longer exists on server.'
    });
    return;
  }
  if (!fileStats.isFile() || fileStats.size <= 0) {
    jobManager.updateJob(id, { status: 'error', message: 'The completed download file is missing or empty. Please start the download again.' });
    res.status(404).json({ success: false, error: 'The completed download file is missing or empty. Please start again.' });
    return;
  }

  const filename = encodeURIComponent(job.safeFilename).replace(/['()]/g, escape);

  res.setHeader('Content-Type', job.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${job.safeFilename}"; filename*=UTF-8''${filename}`);
  res.setHeader('Content-Length', fileStats.size.toString());
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  (job as typeof job & { streaming?: number }).streaming = ((job as typeof job & { streaming?: number }).streaming || 0) + 1;
  const readStream = fs.createReadStream(job.filePath);
  readStream.pipe(res);

  const finishStream = () => {
    const streamJob = job as typeof job & { streaming?: number };
    streamJob.streaming = Math.max(0, (streamJob.streaming || 1) - 1);
  };
  readStream.on('close', finishStream);

  readStream.on('error', (err) => {
    console.error('File stream error:', (err as NodeJS.ErrnoException).code || 'unknown filesystem error');
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'The download file could not be streamed. Please retry the download.' });
    } else {
      res.destroy(err);
    }
  });

  res.on('finish', () => {
    // Schedule cleanup of downloaded file after 3 minutes so user can re-click if download was interrupted
    const cleanupTimer = setTimeout(() => {
      jobManager.removeJob(job.id);
    }, 3 * 60 * 1000);
    cleanupTimer.unref();
  });
}
