import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Render terminates TLS and forwards one proxy hop to this service. Trust only
// that hop so express-rate-limit uses Render's client address, not arbitrary XFF.
if (config.nodeEnv === 'production') app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible media resource loading
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin ? config.corsOrigin.split(',').map(value => value.trim()).filter(Boolean) : false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

// Body parsing with safe size limit
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

// Mount API routes
app.use('/api', apiRouter);

// Serve frontend static files if built (e.g. in single-container or full-stack production)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found.'
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]', err?.message || 'Unknown error');
  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'An internal server error occurred.' : (err.message || String(err))
  });
});
