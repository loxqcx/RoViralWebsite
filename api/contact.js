const DEFAULT_MENTION_IDS = ['1338968623095615508', '898661166727962626', '860461244627419138'];

const LIMITS = {
  name: 80,
  email: 120,
  company: 100,
  gameLink: 300,
  discord: 80,
  service: 100,
  budget: 80,
  message: 2000,
};

const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isHttpUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export function normalizeSubmission(body = {}) {
  return Object.fromEntries(Object.entries(LIMITS).map(([key, limit]) => [key, clean(body[key], limit)]));
}

export function validateSubmission(data) {
  if (!data.name || !data.email || !data.service || !data.budget || !data.message) return 'Please complete every required field.';
  if (!isEmail(data.email)) return 'Please enter a valid email address.';
  if (!isHttpUrl(data.gameLink)) return 'Please enter a valid game link.';
  if (data.message.length < 20) return 'Please add a little more detail about your project.';
  return null;
}

export function buildDiscordPayload(data, mentionIds = DEFAULT_MENTION_IDS) {
  const safeIds = mentionIds.filter((id) => /^\d{17,20}$/.test(id));
  const field = (name, value, inline = true) => ({ name, value: (value || 'Not provided').slice(0, 1024), inline });

  return {
    username: 'RoViral Forms',
    content: safeIds.map((id) => `<@${id}>`).join(' '),
    allowed_mentions: { parse: [], users: safeIds },
    embeds: [{
      title: 'New project inquiry',
      description: 'A new lead was submitted through the RoViral website.',
      color: 0xD9FF43,
      fields: [
        field('Name', data.name),
        field('Email', data.email),
        field('Studio / Company', data.company),
        field('Discord', data.discord),
        field('Primary Service', data.service),
        field('Budget', data.budget),
        field('Game Link', data.gameLink, false),
        field('Project Details', data.message, false),
      ],
      footer: { text: 'RoViral Website • Contact Form' },
      timestamp: new Date().toISOString(),
    }],
  };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  let body;
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
  } catch {
    return response.status(400).json({ error: 'Invalid request body.' });
  }
  if (body.website) return response.status(200).json({ ok: true });

  const data = normalizeSubmission(body);
  const validationError = validateSubmission(data);
  if (validationError) return response.status(400).json({ error: validationError });

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL is not configured.');
    return response.status(503).json({ error: 'The contact form is not configured yet. Please use Discord instead.' });
  }

  const mentionIds = (process.env.DISCORD_MENTION_IDS || DEFAULT_MENTION_IDS.join(','))
    .split(',')
    .map((id) => id.trim());

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildDiscordPayload(data, mentionIds)),
    });

    if (!discordResponse.ok) {
      console.error(`Discord webhook returned ${discordResponse.status}.`);
      return response.status(502).json({ error: 'The inquiry could not be delivered. Please try Discord instead.' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form delivery failed.', error);
    return response.status(502).json({ error: 'The inquiry could not be delivered. Please try again.' });
  }
}
