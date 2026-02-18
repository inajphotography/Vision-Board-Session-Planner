import axios from 'axios';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function addContactToBrevo(data) {
  if (!BREVO_API_KEY) {
    console.log('[Brevo] API key not configured - skipping contact creation');
    console.log(`[Brevo] Would create contact for: ${data.user.email}`);
    return;
  }

  const { user, visionBoard } = data;
  const { selections } = visionBoard;

  const nameParts = user.name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const selectedMoods = [...new Set(selections.map(s => s.mood))];
  const selectedSettings = [...new Set(selections.map(s => s.setting))];
  const selectedStyles = [...new Set(selections.map(s => s.style))];

  const payload = {
    email: user.email,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      VISION_BOARD_SUBMITTED: true,
      SUBMISSION_DATE: data.submissionTimestamp,
      MOODS: selectedMoods.join(','),
      SETTINGS: selectedSettings.join(','),
      STYLES: selectedStyles.join(','),
    },
    updateEnabled: true,
  };

  const response = await axios.post(
    'https://api.brevo.com/v3/contacts',
    payload,
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  console.log(`[Brevo] Contact created/updated for ${user.email}`, response.status);
  return response.data;
}
