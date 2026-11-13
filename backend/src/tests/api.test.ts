import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../app.js';
import http from 'http';

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
