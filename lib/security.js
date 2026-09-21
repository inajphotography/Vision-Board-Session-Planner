// Security helpers for the Vision Board API.
// Kept outside /api so Vercel does not treat it as a route.

// --- HTML escaping (prevents injection into the emails we build) ---

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// --- Image URL allowlist (prevents SSRF via client-supplied imageUrl) ---
// The server downloads these to build the PDF, so they must point only at
// the CDNs our own gallery and artwork images live on.

const ALLOWED_IMAGE_HOSTS = new Set([
  'storage.googleapis.com',
  'assets.cdn.filesafe.space',
]);

export function isAllowedImageUrl(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

// --- Origin allowlist ---
// Blocks browser-based abuse from other sites. Server-to-server callers can
// spoof Origin, which is why this sits alongside rate limiting + Turnstile.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://www.inajphotography.com,https://inajphotography.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export function checkOrigin(req) {
  const origin = req.headers.origin;
  // No Origin header (e.g. same-origin non-CORS) -> allow. If present, it must match.
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes('*')) return true;
  // Allow the deployment's own origin and any configured production origins.
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vercel preview/prod deployments for this project.
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }
  return false;
}

// --- In-memory rate limiter (best effort, per warm instance) ---
// Real ceiling comes from the Vercel Firewall rule (see SECURITY.md). This adds
// cheap defence-in-depth with zero infrastructure.

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5; // submissions per IP per minute
const hits = new Map();

export function rateLimit(req) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the Map cannot grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length <= RATE_MAX;
}

// --- Cloudflare Turnstile verification ---
// If TURNSTILE_SECRET_KEY is not configured the check is skipped (the app keeps
// working), so set the key in Vercel to activate bot protection.

export async function verifyTurnstile(token, req) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[security] TURNSTILE_SECRET_KEY not set - skipping bot check');
    return true;
  }
  if (!token) return false;
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.append('remoteip', ip);
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await resp.json();
    return data.success === true;
  } catch (err) {
    console.error('[security] Turnstile verify failed:', err.message);
    return false;
  }
}

// --- Input validation + bounds (prevents DoS via oversized payloads) ---

const LIMITS = {
  name: 100,
  email: 200,
  dogName: 60,
  selectionsMin: 4,
  selectionsMax: 40,
  shortField: 120,
  filename: 200,
  annotation: 280,
  intentions: 10,
  intentionLen: 500,
  artwork: 12,
  artworkIdLen: 60,
};

const clamp = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export function validateSubmission(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request.' };
  }

  const name = clamp((body.name || '').trim(), LIMITS.name);
  const email = clamp((body.email || '').trim(), LIMITS.email);
  const dogName = clamp((body.dogName || '').trim(), LIMITS.dogName);

  if (!name || !email) {
    return { error: 'Please provide your name and email.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Invalid email address.' };
  }

  if (!Array.isArray(body.selections) || body.selections.length < LIMITS.selectionsMin) {
    return { error: `Please provide at least ${LIMITS.selectionsMin} image selections.` };
  }
  if (body.selections.length > LIMITS.selectionsMax) {
    return { error: 'Too many selections.' };
  }

  // Sanitise selections, dropping any with a disallowed image URL.
  const selections = [];
  for (const s of body.selections) {
    if (!s || typeof s !== 'object') continue;
    if (!isAllowedImageUrl(s.imageUrl)) continue;
    selections.push({
      imageUrl: String(s.imageUrl),
      filename: clamp(s.filename || '', LIMITS.filename),
      mood: clamp(s.mood || '', LIMITS.shortField),
      setting: clamp(s.setting || '', LIMITS.shortField),
      style: clamp(s.style || '', LIMITS.shortField),
      annotation: clamp(s.annotation || '', LIMITS.annotation),
    });
  }
  if (selections.length < LIMITS.selectionsMin) {
    return { error: 'Some selected images were not recognised. Please try again.' };
  }

  const intentions = (Array.isArray(body.intentions) ? body.intentions : [])
    .slice(0, LIMITS.intentions)
    .map((i) => clamp(i || '', LIMITS.intentionLen));

  const artworkPreferences = (Array.isArray(body.artworkPreferences) ? body.artworkPreferences : [])
    .slice(0, LIMITS.artwork)
    .map((id) => clamp(id || '', LIMITS.artworkIdLen));

  return {
    data: { name, email, dogName, selections, intentions, artworkPreferences },
  };
}
