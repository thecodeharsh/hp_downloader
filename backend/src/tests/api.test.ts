import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../app.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { jobManager } from '../services/jobManager.js';
import { config } from '../config/index.js';

let server: http.Server;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test('GET /api/health returns system status and branding', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json() as any;
  assert.equal(data.service, 'HP Downloader');
  assert.equal(data.creator, 'Harsh Kumar');
  assert.equal(data.supportEmail, 'kum.harshofficial@gmail.com');
  assert.equal(typeof data.uptime, 'number');
  assert.equal(typeof data.system.ytDlpVersion, 'string');
});

test('POST /api/analyze rejects missing or invalid URL', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'not-a-valid-url' })
  });
  assert.equal(res.status, 400);
  const data = await res.json() as any;
  assert.equal(data.success, false);
});

test('POST /api/analyze blocks localhost SSRF attack', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://localhost:5000/secret' })
  });
  assert.equal(res.status, 400);
  const data = await res.json() as any;
  assert.equal(data.success, false);
});

test('POST /api/contact validates and accepts inquiry', async () => {
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Question regarding downloader',
      message: 'Hello, this is a test inquiry about HP Downloader.'
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json() as any;
  assert.equal(data.success, true);
});

test('GET /api/download/file streams a verified fixture with download headers', async () => {
  const job = jobManager.createJob({
    url: 'https://www.youtube.com/watch?v=test-fixture',
    formatId: 'best',
    formatType: 'video',
    targetExt: 'mp4',
    title: 'fixture',
    safeFilename: 'fixture.mp4'
  });
  const filePath = path.join(config.tempDir, `${job.id}.mp4`);
  const contents = Buffer.from('authorized test fixture');
  fs.writeFileSync(filePath, contents);
  jobManager.updateJob(job.id, {
    status: 'ready',
    filePath,
    fileSize: contents.length,
    mimeType: 'video/mp4'
  });

  try {
    const res = await fetch(`${baseUrl}/api/download/file/${job.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'video/mp4');
    assert.match(res.headers.get('content-disposition') || '', /attachment; filename="fixture.mp4"/);
    assert.deepEqual(Buffer.from(await res.arrayBuffer()), contents);
  } finally {
    jobManager.removeJob(job.id);
  }
});

test('GET /api/download/status returns 404 for an expired or unknown job', async () => {
  const res = await fetch(`${baseUrl}/api/download/status/not-a-real-job`);
  assert.equal(res.status, 404);
  const data = await res.json() as any;
  assert.equal(data.success, false);
});

test('GET /api/download/status fails a ready job when its output file is missing', async () => {
  const job = jobManager.createJob({
    url: 'https://www.youtube.com/watch?v=missing-fixture',
    formatId: 'best',
    formatType: 'video',
    targetExt: 'mp4',
    title: 'missing',
    safeFilename: 'missing.mp4'
  });
  jobManager.updateJob(job.id, { status: 'ready', filePath: path.join(config.tempDir, 'missing-output-not-on-disk.mp4') });
  try {
    const res = await fetch(`${baseUrl}/api/download/status/${job.id}`);
    const data = await res.json() as any;
    assert.equal(res.status, 200);
    assert.equal(data.job.status, 'error');
    assert.match(data.job.message, /file is no longer available/i);
  } finally {
    jobManager.removeJob(job.id);
  }
});
