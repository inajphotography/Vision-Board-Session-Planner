import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generateVisionBoardPDF } from './pdf.js';
import { sendUserEmail, sendBusinessEmail } from './email.js';
import { addContactToBrevo } from './brevo.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Submit vision board
app.post('/api/vision-board/submit', async (req, res) => {
  try {
    const { name, email, selections, intentions } = req.body;

    if (!name || !email || !selections || selections.length < 4) {
      return res.status(400).json({
        error: 'Please provide name, email, and at least 4 image selections.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const submissionData = {
      user: { name, email },
      visionBoard: { selections, intentions: intentions || [] },
      submissionTimestamp: new Date().toISOString(),
    };

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generateVisionBoardPDF(submissionData);
    } catch (err) {
      console.error('PDF generation failed:', err.message);
      // Continue without PDF - still capture the lead
    }

    // Run email and Brevo tasks concurrently - don't let failures block the response
    const tasks = [];

    // Send user email
    tasks.push(
      sendUserEmail(submissionData, pdfBuffer).catch(err => {
        console.error('User email failed:', err.message);
      })
    );

    // Send business notification email
    tasks.push(
      sendBusinessEmail(submissionData, pdfBuffer).catch(err => {
        console.error('Business email failed:', err.message);
      })
    );

    // Add to Brevo
    tasks.push(
      addContactToBrevo(submissionData).catch(err => {
        console.error('Brevo contact creation failed:', err.message);
      })
    );

    await Promise.allSettled(tasks);

    res.json({ success: true, message: 'Vision board submitted successfully.' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Gallery endpoint
app.get('/api/gallery', (req, res) => {
  // Gallery data is bundled in the frontend, but this endpoint allows
  // future server-side filtering if needed
  res.json({ message: 'Gallery data is served from the frontend bundle.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
