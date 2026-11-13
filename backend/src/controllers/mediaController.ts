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
        error: parsed.error.errors[0]?.message || 'Invalid request body'
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
        error: parsed.error.errors[0]?.message || 'Invalid request parameters'
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

  res.status(200).json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      fileSize: job.fileSize,
      safeFilename: job.safeFilename,
      targetExt: job.targetExt,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt
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

  if (!fs.existsSync(job.filePath)) {
    res.status(404).json({
      success: false,
      error: 'File no longer exists on server.'
    });
    return;
  }

  const filename = encodeURIComponent(job.safeFilename).replace(/['()]/g, escape);

  res.setHeader('Content-Type', job.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${job.safeFilename}"; filename*=UTF-8''${filename}`);
  if (job.fileSize) {
    res.setHeader('Content-Length', job.fileSize.toString());
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const readStream = fs.createReadStream(job.filePath);
  readStream.pipe(res);

  readStream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.headersSent) {
      res.status(500).send('Error streaming file');
    }
  });

  res.on('finish', () => {
    // Schedule cleanup of downloaded file after 3 minutes so user can re-click if download was interrupted
    setTimeout(() => {
      jobManager.removeJob(job.id);
    }, 3 * 60 * 1000);
  });
}
