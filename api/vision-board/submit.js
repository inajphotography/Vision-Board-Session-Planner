import sgMail from '@sendgrid/mail';
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

async function generatePDF(data) {
  const { user, visionBoard } = data;
  const { selections, intentions } = visionBoard;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: { Title: `Vision Board - ${user.name}`, Author: 'Ina J Photography' }
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const coral = '#CA5E3C';
  const darkGreen = '#232817';
  const ivory = '#F7F4ED';
  const grey = '#7A7A7A';

  // Header
  doc.rect(0, 0, doc.page.width, 100).fill(ivory);
  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('INA J PHOTOGRAPHY', 40, 30, { align: 'center' });
  doc.fontSize(24).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Session Vision Board', 40, 48, { align: 'center' });
  doc.fontSize(11).fillColor(grey).font('Helvetica')
    .text(`Created for ${user.name}`, 40, 78, { align: 'center' });

  // Images
  const imageBuffers = await downloadImages(selections);
  const pageWidth = doc.page.width - 80;
  const cols = selections.length <= 4 ? 2 : selections.length <= 6 ? 3 : 4;
  const imgWidth = (pageWidth - (cols - 1) * 10) / cols;
  const imgHeight = imgWidth * 1.2;
  let yPos = 120;

  for (let i = 0; i < selections.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 40 + col * (imgWidth + 10);
    let y = yPos + row * (imgHeight + 40);

    if (y + imgHeight + 40 > doc.page.height - 40) {
      doc.addPage();
      yPos = 40 - row * (imgHeight + 40);
      y = yPos + row * (imgHeight + 40);
    }

    if (imageBuffers[i]) {
      try {
        doc.image(imageBuffers[i], x, y, {
          width: imgWidth, height: imgHeight,
          fit: [imgWidth, imgHeight], align: 'center', valign: 'center',
        });
      } catch {
        doc.rect(x, y, imgWidth, imgHeight).fill('#f0f0f0');
      }
    }

    if (selections[i].annotation) {
      doc.fontSize(8).fillColor(darkGreen).font('Helvetica-Oblique')
        .text(`"${selections[i].annotation}"`, x, y + imgHeight + 4, { width: imgWidth, lineGap: 1 });
    }
  }

  // Intentions page
  doc.addPage();
  const filledIntentions = (intentions || []).filter(i => i && i.trim());
  if (filledIntentions.length > 0) {
    doc.fontSize(18).fillColor(darkGreen).font('Helvetica-Bold')
      .text('Your Emotional Intentions', 40, 40);
    doc.moveDown(0.8);
    filledIntentions.forEach((intention) => {
      doc.fontSize(12).fillColor(coral).font('Helvetica').text('\u2665 ', { continued: true });
      doc.fillColor(darkGreen).font('Helvetica').text(intention);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  // Session brief
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

  doc.fontSize(18).fillColor(darkGreen).font('Helvetica-Bold').text('Session Brief');
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(darkGreen).font('Helvetica')
    .text(`Your vision focuses on a ${topMoods.join(' and ')} mood in ${topSettings.join(' and ')} settings, capturing a mix of ${styleDesc} moments.`, { lineGap: 2 });

  doc.moveDown(2);
  doc.fontSize(10).fillColor(grey).font('Helvetica').text('Ready to bring this vision to life?', { align: 'center' });
  doc.fontSize(10).fillColor(coral).font('Helvetica-Bold')
    .text('Book your consultation: www.inajphotography.com/booking', { align: 'center', link: 'https://www.inajphotography.com/booking' });
  doc.moveDown(2);
  doc.fontSize(9).fillColor(grey).font('Helvetica').text('Ina J Photography | Canberra, Australia', { align: 'center' });

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
      <p>Your personalized vision board is attached! This is a beautiful visual summary of your perfect photography session\u2014the moods, settings, and styles that resonate most with you.</p>
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

async function addContactToBrevo(data) {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    console.log('[Brevo] API key not configured - skipping');
    return;
  }

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
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
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

    const sendgridKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@inajphotography.com';
    const businessEmail = process.env.BUSINESS_EMAIL || 'ina@inajphotography.com';

    if (sendgridKey) {
      sgMail.setApiKey(sendgridKey);

      // User email
      tasks.push(
        sgMail.send({
          to: email,
          from: { email: fromEmail, name: 'Ina J Photography' },
          subject: 'Your Emotional Vision Board is Ready!',
          html: buildUserEmailHTML(submissionData),
          ...(pdfBuffer && {
            attachments: [{
              content: pdfBuffer.toString('base64'),
              filename: 'Vision-Board.pdf',
              type: 'application/pdf',
              disposition: 'attachment',
            }],
          }),
        }).catch(err => console.error('User email failed:', err.message))
      );

      // Business email
      tasks.push(
        sgMail.send({
          to: businessEmail,
          from: { email: fromEmail, name: 'Vision Board App' },
          subject: `New Vision Board Submission from ${name}`,
          html: buildBusinessEmailHTML(submissionData),
          ...(pdfBuffer && {
            attachments: [{
              content: pdfBuffer.toString('base64'),
              filename: `Vision-Board-${name.replace(/\s+/g, '-')}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment',
            }],
          }),
        }).catch(err => console.error('Business email failed:', err.message))
      );
    } else {
      console.log('[Email] SendGrid not configured - skipping emails');
    }

    // Brevo
    tasks.push(addContactToBrevo(submissionData).catch(err => console.error('Brevo failed:', err.message)));

    await Promise.allSettled(tasks);

    return res.status(200).json({ success: true, message: 'Vision board submitted successfully.' });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
}
