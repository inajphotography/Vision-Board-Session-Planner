# Vision Board Session Planner

An interactive micro-app for Ina J Photography that guides dog parents through creating a personalized vision board for their ideal photography session.

## Project Structure

```
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── data/        # Gallery image data
│   │   ├── store/       # Zustand state management
│   │   └── ...
│   └── ...
├── server/            # Express.js backend
│   ├── index.js       # API server
│   ├── pdf.js         # PDF generation (PDFKit)
│   ├── email.js       # SendGrid email integration
│   └── brevo.js       # Brevo CRM integration
└── ...
```

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your API keys
npm install
npm run dev
```

### Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for transactional emails |
| `BREVO_API_KEY` | Brevo API key for contact management |
| `BUSINESS_EMAIL` | Business notification email (default: ina@inajphotography.com) |
| `FROM_EMAIL` | Sender email address |
| `PORT` | Server port (default: 3000) |

## User Journey

1. **Welcome** - Emotionally warm entry point
2. **Gallery** - Browse & select 4-8 photos by mood/setting/style
3. **Annotation** - Add personal notes to each selected image
4. **Intentions** - Define emotional goals for the session
5. **Email Capture** - Collect contact info before showing vision board
6. **Vision Board** - Display personalized vision board
7. **Thank You** - Confirmation with next steps and booking CTAs

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand, Axios
- **Backend:** Express.js, PDFKit, SendGrid, Brevo API
- **Fonts:** Playfair Display, Montserrat, Lato
- **Brand Colors:** Coral (#CA5E3C), Dark Green (#232817), Ivory (#F7F4ED)
