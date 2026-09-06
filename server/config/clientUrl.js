/**
 * Canonical Frontend Client URL Resolver for Ventriva
 *
 * Rules:
 * 1. Production runtime is detected if:
 *    - process.env.RENDER === 'true' (Render cloud environment)
 *    - process.env.NODE_ENV === 'production'
 *    - req.get('host') is a remote/cloud domain (e.g. ventriva.onrender.com)
 * 2. In production:
 *    - If process.env.CLIENT_URL is set and is a valid non-localhost URL (e.g. https://ventriva.vercel.app), use it.
 *    - If process.env.CLIENT_URL is missing or contains localhost/127.0.0.1, it strictly returns 'https://ventriva.vercel.app'.
 *    - PRODUCTION WILL NEVER RETURN A LOCALHOST URL.
 * 3. In local development (req is localhost/127.0.0.1 and not on Render):
 *    - Uses process.env.CLIENT_URL if set, or defaults to 'http://localhost:5173'.
 */

const PRODUCTION_CLIENT_URL = 'https://ventriva.vercel.app';
const DEVELOPMENT_CLIENT_URL = 'http://localhost:5173';

const isLocalhostHost = (host) => {
  if (!host) return false;
  const lower = host.toLowerCase();
  return lower.includes('localhost') || lower.includes('127.0.0.1') || lower.startsWith('0.0.0.0');
};

const isProductionEnvironment = (req) => {
  if (process.env.RENDER === 'true') return true;
  if (process.env.NODE_ENV === 'production') return true;
  if (req && typeof req.get === 'function') {
    const host = req.get('host') || '';
    if (host && !isLocalhostHost(host)) {
      return true;
    }
  }
  return false;
};

const getCanonicalClientUrl = (req) => {
  const isProd = isProductionEnvironment(req);

  if (isProd) {
    const rawClientUrl = (process.env.CLIENT_URL || '').trim();
    if (rawClientUrl && !isLocalhostHost(rawClientUrl)) {
      return rawClientUrl.replace(/\/+$/, '');
    }
    // Hard guarantee: Production never returns localhost
    return PRODUCTION_CLIENT_URL;
  }

  // Local development
  const rawClientUrl = (process.env.CLIENT_URL || '').trim();
  if (rawClientUrl) {
    return rawClientUrl.replace(/\/+$/, '');
  }
  return DEVELOPMENT_CLIENT_URL;
};

module.exports = {
  getCanonicalClientUrl,
  isProductionEnvironment,
  isLocalhostHost,
  PRODUCTION_CLIENT_URL,
  DEVELOPMENT_CLIENT_URL,
};
