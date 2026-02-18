import PDFDocument from 'pdfkit';
import axios from 'axios';

// --- PDF GENERATION ---

async function downloadImages(selections) {
  const results = await Promise.allSettled(
    selections.map(async (sel) => {
      const response = await axios.get(sel.imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });
      return Buffer.from(response.data);
    })
  );
  return results.map(r => r.status === 'fulfilled' ? r.value : null);
}

const intentionQuestions = [
  'What emotion or personality trait do you want to preserve?',
  'What feeling do you want to experience when you look at these photos?',
  'What special moment or connection matters most to you?',
];

async function generatePDF(data) {
  const { user, visionBoard } = data;
  const { selections, intentions } = visionBoard;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: { Title: `Vision Board - ${user.name}`, Author: 'Ina J Photography' }
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const coral = '#CA5E3C';
  const darkGreen = '#232817';
  const ivory = '#F7F4ED';
  const grey = '#7A7A7A';
  const pw = doc.page.width - 100; // usable page width (50 margin each side)

  // ─── PAGE 1: Header + Image Grid ───

  // Ivory header band
  doc.rect(0, 0, doc.page.width, 110).fill(ivory);

  // Brand name
  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('INA J PHOTOGRAPHY', 50, 30, { align: 'center', width: pw });

  // Title
  doc.fontSize(26).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Your Emotional Vision Board', 50, 50, { align: 'center', width: pw });

  // Subtitle
  doc.fontSize(11).fillColor(grey).font('Helvetica')
    .text(`Created for ${user.name}`, 50, 85, { align: 'center', width: pw });

  // Decorative line
  const lineY = 115;
  doc.moveTo(50, lineY).lineTo(50 + pw, lineY).strokeColor(coral).lineWidth(1.5).stroke();

  // Image grid — 2 columns, landscape-friendly
  const imageBuffers = await downloadImages(selections);
  const cols = 2;
  const gap = 14;
  const imgWidth = (pw - gap) / cols;
  const imgHeight = imgWidth * 0.67; // landscape ratio
  const annotationSpace = 16;
  let yPos = 130;

  for (let i = 0; i < selections.length; i++) {
    const col = i % cols;
    const x = 50 + col * (imgWidth + gap);
    const cellHeight = imgHeight + annotationSpace;

    // Check page break
    if (yPos + cellHeight > doc.page.height - 50) {
      doc.addPage();
      yPos = 50;
    }

    if (imageBuffers[i]) {
      try {
        doc.save();
        doc.roundedRect(x, yPos, imgWidth, imgHeight, 4).clip();
        doc.image(imageBuffers[i], x, yPos, {
          width: imgWidth, height: imgHeight,
          fit: [imgWidth, imgHeight], align: 'center', valign: 'center',
        });
        doc.restore();
      } catch {
        doc.roundedRect(x, yPos, imgWidth, imgHeight, 4).fill('#f0f0f0');
      }
    }

    if (selections[i].annotation) {
      doc.fontSize(8).fillColor(darkGreen).font('Helvetica-Oblique')
        .text(`\u201C${selections[i].annotation}\u201D`, x, yPos + imgHeight + 3, { width: imgWidth, lineGap: 1 });
    }

    // Advance row after second column
    if (col === cols - 1) {
      yPos += cellHeight + 8;
    }
  }
  // Handle odd number of images — advance row
  if (selections.length % cols !== 0) {
    yPos += imgHeight + annotationSpace + 8;
  }

  // ─── PAGE 2: Core Desires + Session Brief + CTA ───
  doc.addPage();
  let cy = 50;

  // Core Desires section
  const filledIntentions = (intentions || []).filter(i => i && i.trim());
  if (filledIntentions.length > 0) {
    doc.fontSize(20).fillColor(darkGreen).font('Helvetica-Bold')
      .text('Your Core Desires', 50, cy, { width: pw });
    cy += 30;

    // Decorative line
    doc.moveTo(50, cy).lineTo(50 + pw, cy).strokeColor(coral).lineWidth(1).stroke();
    cy += 16;

    filledIntentions.forEach((intention, idx) => {
      // Question label
      doc.fontSize(9).fillColor(grey).font('Helvetica')
        .text(intentionQuestions[idx] || '', 50, cy, { width: pw });
      cy += 14;

      // Answer with heart icon
      doc.fontSize(12).fillColor(coral).font('Helvetica')
        .text('\u2665 ', 50, cy, { continued: true });
      doc.fillColor(darkGreen).font('Helvetica').text(intention);
      cy += 22;
    });
    cy += 10;
  }

  // Session Brief section
  const moodCounts = {};
  const settingCounts = {};
  selections.forEach(s => {
    moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
    settingCounts[s.setting] = (settingCounts[s.setting] || 0) + 1;
  });
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m.toLowerCase());
  const topSettings = Object.entries(settingCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s]) => s.toLowerCase());
  const hasCandid = selections.some(s => s.style.toLowerCase().includes('candid'));
  const hasPosed = selections.some(s => s.style.toLowerCase().includes('posed'));
  const styleDesc = hasCandid && hasPosed ? 'candid and posed' : hasCandid ? 'candid' : hasPosed ? 'posed' : 'artistic';

  doc.fontSize(20).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Session Brief', 50, cy, { width: pw });
  cy += 28;

  doc.fontSize(12).fillColor(darkGreen).font('Helvetica')
    .text(`Your vision focuses on a ${topMoods.join(' and ')} mood in ${topSettings.join(' and ')} settings, capturing a mix of ${styleDesc} moments.`, 50, cy, { width: pw, lineGap: 3 });
  cy += 50;

  // CTA section
  doc.moveTo(50, cy).lineTo(50 + pw, cy).strokeColor('#ddd').lineWidth(0.5).stroke();
  cy += 24;

  doc.fontSize(14).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Ready to bring this vision to life?', 50, cy, { align: 'center', width: pw });
  cy += 24;

  doc.fontSize(11).fillColor(coral).font('Helvetica-Bold')
    .text('Schedule Your Complimentary Consultation', 50, cy, {
      align: 'center', width: pw,
      link: 'https://www.inajphotography.com/booking',
    });
  cy += 20;
  doc.fontSize(10).fillColor(darkGreen).font('Helvetica')
    .text('www.inajphotography.com/booking', 50, cy, {
      align: 'center', width: pw, link: 'https://www.inajphotography.com/booking',
    });
  cy += 28;

  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('Follow @inajphotography on Instagram', 50, cy, {
      align: 'center', width: pw, link: 'https://instagram.com/inajphotography',
    });
  cy += 18;
  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('Find out more about the experience', 50, cy, {
      align: 'center', width: pw, link: 'https://www.inajphotography.com/session-info',
    });
  cy += 32;

  // Footer
  doc.fontSize(9).fillColor(grey).font('Helvetica')
    .text('Ina J Photography | Canberra, Australia', 50, cy, { align: 'center', width: pw });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// --- EMAILS ---

