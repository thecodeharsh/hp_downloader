import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const productionCorsOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
  ? process.env.CORS_ORIGIN
  : 'https://hp-downloader.vercel.app';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.NODE_ENV === 'production'
    ? productionCorsOrigin
    : (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000'),
  pythonPath: process.env.PYTHON_PATH || 'python',
  tempDir: process.env.TEMP_DIR || path.join(os.tmpdir(), 'hp-downloader-temp'),
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '250', 10),
  analyzeTimeoutMs: parseInt(process.env.ANALYZE_TIMEOUT_MS || '35000', 10),
  downloadTimeoutMs: parseInt(process.env.DOWNLOAD_TIMEOUT_MS || '180000', 10),
  jobTtlMinutes: parseInt(process.env.JOB_TTL_MINUTES || '15', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '2', 10),
  supportEmail: 'kum.harshofficial@gmail.com',
  appName: 'HP Downloader',
  creator: 'Harsh Kumar'
};
