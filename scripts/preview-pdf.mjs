// Local-only preview: generates a real sample Vision Board PDF with mock data.
// Does NOT send anything. Writes a .pdf you can open.
import { generatePDF } from '../api/vision-board/submit.js';
import fs from 'fs';

const data = {
  user: { name: 'Sarah Mitchell', email: 'sample@example.com', dogName: 'Rosie' },
  visionBoard: {
    selections: [
      { imageUrl: 'https://storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/69815d391fd827ed5ed45221.jpg', filename: 'Willow.jpg', mood: 'Peaceful', setting: 'Outdoor Gardens', style: 'Candid', annotation: 'Love how calm this feels' },
      { imageUrl: 'https://storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/69815d391fd8273279d4522d.jpg', filename: 'Harley.jpg', mood: 'Happy', setting: 'Outdoor Urban', style: 'Posed', annotation: '' },
      { imageUrl: 'https://storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/68ea63c7edf8d98f23ce5012.jpeg', filename: 'Yuki.jpg', mood: 'Happy', setting: 'Canberra Skyline Sunset', style: 'Posed', annotation: 'That golden light' },
      { imageUrl: 'https://storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/69815d3966e7ca7b5c182a29.jpg', filename: 'Storm.jpg', mood: 'Love', setting: 'Outdoor Gardens', style: 'Candid', annotation: 'This is exactly the bond I want to capture' },
      { imageUrl: 'https://storage.googleapis.com/msgsndr/zjeSHehmlKxLOGbKffZc/media/69815d381f68d10f1a350269.jpg', filename: 'Elton.jpg', mood: 'Connection', setting: 'Outdoor Gardens', style: 'Candid', annotation: '' },
    ],
    intentions: [
      'Her playful spirit and cheeky grin',
      'Warm, joyful, like a sunny morning at home',
      'Our walks together at the lake',
    ],
    artworkPreferences: ['hero-wall-art', 'album'],
  },
  submissionTimestamp: '2026-06-26T03:00:00.000Z',
  brief: {
    narrative: 'There is a real warmth in what you are drawn to. The peaceful, happy moments, the quiet connection, the sense of home. That tells me this session is about Rosie as she truly is, not a stiff set of poses. I would lean towards a soft outdoor garden setting in that gentle hour before sunset, where the light does half the work and Rosie can wander, sniff and just be herself. We will follow her lead and let the real moments come, the cheeky grin, the glance back at you, the easy bond between you both. Rosie does not need to be perfectly behaved for any of this. That is exactly the kind of dog I love to photograph.',
    locationMatches: {
      locations: [
        { name: 'Yarralumla English Garden', why: 'Its quiet, secret-garden feel suits the peaceful, happy mood you are drawn to, and it stays calm for dogs who get distracted easily.' },
        { name: 'Lindsay Pryor National Arboretum', why: 'Wide open fields give Rosie room to run and show off her playful spirit, with gorgeous sunset light through the trees.' },
        { name: 'Lake Burley Griffin', why: 'For that connection you want to capture, the lakeside paths and soft morning light make for relaxed, natural moments together.' },
      ],
    },
    mood: 'peaceful and happy',
    setting: 'outdoor gardens',
    styleBalance: 'candid and posed',
    emotionalFocus: 'Her playful spirit and cheeky grin',
    planningFocus: "Focus on Rosie's authentic personality in a peaceful and happy, outdoor gardens environment.",
  },
};

const outPath = '/Users/inajalil/Library/Mobile Documents/com~apple~CloudDocs/ClaudeProjects/outputs/vision-board-lead-magnet/sample-vision-board.pdf';
const buf = await generatePDF(data);
fs.writeFileSync(outPath, buf);
console.log('PDF written:', outPath, '(' + Math.round(buf.length / 1024) + ' KB)');
