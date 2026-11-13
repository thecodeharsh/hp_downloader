import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;
  // 10.0.0.0/8 (Private network)
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (Private network)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16 (Private network)
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link-local & Cloud metadata: 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 0.0.0.0/8 (Broadcast/Local)
  if (parts[0] === 0) return true;
  // 224.0.0.0/4 (Multicast)
  if (parts[0] >= 224 && parts[0] <= 239) return true;
  // 240.0.0.0/4 (Reserved)
  if (parts[0] >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or reserved.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
  // Unique local fc00::/7 (fc00... or fd00...)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // Link local fe80::/10
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // IPv4 mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const ipv4 = normalized.replace('::ffff:', '');
    if (net.isIPv4(ipv4)) return isPrivateIPv4(ipv4);
  }
  return false;
}

export interface SSRFValidationResult {
  valid: boolean;
  reason?: string;
  normalizedUrl?: string;
  hostname?: string;
  platform?: 'youtube' | 'instagram' | 'facebook' | 'generic';
}

/**
 * Validates a URL against SSRF vulnerabilities and resolves its domain to ensure
 * it does not point to internal or private infrastructure.
 */
export async function validateMediaUrl(rawUrl: string): Promise<SSRFValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'URL must be a non-empty string' };
  }

  const trimmed = rawUrl.trim();
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // Only permit HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTP and HTTPS protocols are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard loopback hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return { valid: false, reason: 'Internal and loopback hosts are forbidden' };
  }

  // Check if hostname is an explicit IP address
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { valid: false, reason: 'Private network IP addresses are forbidden' };
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      return { valid: false, reason: 'Private network IPv6 addresses are forbidden' };
    }
  } else {
    // Perform DNS lookup to inspect the resolved IP address
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        return { valid: false, reason: 'Hostname could not be resolved' };
      }

      for (const record of records) {
        if (record.family === 4 && isPrivateIPv4(record.address)) {
          return { valid: false, reason: 'Hostname resolves to a private or restricted IP address' };
        }
        if (record.family === 6 && isPrivateIPv6(record.address)) {
          return { valid: false, reason: 'Hostname resolves to a private or restricted IPv6 address' };
        }
      }
    } catch {
      return { valid: false, reason: 'Failed to resolve hostname via DNS' };
    }
  }

  // Identify platform adapter
  let platform: 'youtube' | 'instagram' | 'facebook' | 'generic' = 'generic';

  if (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be'
  ) {
    platform = 'youtube';
  } else if (
    hostname === 'instagram.com' ||
    hostname.endsWith('.instagram.com') ||
    hostname === 'instagr.am'
  ) {
    platform = 'instagram';
  } else if (
    hostname === 'facebook.com' ||
    hostname.endsWith('.facebook.com') ||
    hostname === 'fb.watch' ||
    hostname === 'fb.com'
  ) {
    platform = 'facebook';
  }

  return {
    valid: true,
    normalizedUrl: parsed.href,
    hostname,
    platform
  };
}
