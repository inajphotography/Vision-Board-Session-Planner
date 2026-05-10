# Vision Board Session Planner — Full Documentation

## Project Overview

An interactive lead magnet web app for **Ina J Photography** (pet/dog photography, Canberra, Australia). It guides dog parents through selecting inspiration images, defining their core desires for a session, and receiving a personalised PDF vision board via email. The vision board becomes a conversation starter for booking a complimentary consultation call.

**Live URL:** Deployed on Vercel (auto-deploys from `main` branch)
**Repository:** `inajphotography/Vision-Board-Session-Planner` on GitHub

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19.2.0 |
| Build tool | Vite | 7.3.1 |
| State management | Zustand | 5.0.11 |
| Styling | Tailwind CSS | 4.1.18 |
| HTTP client | Axios | 1.13.5 |
| PDF generation | PDFKit | 0.15.0 |
| Email & CRM | Brevo (Sendinblue) | REST API |
| Hosting | Vercel | Serverless |
| Image hosting | Google Cloud Storage | msgsndr bucket |

---

## File Structure

```
Vision-Board-Session-Planner/
├── api/
│   └── vision-board/
│       └── submit.js              # Serverless API (PDF, email, CRM)
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── steps/
│   │   │   ├── Welcome.jsx        # Step 1: Landing page
│   │   │   ├── Gallery.jsx        # Steps 2-3: Image selection + annotation
│   │   │   ├── Intentions.jsx     # Step 4: Core desires
│   │   │   ├── EmailCapture.jsx   # Step 5: Opt-in form
│   │   │   ├── VisionBoard.jsx    # Step 6: Results display
│   │   │   └── ThankYou.jsx       # Step 7: Confirmation
│   │   └── AnnotationModal.jsx    # Image note modal
│   ├── data/
│   │   └── gallery.js             # 20 curated pet photos with metadata
│   ├── store/
│   │   └── useVisionStore.js      # Zustand state management
│   ├── App.jsx                    # App shell, routing, progress bar
│   ├── index.css                  # Theme, fonts, custom styles
│   └── main.jsx                   # React entry point
├── package.json
├── vercel.json                    # Vercel deployment config
└── vite.config.js                 # Vite + Tailwind plugin config
```

---

## User Journey (7 Steps)

### Step 1 — Welcome
**Component:** `Welcome.jsx`

- Headline: *"Design your dream pet photography session in under 5 minutes."*
- Explains what they'll get: a personalised vision board PDF
- Tagline: "Free · takes about 3–5 minutes"
- Single CTA button to start

### Steps 2–3 — Gallery (Select + Annotate)
**Component:** `Gallery.jsx` + `AnnotationModal.jsx`

- Displays 20 curated pet photography images in a responsive grid (2→3→4 columns)
- Filter system: mood, setting, style (toggleable, mutually exclusive per category)
- Users select 4–8 images (coral ring around selected, count badge)
- Selected images appear in a fixed bottom tray
- Clicking a selected image opens the annotation modal
  - Prompt: "What emotion does this image evoke for you?"
  - 250-character text field per image
- Images lazy-load with skeleton placeholders
- CTA: "Continue" (enabled when 4+ images selected)

### Step 4 — Intentions (Core Desires)
**Component:** `Intentions.jsx`

Three guided prompts with example placeholders:

1. **"What part of your dog's personality do you most want to preserve?"**
   Placeholder: *"Her playful spirit and cheeky grin..."*

2. **"How do you want these photos to feel when you look back on them?"**
   Placeholder: *"Warmth, joy, a feeling of home..."*

3. **"What connection or moment matters most to capture?"**
   Placeholder: *"Our quiet morning cuddles on the couch..."*

- 100-character limit per field, character counters shown
- At least one must be filled to proceed
- Intro text: *"There are no wrong answers, just your heart."*
- CTA: "Generate My Vision Board"

### Step 5 — Email Capture
**Component:** `EmailCapture.jsx`

