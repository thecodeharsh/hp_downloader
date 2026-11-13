import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMediaUrl } from '../utils/ssrf.js';
import { sanitizeFilename, formatBytes, formatDuration, mapExtractionError } from '../utils/sanitize.js';

test('SSRF Protection - Blocks loopback, private IPs, and AWS metadata', async () => {
  const dangerousUrls = [
    'http://localhost:8080/secret',
    'http://127.0.0.1:3000/admin',
    'http://[::1]/internal',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.1/network',
    'http://192.168.1.1/router',
    'http://172.16.0.5/api',
    'ftp://example.com/file.mp4',
    'file:///etc/passwd',
    'javascript:alert(1)'
  ];

  for (const url of dangerousUrls) {
    const res = await validateMediaUrl(url);
    assert.equal(res.valid, false, `Expected ${url} to be blocked by SSRF filter`);
  }
});

test('SSRF Protection - Permits legitimate public URLs and identifies platform', async () => {
  const validYouTube = await validateMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(validYouTube.valid, true);
  assert.equal(validYouTube.platform, 'youtube');

  const validShort = await validateMediaUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(validShort.valid, true);
  assert.equal(validShort.platform, 'youtube');

  const validInsta = await validateMediaUrl('https://www.instagram.com/reel/C3b1234567/');
  assert.equal(validInsta.valid, true);
  assert.equal(validInsta.platform, 'instagram');

  const validFb = await validateMediaUrl('https://www.facebook.com/watch/?v=123456789');
  assert.equal(validFb.valid, true);
  assert.equal(validFb.platform, 'facebook');
});

test('Filename Sanitization - Removes unsafe characters, path traversal and truncates length', () => {
  assert.equal(sanitizeFilename('../../etc/passwd'), 'etc_passwd');
  assert.equal(sanitizeFilename('Video: "Amazing" & <Great> *Test*?'), 'Video_ _Amazing_ & _Great_ _Test');
  assert.equal(sanitizeFilename('   Normal Title   '), 'Normal Title');
  assert.equal(sanitizeFilename(''), 'media');
});

test('Formatting Helpers - Bytes and Duration', () => {
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(15 * 1024 * 1024), '15.0 MB');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3665), '1:01:05');
});

test('Extraction errors explain YouTube hosted anti-bot blocks without claiming they are fixed', () => {
  const result = mapExtractionError("ERROR: [youtube] Sign in to confirm you're not a bot.");
  assert.equal(result.status, 503);
  assert.match(result.message, /temporarily blocking requests from this server/i);
});
