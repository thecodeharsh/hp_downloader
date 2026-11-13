# HP Downloader — Multi-stage Production Dockerfile
# Created by Harsh Kumar <kum.harshofficial@gmail.com>

FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Final Production Runner
FROM python:3.11-alpine

# Install Node.js, npm, ffmpeg, and curl
RUN apk add --no-cache nodejs npm ffmpeg curl ca-certificates bash

# Install yt-dlp via pip
RUN pip install --no-cache-dir yt-dlp

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user and temp dir
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /tmp/hp-downloader-temp && \
    chown -R appuser:appgroup /app /tmp/hp-downloader-temp

USER appuser

ENV PORT=5000 \
    HOST=0.0.0.0 \
    NODE_ENV=production \
    PYTHON_PATH=python \
    TEMP_DIR=/tmp/hp-downloader-temp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "backend/dist/server.js"]