function buildUserEmailHTML(data) {
  return `<!DOCTYPE html><html><head><style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;color:#232817;background:#F7F4ED;margin:0;padding:0}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}
    .header{background:#232817;color:#fff;padding:30px;text-align:center}
    .header h1{font-size:24px;margin:0 0 8px 0}
    .header p{margin:0;opacity:.8;font-size:14px}
    .content{padding:30px}
    .content p{line-height:1.6;font-size:16px;color:#232817}
    .cta{display:inline-block;background:#CA5E3C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:16px;margin:20px 0}
    .footer{padding:20px 30px;text-align:center;font-size:12px;color:#7A7A7A;border-top:1px solid #eee}
  </style></head><body><div style="padding:20px;background:#F7F4ED"><div class="container">
    <div class="header"><h1>Ina J Photography</h1><p>Your Emotional Vision Board</p></div>
    <div class="content">
      <p>Hi ${data.user.name},</p>
      <p>Your personalised vision board is attached! This is a beautiful visual summary of your perfect photography session\u2014the moods, settings, and styles that resonate most with you.</p>
      <p>When you\u2019re ready to bring this vision to life, we\u2019d love to chat about how we can capture your dog\u2019s unique soul in a way that honors your bond.</p>
      <p style="text-align:center"><a href="https://www.inajphotography.com/booking" class="cta">Schedule Your Complimentary Consultation</a></p>
      <p>Or explore more of our work on <a href="https://instagram.com/inajphotography" style="color:#CA5E3C">Instagram</a>.</p>
      <p>With warmth,<br>Ina J Photography</p>
    </div>
    <div class="footer"><p>Ina J Photography | Canberra, Australia</p><p><a href="https://www.inajphotography.com" style="color:#CA5E3C">www.inajphotography.com</a></p></div>
  </div></div></body></html>`;
}

