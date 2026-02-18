import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@inajphotography.com';
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'ina@inajphotography.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendUserEmail(data, pdfBuffer) {
  if (!SENDGRID_API_KEY) {
    console.log('[Email] SendGrid not configured - skipping user email');
    console.log(`[Email] Would send vision board to: ${data.user.email}`);
    return;
  }

  const msg = {
    to: data.user.email,
    from: { email: FROM_EMAIL, name: 'Ina J Photography' },
    subject: 'Your Emotional Vision Board is Ready!',
    html: buildUserEmailHTML(data),
    ...(pdfBuffer && {
      attachments: [{
        content: pdfBuffer.toString('base64'),
        filename: 'Vision-Board.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      }],
    }),
  };

  await sgMail.send(msg);
  console.log(`[Email] Vision board sent to ${data.user.email}`);
}

export async function sendBusinessEmail(data, pdfBuffer) {
  if (!SENDGRID_API_KEY) {
    console.log('[Email] SendGrid not configured - skipping business notification');
    console.log(`[Email] Would notify business about submission from: ${data.user.name}`);
    return;
  }

  const msg = {
    to: BUSINESS_EMAIL,
    from: { email: FROM_EMAIL, name: 'Vision Board App' },
    subject: `New Vision Board Submission from ${data.user.name}`,
    html: buildBusinessEmailHTML(data),
    ...(pdfBuffer && {
      attachments: [{
        content: pdfBuffer.toString('base64'),
        filename: `Vision-Board-${data.user.name.replace(/\s+/g, '-')}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      }],
    }),
  };

  await sgMail.send(msg);
  console.log(`[Email] Business notification sent for ${data.user.name}`);
}

function buildUserEmailHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #232817; background: #F7F4ED; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #232817; color: white; padding: 30px; text-align: center; }
    .header h1 { font-size: 24px; margin: 0 0 8px 0; }
    .header p { margin: 0; opacity: 0.8; font-size: 14px; }
    .content { padding: 30px; }
    .content p { line-height: 1.6; font-size: 16px; color: #232817; }
    .cta { display: inline-block; background: #CA5E3C; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; text-align: center; font-size: 12px; color: #7A7A7A; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div style="padding: 20px; background: #F7F4ED;">
    <div class="container">
      <div class="header">
        <h1>Ina J Photography</h1>
        <p>Your Emotional Vision Board</p>
      </div>
      <div class="content">
        <p>Hi ${data.user.name},</p>
        <p>Your personalized vision board is attached! This is a beautiful visual summary of your perfect photography session—the moods, settings, and styles that resonate most with you.</p>
        <p>When you're ready to bring this vision to life, we'd love to chat about how we can capture your dog's unique soul in a way that honors your bond.</p>
        <p style="text-align: center;">
          <a href="https://www.inajphotography.com/booking" class="cta">Schedule Your Complimentary Consultation</a>
        </p>
        <p>Or explore more of our work on <a href="https://instagram.com/inajphotography" style="color: #CA5E3C;">Instagram</a>.</p>
        <p>With warmth,<br>Ina J Photography</p>
      </div>
      <div class="footer">
        <p>Ina J Photography | Canberra, Australia</p>
        <p><a href="https://www.inajphotography.com" style="color: #CA5E3C;">www.inajphotography.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildBusinessEmailHTML(data) {
  const { user, visionBoard, submissionTimestamp } = data;
  const selectionsHTML = visionBoard.selections.map(sel => `
    <div style="margin-bottom: 16px; padding: 12px; background: #f9f9f9; border-radius: 6px;">
      <p style="margin: 0 0 4px 0; font-weight: 600;">${sel.filename}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #7A7A7A;">
        ${sel.mood} · ${sel.setting} · ${sel.style}
      </p>
      ${sel.annotation ? `<p style="margin: 4px 0 0 0; font-style: italic;">"${sel.annotation}"</p>` : ''}
    </div>
  `).join('');

  const intentionsHTML = visionBoard.intentions
    .filter(i => i && i.trim())
    .map(i => `<li style="margin-bottom: 6px;">${i}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #232817; margin: 0; padding: 20px; }
  </style>
</head>
<body>
  <h2>New Vision Board Submission</h2>

  <h3>Contact Information</h3>
  <p><strong>Name:</strong> ${user.name}</p>
  <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>

  <h3>Their Vision</h3>
  <h4>Selected Images & Annotations</h4>
  ${selectionsHTML}

  ${intentionsHTML ? `
  <h4>Emotional Intentions</h4>
  <ul>${intentionsHTML}</ul>
  ` : ''}

  <p>Their vision board PDF is attached.</p>

  <hr style="border: 0; border-top: 1px solid #ddd; margin: 24px 0;">
  <p style="font-size: 12px; color: #7A7A7A;">
    <strong>Next steps:</strong> Follow up with your nurture sequence.<br>
    Submitted: ${new Date(submissionTimestamp).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
  </p>
</body>
</html>
  `.trim();
}
