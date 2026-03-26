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
  'What part of your dog\u2019s personality do you most want to preserve?',
  'How do you want these photos to feel when you look back on them?',
  'What connection or moment matters most to capture?',
];

function buildBespokeNarrative(selections, intentions, dogName) {
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
  const dog = dogName || 'your dog';
  const moodText = topMoods.join(' and ');
  const settingText = topSettings.join(' and ');

  let narrative = `This vision leans ${moodText}, with a mix of ${styleDesc} moments in ${settingText} settings.`;

  const settingLower = settingText.toLowerCase();
  if (settingLower.includes('outdoor') || settingLower.includes('garden') || settingLower.includes('park') || settingLower.includes('forest')) {
    narrative += ` A soft outdoor setting would suit this beautifully.`;
  } else if (settingLower.includes('studio') || settingLower.includes('indoor')) {
    narrative += ` A cosy studio session would bring this to life perfectly.`;
  }

  narrative += ` Your session should prioritise ${dog}'s personality and the bond you share.`;

  // Build structured brief data for PDF
  return {
    narrative,
    mood: moodText,
    setting: settingText,
    styleBalance: styleDesc,
    emotionalFocus: (intentions || []).filter(i => i && i.trim()).length > 0
      ? intentions.filter(i => i && i.trim())[0]
      : null,
    planningFocus: `Focus on capturing ${dog}'s authentic personality in a ${moodText}, ${settingText} environment.`,
  };
}

