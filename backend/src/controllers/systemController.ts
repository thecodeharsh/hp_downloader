import { Request, Response } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { config } from '../config/index.js';

const execFileAsync = promisify(execFile);

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  let ytDlpVersion = 'unknown';
  let ffmpegVersion = 'unknown';
  let tempDirWritable = false;

  try {
    const { stdout } = await execFileAsync(config.pythonPath, ['-m', 'yt_dlp', '--version'], { timeout: 5000 });
    ytDlpVersion = stdout.trim();
  } catch (err: any) {
    ytDlpVersion = `Unavailable (${err.message || 'error'})`;
  }

  try {
    const { stdout } = await execFileAsync('ffmpeg', ['-version'], { timeout: 5000 });
    ffmpegVersion = stdout.split('\n')[0]?.trim() || 'Installed';
  } catch (err: any) {
    ffmpegVersion = `Unavailable (${err.message || 'error'})`;
  }

  try {
    const testFile = path.join(config.tempDir, `.health-check-${Date.now()}`);
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    tempDirWritable = true;
  } catch {
    tempDirWritable = false;
  }

  const isHealthy = !ytDlpVersion.startsWith('Unavailable') && tempDirWritable;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: config.appName,
    creator: config.creator,
    supportEmail: config.supportEmail,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    system: {
      ytDlpVersion,
      ffmpegVersion,
      tempDirWritable,
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024))
    }
  });
}

export async function contactHandler(req: Request, res: Response): Promise<void> {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid input data'
    });
    return;
  }

  const { name, email, subject, message } = parsed.data;

  // Log incoming inquiry safely (no sensitive tokens)
  console.log(`[Contact Submission] From: ${name} <${email}> | Subject: "${subject}" | Length: ${message.length}`);

  res.status(200).json({
    success: true,
    message: `Thank you for reaching out, ${name}! Your inquiry has been received. Our team will contact you at ${email} shortly. You may also email directly to ${config.supportEmail}.`
  });
}
