import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  analyzeHandler,
  downloadHandler,
  jobStatusHandler,
  streamFileHandler
} from '../controllers/mediaController.js';
import { healthCheckHandler, contactHandler } from '../controllers/systemController.js';
import { config } from '../config/index.js';

export const apiRouter = Router();

// Strict rate limiter for video analysis (prevents scraping denial of service)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 analyze requests per min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many analysis requests. Please wait a moment before trying again.'
  }
});

// Download initiation rate limiter
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15, // max 15 downloads per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Download rate limit reached. Please wait a minute before requesting more downloads.'
  }
});

// Contact submission limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many contact messages submitted. Please email us directly at ' + config.supportEmail
  }
});

// Media endpoints
apiRouter.post('/analyze', analyzeLimiter, analyzeHandler);
apiRouter.post('/download', downloadLimiter, downloadHandler);
apiRouter.get('/download/status/:id', jobStatusHandler);
apiRouter.get('/download/file/:id', streamFileHandler);

// System endpoints
apiRouter.get('/health', healthCheckHandler);
apiRouter.post('/contact', contactLimiter, contactHandler);
