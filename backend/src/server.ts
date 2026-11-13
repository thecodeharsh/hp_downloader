import { app } from './app.js';
import { config } from './config/index.js';
import { jobManager } from './services/jobManager.js';

const server = app.listen(config.port, config.host, () => {
  console.log(`=================================================`);
  console.log(`  HP Downloader Backend Service`);
  console.log(`  Creator: ${config.creator}`);
  console.log(`  Support: ${config.supportEmail}`);
  console.log(`  Server listening on http://${config.host}:${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Temp directory: ${config.tempDir}`);
  console.log(`=================================================`);
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down HP Downloader...`);
  jobManager.destroy();
  server.close(() => {
    console.log('HTTP server closed successfully. Goodbye.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