async function generatePDF(data) {
  const { user, visionBoard } = data;
  const { selections, intentions } = visionBoard;
  const dogName = user.dogName || '';

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
  const pw = doc.page.width - 100;

  // ─── PAGE 1: Header + Image Grid ───

  doc.rect(0, 0, doc.page.width, 110).fill(ivory);

  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('INA J PHOTOGRAPHY', 50, 30, { align: 'center', width: pw });

  doc.fontSize(26).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Your Emotional Vision Board', 50, 50, { align: 'center', width: pw });

  const subtitleParts = [user.name];
  if (dogName) subtitleParts.push(dogName);
  doc.fontSize(11).fillColor(grey).font('Helvetica')
    .text(`Created for ${subtitleParts.join(' & ')}`, 50, 85, { align: 'center', width: pw });

  const lineY = 115;
  doc.moveTo(50, lineY).lineTo(50 + pw, lineY).strokeColor(coral).lineWidth(1.5).stroke();

  // Image grid
  const imageBuffers = await downloadImages(selections);
  const cols = 2;
  const gap = 14;
  const imgWidth = (pw - gap) / cols;
  const imgHeight = imgWidth * 0.67;
  const annotationSpace = 16;
  let yPos = 130;

  for (let i = 0; i < selections.length; i++) {
    const col = i % cols;
    const x = 50 + col * (imgWidth + gap);
    const cellHeight = imgHeight + annotationSpace;

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

    if (col === cols - 1) {
      yPos += cellHeight + 8;
    }
  }
  if (selections.length % cols !== 0) {
    yPos += imgHeight + annotationSpace + 8;
  }

  // ─── PAGE 2: Session Brief + Core Desires + CTA ───
  doc.addPage();
  let cy = 50;

  const brief = buildBespokeNarrative(selections, intentions, dogName);

  // Session Brief — structured and human
  doc.fontSize(20).fillColor(coral).font('Helvetica-Bold')
    .text('Your Session Brief', 50, cy, { width: pw });
  cy += 28;

  doc.moveTo(50, cy).lineTo(50 + pw, cy).strokeColor(coral).lineWidth(1).stroke();
  cy += 16;

  // Narrative paragraph
  doc.fontSize(12).fillColor(darkGreen).font('Helvetica-Oblique')
    .text(`\u201C${brief.narrative}\u201D`, 50, cy, { width: pw, lineGap: 3 });
  cy += 50;

  // Structured details
  const briefItems = [
    ['Session mood', brief.mood],
    ['Best-fit setting', brief.setting],
    ['Style balance', brief.styleBalance],
  ];
  if (brief.emotionalFocus) {
    briefItems.push(['What matters most', brief.emotionalFocus]);
  }
  briefItems.push(['Planning focus', brief.planningFocus]);

  briefItems.forEach(([label, value]) => {
    doc.fontSize(9).fillColor(grey).font('Helvetica-Bold')
      .text(label.toUpperCase(), 50, cy, { width: pw });
    cy += 12;
    doc.fontSize(11).fillColor(darkGreen).font('Helvetica')
      .text(value, 50, cy, { width: pw, lineGap: 2 });
    cy += 20;
  });

  cy += 8;

  // Core Desires section
  const filledIntentions = (intentions || []).filter(i => i && i.trim());
  if (filledIntentions.length > 0) {
    doc.fontSize(20).fillColor(coral).font('Helvetica-Bold')
      .text('Your Core Desires', 50, cy, { width: pw });
    cy += 28;

    doc.moveTo(50, cy).lineTo(50 + pw, cy).strokeColor(coral).lineWidth(1).stroke();
    cy += 16;

    filledIntentions.forEach((intention, idx) => {
      doc.fontSize(9).fillColor(grey).font('Helvetica')
        .text(intentionQuestions[idx] || '', 50, cy, { width: pw });
      cy += 14;

      doc.fontSize(12).fillColor(coral).font('Helvetica')
        .text('\u2665 ', 50, cy, { continued: true });
      doc.fillColor(darkGreen).font('Helvetica').text(intention);
      cy += 22;
    });
    cy += 10;
  }

  // CTA section
  if (cy > doc.page.height - 140) {
    doc.addPage();
    cy = 50;
  }

  doc.moveTo(50, cy).lineTo(50 + pw, cy).strokeColor('#ddd').lineWidth(0.5).stroke();
  cy += 24;

  doc.fontSize(14).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Ready to bring this vision to life?', 50, cy, { align: 'center', width: pw });
  cy += 20;

  doc.fontSize(11).fillColor(grey).font('Helvetica')
    .text('Your vision board gives us a clear starting point. In your complimentary consultation call, we\u2019ll turn this into a real session plan.', 50, cy, { align: 'center', width: pw, lineGap: 2 });
  cy += 36;

  doc.fontSize(12).fillColor(coral).font('Helvetica-Bold')
    .text('Book Your Complimentary Consultation Call', 50, cy, {
      align: 'center', width: pw,
      link: 'https://www.inajphotography.com/booking',
    });
  cy += 20;
  doc.fontSize(10).fillColor(darkGreen).font('Helvetica')
    .text('www.inajphotography.com/booking', 50, cy, {
      align: 'center', width: pw, link: 'https://www.inajphotography.com/booking',
    });
  cy += 24;

  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('See session details: www.inajphotography.com/session-info', 50, cy, {
      align: 'center', width: pw, link: 'https://www.inajphotography.com/session-info',
    });
  cy += 28;

  doc.fontSize(9).fillColor(grey).font('Helvetica')
    .text('Ina J Photography | Canberra, Australia | @inajphotography', 50, cy, { align: 'center', width: pw });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// --- EMAILS ---

function buildUserEmailHTML(data) {
  const dogName = data.user.dogName;
  const dogRef = dogName ? `${dogName}'s` : 'your dog\u2019s';

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
      <p>Your personalised vision board is attached! It\u2019s a beautiful snapshot of the session you\u2019re dreaming of \u2014 the moods, settings, and moments that matter most to you.</p>
      <p>Your vision board gives us a clear starting point. In your complimentary consultation call, we\u2019ll turn this into a real session plan \u2014 including the best location, mood, timing, and photo focus for ${dogRef} unique personality.</p>
      <p style="text-align:center"><a href="https://www.inajphotography.com/booking" class="cta">Book Your Complimentary Consultation Call</a></p>
      <p>Or <a href="https://www.inajphotography.com/session-info" style="color:#CA5E3C">see session details</a> to learn more about the experience.</p>
      <p>With warmth,<br>Ina J Photography</p>
    </div>
    <div class="footer"><p>Ina J Photography | Canberra, Australia</p><p><a href="https://www.inajphotography.com" style="color:#CA5E3C">www.inajphotography.com</a> &middot; <a href="https://instagram.com/inajphotography" style="color:#CA5E3C">@inajphotography</a></p></div>
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
    ${user.dogName ? `<p><strong>Dog\u2019s name:</strong> ${user.dogName}</p>` : ''}
    <h3>Their Vision</h3><h4>Selected Images & Annotations</h4>${selectionsHTML}
    ${intentionsHTML ? `<h4>Core Desires</h4><ul>${intentionsHTML}</ul>` : ''}
    <p>Their vision board PDF is attached.</p>
    <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
    <p style="font-size:12px;color:#7A7A7A"><strong>Next steps:</strong> Follow up with consultation call invite.<br>
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

  const attributes = {
    FIRSTNAME: nameParts[0] || '',
    LASTNAME: nameParts.slice(1).join(' ') || '',
    VISION_BOARD_SUBMITTED: true,
    SUBMISSION_DATE: data.submissionTimestamp,
    MOODS: [...new Set(visionBoard.selections.map(s => s.mood))].join(','),
    SETTINGS: [...new Set(visionBoard.selections.map(s => s.setting))].join(','),
    STYLES: [...new Set(visionBoard.selections.map(s => s.style))].join(','),
  };

  if (user.dogName) {
    attributes.DOG_NAME = user.dogName;
  }

  await axios.post('https://api.brevo.com/v3/contacts', {
    email: user.email,
    attributes,
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
    const { name, email, dogName, selections, intentions } = req.body;

    if (!name || !email || !selections || selections.length < 4) {
      return res.status(400).json({ error: 'Please provide name, email, and at least 4 image selections.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const submissionData = {
      user: { name, email, dogName: dogName || '' },
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
      tasks.push(
        sendBrevoEmail({
          to: email,
          fromEmail,
          fromName: 'Ina J Photography',
          subject: `Your Vision Board is Ready${dogName ? `, ${name}` : ''}!`,
          html: buildUserEmailHTML(submissionData),
          pdfBuffer,
          pdfFilename: 'Vision-Board.pdf',
        }).catch(err => console.error('User email failed:', err.message))
      );

      tasks.push(
        sendBrevoEmail({
          to: businessEmail,
          fromEmail,
          fromName: 'Vision Board App',
          subject: `New Vision Board: ${name}${dogName ? ` & ${dogName}` : ''}`,
          html: buildBusinessEmailHTML(submissionData),
          pdfBuffer,
          pdfFilename: `Vision-Board-${name.replace(/\s+/g, '-')}.pdf`,
        }).catch(err => console.error('Business email failed:', err.message))
      );

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