- Heading: *"Get Your Personalised Session Vision Board"*
- Describes what they'll receive (personalised PDF with images, session brief, desires)
- Form fields:
  - **Your Name** (required)
  - **Email Address** (required, validated)
  - **Dog's Name** (optional)
- CTA: "Send My Vision Board"
- Privacy note below form
- On submit: POSTs to `/api/vision-board/submit`, shows loading spinner
- On success: navigates to Step 6

### Step 6 — Vision Board (Results)
**Component:** `VisionBoard.jsx`

- **Header:** "Ina J Photography" branding + "Created for {Name} & {DogName}"
- **Session Brief:** Auto-generated bespoke narrative analysing their selections
  - Identifies dominant moods, settings, style balance
  - Recommends outdoor vs. studio based on selections
  - Personalised with dog's name
- **Core Desires:** Each non-empty intention displayed with its question label and a heart icon
- **Image Grid:** Selected images in landscape aspect ratio (3:2), annotations in italics below
- **Bridge Message:** *"Your vision board gives us a clear starting point. In your complimentary consultation call, we'll turn this into a real session plan..."*
- **Primary CTA:** "Book Your Complimentary Consultation Call" → `inajphotography.com/booking`
- **Secondary CTA:** "See Session Details" → `inajphotography.com/session-info`
- **Instagram:** Small text link → `instagram.com/inajphotography`

### Step 7 — Thank You
**Component:** `ThankYou.jsx`

- Celebration icon (heart in coral circle)
- *"Your Vision Board is on its way!"*
- Check inbox/spam instructions
- "What Happens Next" — 3 numbered steps:
  1. Review and share your vision board
  2. We'll review and reach out within 24 hours
  3. Book your complimentary consultation call
- Same CTAs as Step 6
- Branding footer

---

## Progress Bar

Visible on Steps 2–5 only (hidden on Welcome, VisionBoard, ThankYou).

4 labelled steps displayed to the user:
1. **Welcome** (maps to internal step 1)
2. **Select** (maps to internal steps 2–3)
3. **Intentions** (maps to internal step 4)
4. **Your Vision** (maps to internal step 5)

Coral circles with checkmarks for completed steps, connecting lines between.

---

## State Management (Zustand)

**File:** `src/store/useVisionStore.js`

```
Store shape:
├── Navigation
│   ├── currentStep (1–7)
│   ├── setStep(), nextStep(), prevStep()
│
├── Image Selection
│   ├── selections[] — array of image objects (max 8)
│   ├── activeFilters { mood, setting, style }
│   ├── toggleImage(), isSelected(), removeImage()
│   ├── setFilter(), clearFilters()
│
├── Annotations
│   ├── setAnnotation(imageId, text)
│   ├── getAnnotation(imageId)
│
├── User Info
│   ├── userName, setUserName
│   ├── userEmail, setUserEmail
│   ├── dogName, setDogName
│
├── Intentions
│   ├── intentions ['', '', ''] — 3-item array
│   ├── setIntention(index, text)
│
├── Form State
│   ├── isSubmitting, setSubmitting
│   ├── submitError, setSubmitError
│
└── Session Brief
    └── getSessionBrief() → { moods, settings, styleDesc }
```

`getSessionBrief()` analyses selections to determine:
- Top 2 moods (by frequency)
- Top 2 settings (by frequency)
- Style balance: "candid", "posed", "candid and posed", or "artistic"

---

## Backend API

**Single endpoint:** `POST /api/vision-board/submit`
**File:** `api/vision-board/submit.js` (~450 lines)
**Timeout:** 30 seconds (Vercel config)