function buildBusinessEmailHTML(data) {
  const { user, visionBoard, submissionTimestamp } = data;
  const selectionsHTML = visionBoard.selections.map(sel =>
    `<div style="margin-bottom:16px;padding:12px;background:#f9f9f9;border-radius:6px">
      <p style="margin:0 0 4px 0;font-weight:600">${sel.filename}</p>
      <p style="margin:0 0 4px 0;font-size:13px;color:#7A7A7A">${sel.mood} \u00B7 ${sel.setting} \u00B7 ${sel.style}</p>
      ${sel.annotation ? `<p style="margin:4px 0 0 0;font-style:italic">\u201C${sel.annotation}\u201D</p>` : ''}
    </div>`
  ).join('');

  const intentionsHTML = (visionBoard.intentions || [])
    .filter(i => i && i.trim())
    .map(i => `<li style="margin-bottom:6px">${i}</li>`)
    .join('');

  return `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#232817;margin:0;padding:20px">
    <h2>New Vision Board Submission</h2>
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
    <h3>Their Vision</h3><h4>Selected Images & Annotations</h4>${selectionsHTML}
    ${intentionsHTML ? `<h4>Emotional Intentions</h4><ul>${intentionsHTML}</ul>` : ''}
    <p>Their vision board PDF is attached.</p>
    <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
    <p style="font-size:12px;color:#7A7A7A"><strong>Next steps:</strong> Follow up with your nurture sequence.<br>
    Submitted: ${new Date(submissionTimestamp).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
  </body></html>`;
}

// --- BREVO ---

const brevoHeaders = () => ({
  'api-key': process.env.BREVO_API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

async function sendBrevoEmail({ to, fromEmail, fromName, subject, html, pdfBuffer, pdfFilename }) {
  const payload = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (pdfBuffer) {
    payload.attachment = [{
      content: pdfBuffer.toString('base64'),
      name: pdfFilename || 'Vision-Board.pdf',
    }];
  }

  await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: brevoHeaders(),
  });
}

async function addContactToBrevo(data) {
  const { user, visionBoard } = data;
  const nameParts = user.name.trim().split(' ');

  await axios.post('https://api.brevo.com/v3/contacts', {
    email: user.email,
    attributes: {
      FIRSTNAME: nameParts[0] || '',
      LASTNAME: nameParts.slice(1).join(' ') || '',
      VISION_BOARD_SUBMITTED: true,
      SUBMISSION_DATE: data.submissionTimestamp,
      MOODS: [...new Set(visionBoard.selections.map(s => s.mood))].join(','),
      SETTINGS: [...new Set(visionBoard.selections.map(s => s.setting))].join(','),
      STYLES: [...new Set(visionBoard.selections.map(s => s.style))].join(','),
    },
    updateEnabled: true,
  }, {
    headers: brevoHeaders(),
  });
}

// --- HANDLER ---

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, selections, intentions } = req.body;

    if (!name || !email || !selections || selections.length < 4) {
      return res.status(400).json({ error: 'Please provide name, email, and at least 4 image selections.' });
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
      pdfBuffer = await generatePDF(submissionData);
    } catch (err) {
      console.error('PDF generation failed:', err.message);
    }

    // Send emails and create Brevo contact (don't block response on failures)
    const tasks = [];

    const brevoKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@inajphotography.com';
    const businessEmail = process.env.BUSINESS_EMAIL || 'ina@inajphotography.com';

    if (brevoKey) {
      // User email
      tasks.push(
        sendBrevoEmail({
          to: email,
          fromEmail,
          fromName: 'Ina J Photography',
          subject: 'Your Emotional Vision Board is Ready!',
          html: buildUserEmailHTML(submissionData),
          pdfBuffer,
          pdfFilename: 'Vision-Board.pdf',
        }).catch(err => console.error('User email failed:', err.message))
      );

      // Business email
      tasks.push(
        sendBrevoEmail({
          to: businessEmail,
          fromEmail,
          fromName: 'Vision Board App',
          subject: `New Vision Board Submission from ${name}`,
          html: buildBusinessEmailHTML(submissionData),
          pdfBuffer,
          pdfFilename: `Vision-Board-${name.replace(/\s+/g, '-')}.pdf`,
        }).catch(err => console.error('Business email failed:', err.message))
      );

      // Add contact
      tasks.push(
        addContactToBrevo(submissionData).catch(err => console.error('Brevo contact failed:', err.message))
      );
    } else {
      console.log('[Brevo] API key not configured - skipping emails and contacts');
    }

    await Promise.allSettled(tasks);

    return res.status(200).json({ success: true, message: 'Vision board submitted successfully.' });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
}
