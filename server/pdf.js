import PDFDocument from 'pdfkit';
import axios from 'axios';

/**
 * Generates a vision board PDF from the submission data.
 * Returns a Buffer containing the PDF.
 */
export async function generateVisionBoardPDF(data) {
  const { user, visionBoard } = data;
  const { selections, intentions } = visionBoard;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `Vision Board - ${user.name}`,
      Author: 'Ina J Photography',
    }
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Colors
  const coral = '#CA5E3C';
  const darkGreen = '#232817';
  const ivory = '#F7F4ED';
  const grey = '#7A7A7A';

  // Header background
  doc.rect(0, 0, doc.page.width, 100).fill(ivory);

  // Header text
  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('INA J PHOTOGRAPHY', 40, 30, { align: 'center' });

  doc.fontSize(24).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Session Vision Board', 40, 48, { align: 'center' });

  doc.fontSize(11).fillColor(grey).font('Helvetica')
    .text(`Created for ${user.name}`, 40, 78, { align: 'center' });

  doc.moveDown(2);
  let yPos = 120;

  // Download images and place them in a grid
  const imageBuffers = await downloadImages(selections);

  const pageWidth = doc.page.width - 80; // margins
  const cols = selections.length <= 4 ? 2 : selections.length <= 6 ? 3 : 4;
  const imgWidth = (pageWidth - (cols - 1) * 10) / cols;
  const imgHeight = imgWidth * 1.2;

  for (let i = 0; i < selections.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 40 + col * (imgWidth + 10);
    const y = yPos + row * (imgHeight + 40);

    // Check if we need a new page
    if (y + imgHeight + 40 > doc.page.height - 40) {
      doc.addPage();
      yPos = 40 - row * (imgHeight + 40);
      const newY = yPos + row * (imgHeight + 40);

      if (imageBuffers[i]) {
        try {
          doc.image(imageBuffers[i], x, newY, {
            width: imgWidth,
            height: imgHeight,
            fit: [imgWidth, imgHeight],
            align: 'center',
            valign: 'center',
          });
        } catch {
          // If image fails, draw a placeholder
          doc.rect(x, newY, imgWidth, imgHeight).fill('#f0f0f0');
          doc.fontSize(8).fillColor(grey).text('Image', x, newY + imgHeight / 2, {
            width: imgWidth, align: 'center'
          });
        }
      }

      // Annotation below image
      if (selections[i].annotation) {
        doc.fontSize(8).fillColor(darkGreen).font('Helvetica-Oblique')
          .text(`"${selections[i].annotation}"`, x, newY + imgHeight + 4, {
            width: imgWidth,
            lineGap: 1,
          });
      }
    } else {
      if (imageBuffers[i]) {
        try {
          doc.image(imageBuffers[i], x, y, {
            width: imgWidth,
            height: imgHeight,
            fit: [imgWidth, imgHeight],
            align: 'center',
            valign: 'center',
          });
        } catch {
          doc.rect(x, y, imgWidth, imgHeight).fill('#f0f0f0');
          doc.fontSize(8).fillColor(grey).text('Image', x, y + imgHeight / 2, {
            width: imgWidth, align: 'center'
          });
        }
      }

      if (selections[i].annotation) {
        doc.fontSize(8).fillColor(darkGreen).font('Helvetica-Oblique')
          .text(`"${selections[i].annotation}"`, x, y + imgHeight + 4, {
            width: imgWidth,
            lineGap: 1,
          });
      }
    }
  }

  // New page for intentions and session brief
  doc.addPage();

  // Emotional Intentions
  const filledIntentions = intentions.filter(i => i && i.trim());
  if (filledIntentions.length > 0) {
    doc.fontSize(18).fillColor(darkGreen).font('Helvetica-Bold')
      .text('Your Emotional Intentions', 40, 40);
    doc.moveDown(0.8);

    filledIntentions.forEach((intention) => {
      doc.fontSize(12).fillColor(coral).font('Helvetica')
        .text('\u2665 ', { continued: true });
      doc.fillColor(darkGreen).font('Helvetica')
        .text(intention);
      doc.moveDown(0.5);
    });

    doc.moveDown(1);
  }

  // Session Brief
  doc.fontSize(18).fillColor(darkGreen).font('Helvetica-Bold')
    .text('Session Brief');
  doc.moveDown(0.5);

  const moodCounts = {};
  const settingCounts = {};
  selections.forEach(s => {
    moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
    settingCounts[s.setting] = (settingCounts[s.setting] || 0) + 1;
  });

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([m]) => m.toLowerCase());

  const topSettings = Object.entries(settingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([s]) => s.toLowerCase());

  const hasCandid = selections.some(s => s.style.toLowerCase().includes('candid'));
  const hasPosed = selections.some(s => s.style.toLowerCase().includes('posed'));
  let styleDesc = hasCandid && hasPosed ? 'candid and posed'
    : hasCandid ? 'candid'
    : hasPosed ? 'posed'
    : 'artistic';

  doc.fontSize(12).fillColor(darkGreen).font('Helvetica')
    .text(
      `Your vision focuses on a ${topMoods.join(' and ')} mood in ${topSettings.join(' and ')} settings, capturing a mix of ${styleDesc} moments.`,
      { lineGap: 2 }
    );

  doc.moveDown(2);

  // Footer
  doc.fontSize(10).fillColor(grey).font('Helvetica')
    .text('Ready to bring this vision to life?', { align: 'center' });
  doc.fontSize(10).fillColor(coral).font('Helvetica-Bold')
    .text('Book your consultation: www.inajphotography.com/booking', {
      align: 'center',
      link: 'https://www.inajphotography.com/booking',
    });

  doc.moveDown(2);
  doc.fontSize(9).fillColor(grey).font('Helvetica')
    .text('Ina J Photography | Canberra, Australia', { align: 'center' });
  doc.text('www.inajphotography.com | @inajphotography', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

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