### Request Body

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "dogName": "string (optional)",
  "selections": "array (required, min 4 items)",
  "intentions": "array (optional)"
}
```

### What Happens on Submit

1. **Validate** — checks required fields, email format, minimum 4 selections
2. **Download images** — fetches all selected images from Google Cloud Storage (parallel, 15s timeout each, graceful failure)
3. **Generate narrative** — `buildBespokeNarrative()` analyses mood/setting/style patterns
4. **Build PDF** — PDFKit generates A4 document:
   - Page 1: Branded header + 2-column image grid with rounded corners + annotations
   - Page 2: Session brief narrative + structured details + core desires + booking CTA
5. **Send user email** — personalised HTML email with PDF attached, bridge messaging, consultation CTA
6. **Send business email** — full submission details (contact info, images with metadata, intentions, timestamp in AEST)
7. **Create CRM contact** — adds/updates contact in Brevo with attributes

### PDF Design

- **Colours:** Coral `#CA5E3C`, Dark Green `#232817`, Ivory `#F7F4ED`, Grey `#7A7A7A`
- **Header:** Brand name, "Your Emotional Vision Board", personalised subtitle
- **Images:** 2-column landscape grid, 4px rounded corners, annotations below in italic
- **Session Brief:** Narrative paragraph + structured key-value details (mood, setting, style balance, emotional focus, planning focus)
- **Core Desires:** Question labels + heart symbol + answers
- **CTA Section:** "Ready to bring this vision to life?" with clickable booking link

### buildBespokeNarrative()

Analyses selections to generate a human-readable session brief:
- Counts mood and setting frequency across all selected images
- Determines style balance (candid vs. posed)
- Generates setting recommendation (outdoor vs. studio based on image settings)
- Personalises closing with dog name
- Returns: `{ narrative, mood, setting, styleBalance, emotionalFocus, planningFocus }`

Example output:
> *"This vision leans happy and joyful, with a mix of candid and posed moments in outdoor gardens and forest settings. A soft outdoor setting would suit this beautifully. Your session should prioritise Luna's personality and the bond you share."*

### Email Templates

**User email** (`buildUserEmailHTML`):
- Dark green header with brand name
- Personalised greeting with dog name
- Explains what the vision board is for
- Bridge message about consultation
- CTA button: "Book Your Complimentary Consultation Call"
- PDF attached

**Business email** (`buildBusinessEmailHTML`):
- Contact details (name, email, dog name)
- All selected images with filename, mood, setting, style, annotation
- Core desires with question labels
- Timestamp in Australia/Sydney timezone
- PDF attached

### CRM Contact (Brevo)

Attributes stored per contact:
- `FIRSTNAME`, `LASTNAME`
- `VISION_BOARD_SUBMITTED` (boolean)
- `SUBMISSION_DATE` (ISO timestamp)
- `MOODS` (comma-separated from selections)
- `SETTINGS` (comma-separated from selections)
- `STYLES` (comma-separated from selections)
- `DOG_NAME`

Updates existing contact if email already exists.

---

## Styling & Branding

**File:** `src/index.css`

### Colour Palette
| Name | Hex | Usage |
|------|-----|-------|
| Coral | `#CA5E3C` | Buttons, accents, links, progress indicators |
| Dark Green | `#232817` | Headings, body text |
| Ivory | `#F7F4ED` | Page background |
| Grey | `#7A7A7A` | Secondary/muted text |

### Typography
| Font | Type | Usage |
|------|------|-------|
| Playfair Display | Serif | h1, h2, h3 headings |
| Montserrat | Sans-serif | Labels, buttons, small caps |
| Lato | Sans-serif | Body text |

### Custom CSS Classes
- `.btn-coral` — coral button with hover scale + shadow, disabled state
- `.gallery-image` — hover scale (1.03) + shadow
- `.filter-tag` — border pill with dark background on hover/active
- `.modal-backdrop` — black 60% opacity + 4px blur
- `.selection-tray` — fixed bottom bar with shadow, z-index 30
- Custom scrollbar: coral thumb on ivory track
- Print styles: hides `.no-print` elements

---

## Gallery Data

**File:** `src/data/gallery.js`
**Total images:** 20 curated pet photography examples

