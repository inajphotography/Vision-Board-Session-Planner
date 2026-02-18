# Vision Board Session Planner

An interactive micro-app for Ina J Photography that guides dog parents through creating a personalized vision board for their ideal photography session.

## Project Structure

```
├── api/
│   └── vision-board/
│       └── submit.js      # Vercel serverless function (PDF, email, Brevo)
├── src/
│   ├── components/        # UI components (7 steps + annotation modal)
│   ├── data/              # Gallery image data (20 photos)
│   ├── store/             # Zustand state management
│   ├── App.jsx            # Main app with step navigation
│   └── index.css          # Tailwind CSS + custom styles
├── vercel.json            # Vercel deployment config
├── index.html             # Entry HTML
└── vite.config.js         # Vite + Tailwind config
```

## Deploy to Vercel (Step-by-Step)

### Step 1: Push this repo to GitHub

Make sure this repository is on GitHub (it already is if you're reading this there).

### Step 2: Go to Vercel

1. Go to **vercel.com** and log in (or sign up)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Find and select **Vision-Board-Session-Planner**
5. Vercel will auto-detect it as a Vite project — leave all settings as-is
6. Click **"Deploy"**

Your app will be live in about 60 seconds! The vision board will work immediately — users can select images, write annotations, and view their vision board.

### Step 3: Add API Keys (for email + CRM to work)

The app works without these, but emails won't send and contacts won't be saved until you add them.

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add these variables:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `SENDGRID_API_KEY` | `SG.xxxxx...` | sendgrid.com → Settings → API Keys |
| `BREVO_API_KEY` | `xkeysib-xxxxx...` | brevo.com → SMTP & API → API Keys |
| `BUSINESS_EMAIL` | `ina@inajphotography.com` | Your notification email |
| `FROM_EMAIL` | `noreply@inajphotography.com` | Must be verified in SendGrid |

3. After adding the variables, click **"Redeploy"** from the Deployments tab

### Step 4: Set up SendGrid (for emails)

1. Go to **sendgrid.com** and create a free account
2. Go to **Settings → Sender Authentication** and verify your domain (inajphotography.com)
3. Go to **Settings → API Keys** and create a key with "Mail Send" permission
4. Copy the key and paste it as `SENDGRID_API_KEY` in Vercel (Step 3)

### Step 5: Set up Brevo (for contact list)

1. Go to **brevo.com** and create a free account
2. Go to **SMTP & API → API Keys** and copy your API key
3. Paste it as `BREVO_API_KEY` in Vercel (Step 3)
4. In Brevo, create a contact list called "Vision Board Submissions"

### Step 6: Custom Domain (optional)

1. In Vercel, go to **Settings → Domains**
2. Add your domain (e.g., `visionboard.inajphotography.com`)
3. Follow Vercel's instructions to update your DNS records

## Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## User Journey

1. **Welcome** — Emotionally warm entry point
2. **Gallery** — Browse and select 4-8 photos by mood, setting, and style
3. **Annotation** — Add personal notes to each selected image
4. **Intentions** — Define emotional goals for the session
5. **Email Capture** — Collect contact info before showing vision board
6. **Vision Board** — Display personalized vision board with session brief
7. **Thank You** — Confirmation with next steps and booking CTAs
