# Security setup: Vision Board Session Planner

This app collects a name + email and triggers Brevo emails, so the priority is
stopping bots and abuse, not data theft (there's no database to expose).

## What the code already does

- **API keys are server-side only.** `BREVO_API_KEY` and `ANTHROPIC_API_KEY` are
  read only inside `api/vision-board/submit.js`. Nothing reaches the browser.
- **Origin allowlist + per-IP rate limit** on the submit endpoint (`lib/security.js`).
- **Input validation + bounds** (max selections, max text length) to prevent
  oversized-payload abuse.
- **SSRF protection:** the server only downloads images from an allowlist of
  CDN hosts, never arbitrary URLs from the request.
- **HTML escaping** of all user input in the emails (including the one sent to you).
- **Security headers** (CSP, HSTS, etc.) via `vercel.json`.
- **Cloudflare Turnstile** bot check, wired but inactive until you set the keys below.

## You need to do (dashboard steps, I can't do these)

### 1. Rotate the Brevo key + mark secrets "Sensitive"
- In **Brevo → SMTP & API → API Keys**, regenerate `BREVO_API_KEY`.
- In **Vercel → Project → Settings → Environment Variables**, update the value and
  toggle **Sensitive** on for `BREVO_API_KEY` and `ANTHROPIC_API_KEY` so the values
  can't be read back from the dashboard. (This clears the "Needs Attention" flag.)

### 2. Turn on Cloudflare Turnstile (free, ~10 min)
1. Create a free Turnstile widget at https://dash.cloudflare.com → Turnstile.
   Add your domain. You'll get a **Site Key** and a **Secret Key**.
2. In Vercel env vars add:
   - `VITE_TURNSTILE_SITE_KEY` = your site key (this one is public, that's fine)
   - `TURNSTILE_SECRET_KEY` = your secret key (mark **Sensitive**)
3. Redeploy. The widget appears on the form and the server enforces it.
   Until both keys are set, the app works exactly as before with the check skipped.

### 3. Add a Vercel Firewall rate-limit rule (the hard ceiling)
- **Vercel → Project → Firewall → Configure → Add Rule.**
- Match path `/api/*`, action **Rate Limit**, e.g. 20 requests/min per IP.
- This is the bulletproof layer; the in-code limiter is best-effort backup.

### 4. (Optional) Set `ALLOWED_ORIGINS`
Defaults to `https://www.inajphotography.com,https://inajphotography.com` plus any
`*.vercel.app` preview. Override via the `ALLOWED_ORIGINS` env var (comma-separated)
if you serve the app from another domain.

## Before promoting to production
Deploy to a **Vercel preview** first and run one real submission end-to-end. The
Content-Security-Policy is matched to the app's current sources (Google Fonts, Meta
Pixel, Turnstile, the image CDNs). If you add a new third-party script later, update
the CSP in `vercel.json` or it will be blocked.