### Image Object Structure
```javascript
{
  id: 'img_001',
  filename: 'Willow-5890.jpg',
  imageUrl: 'https://storage.googleapis.com/msgsndr/...',
  mood: 'Peaceful',
  setting: 'Outdoor Gardens',
  style: 'Outdoor Natural Candid expression'
}
```

### Metadata Values

**Moods:** Peaceful, Happy, Love, Connection, Joyful, Serious, Playful, Serene, Connected, Majestic

**Settings:** Outdoor Gardens, Outdoor Urban, Canberra Skyline Sunset, Studio canvas backdrop, Outdoor Forest, Studio Fabric Drape, Indoor, Home

**Styles:** Candid, Posed, Off Camera Flash, Close up, Action shot, Natural light, Outdoor Natural, Portrait, Sitting

All images hosted on Google Cloud Storage (`storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/`).

---

## Environment Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `BREVO_API_KEY` | Brevo API authentication | — | Yes |
| `FROM_EMAIL` | Sender email address | `noreply@inajphotography.com` | No |
| `BUSINESS_EMAIL` | Business notification recipient | `ina@inajphotography.com` | No |

Set in **Vercel → Project Settings → Environment Variables**.

If `BREVO_API_KEY` is not set, the app logs a message and skips email/CRM operations but still completes the submission.

`FROM_EMAIL` must be verified as a sender in the Brevo account.

---

## Deployment

### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Deploy Steps
1. Push code to `main` branch on GitHub
2. Vercel auto-detects Vite, builds, and deploys
3. Frontend served from `dist/`
4. API served from `api/` as serverless functions
5. Environment variables must be configured in Vercel dashboard

### Brevo Setup
1. Create free Brevo account (300 emails/day)
2. Get API key from Settings → SMTP & API → API Keys
3. Verify sender email (FROM_EMAIL) in Brevo
4. Create custom contact attributes: FIRSTNAME, LASTNAME, VISION_BOARD_SUBMITTED, SUBMISSION_DATE, MOODS, SETTINGS, STYLES, DOG_NAME

---

## External URLs & Integrations

| URL | Purpose | Used In |
|-----|---------|---------|
| `inajphotography.com/booking` | Consultation call booking | VisionBoard, ThankYou, PDF, emails |
| `inajphotography.com/session-info` | Session details page | VisionBoard, ThankYou, PDF, emails |
| `inajphotography.com` | Main website | Email footer |
| `instagram.com/inajphotography` | Instagram profile | VisionBoard, ThankYou |
| `api.brevo.com/v3/smtp/email` | Send transactional emails | API |
| `api.brevo.com/v3/contacts` | Create/update CRM contacts | API |
| `storage.googleapis.com/msgsndr/...` | Gallery image hosting | Gallery data, API |

---

## Embedding Options

The app can be embedded into the Ina J Photography website (PhotoBiz-hosted) via:

1. **iframe embed** — add `<iframe src="https://your-vercel-app.vercel.app" width="100%" height="800" frameborder="0"></iframe>` to a PhotoBiz page
2. **Custom subdomain** — point `visionboard.inajphotography.com` to the Vercel deployment via DNS CNAME record

---

## Lead Magnet Summary

**What it is:** An interactive tool that helps dog parents design their dream pet photography session by choosing inspiration images and describing their emotional goals, then delivers a personalised PDF vision board via email.

**Who it's for:** Dog parents in Canberra (and beyond) who are considering professional pet photography but haven't booked yet — they're emotionally ready but need clarity on what they actually want.

**What problem it solves:** Most pet parents know they want beautiful photos of their dog but can't articulate what kind of session they want. This tool bridges the gap between "I want photos" and "here's exactly what I'm looking for."

**The conversion path:**
1. User completes vision board (3–5 minutes)
2. Receives personalised PDF via email
3. Contact added to Brevo CRM for follow-up
4. Vision board becomes the starting point for a consultation call
5. Consultation converts to a booked session

**Free tier capacity:** 300 submissions per day (Brevo free plan limit).
