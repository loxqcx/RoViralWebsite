// Made by loxqcx on Discord.
import { getDiscordAvatarUrl } from './discord-users.js';
import { reviewsConfig } from '../src/config/reviews.js';

const API_ROOT = 'https://discord.com/api/v10';
const escapedFooterPrefix = reviewsConfig.moderation.footerPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FOOTER_PATTERN = new RegExp(`^${escapedFooterPrefix} \\| (pending|approved|denied|declined) \\| ([a-z0-9_-]+)$`, 'i');
const FIELD_NAMES = {
  identity: 'Discord',
  userId: 'Discord User ID',
  displayName: 'Display Name',
  rating: 'Rating',
  review: 'Review',
  reviewId: 'Review ID',
};

const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);

export function normalizeReview(body = {}) {
  const stars = Number.parseInt(body.stars, 10);
  return {
    discord: clean(body.discord, 40).replace(/^@/, ''),
    name: clean(body.name, 50),
    message: clean(body.message, 700),
    stars: Number.isInteger(stars) ? stars : 0,
  };
}

export function validateReview(data) {
  if (!data.discord || !data.message || !data.stars) return 'Please complete every required field.';
  if (!/^\d{17,20}$/.test(data.discord) && !/^[a-zA-Z0-9_.]{2,32}$/.test(data.discord)) {
    return 'Enter a valid Discord username or user ID.';
  }
  if (data.message.length < 10) return 'Please add a little more detail to your review.';
  if (data.stars < 1 || data.stars > 5) return 'Stars must be a number from 1 to 5.';
  return null;
}

const formatUsername = (user) => user.discriminator && user.discriminator !== '0'
  ? `${user.username}#${user.discriminator}`
  : user.username;

const profileFromUser = (user, member = {}) => ({
  id: String(user.id),
  username: formatUsername(user),
  displayName: member.nick || user.global_name || user.username,
  avatarUrl: getDiscordAvatarUrl(user),
});

export async function resolveReviewIdentity(identity, token, guildId, fetchImpl = fetch) {
  if (/^\d{17,20}$/.test(identity)) {
    const result = await fetchImpl(`${API_ROOT}/users/${identity}`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (result.ok) return profileFromUser(await result.json());
    return { id: identity, username: identity, displayName: identity, avatarUrl: '' };
  }

  if (guildId) {
    const result = await fetchImpl(`${API_ROOT}/guilds/${guildId}/members/search?query=${encodeURIComponent(identity)}&limit=10`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (result.ok) {
      const members = await result.json();
      const query = identity.toLowerCase();
      const match = members.find((member) => [member.user?.username, member.user?.global_name, member.nick]
        .some((value) => value?.toLowerCase() === query));
      if (match?.user) return profileFromUser(match.user, match);
    }
  }

  return { id: '', username: identity, displayName: identity, avatarUrl: '' };
}

const field = (name, value, inline = false) => ({
  name,
  value: clean(value || 'Not resolved', 1024),
  inline,
});

export function buildReviewPayload(data, profile, reviewId = 'review1') {
  const publicName = data.name || profile.displayName || profile.username || data.discord;
  const embed = {
    title: 'New review awaiting approval',
    color: reviewsConfig.moderation.colors.pending,
    fields: [
      field(FIELD_NAMES.identity, profile.username || data.discord, true),
      field(FIELD_NAMES.userId, profile.id, true),
      field(FIELD_NAMES.displayName, publicName, true),
      field(FIELD_NAMES.rating, `${data.stars}/5`, true),
      field(FIELD_NAMES.review, data.message),
      field(FIELD_NAMES.reviewId, reviewId),
      field('Moderation', `React with ${reviewsConfig.moderation.approvalEmoji} to approve or ${reviewsConfig.moderation.denialEmoji} to decline.`),
    ],
    footer: { text: `${reviewsConfig.moderation.footerPrefix} | pending | ${reviewId}` },
    timestamp: new Date().toISOString(),
  };
  if (profile.avatarUrl) embed.thumbnail = { url: profile.avatarUrl };

  return { embeds: [embed], allowed_mentions: { parse: [] } };
}

export function readReviewState(embed = {}) {
  const match = String(embed.footer?.text || '').match(FOOTER_PATTERN);
  return match ? { state: match[1].toLowerCase(), id: match[2] } : null;
}

const getField = (embed, name) => embed.fields?.find((item) => item.name === name)?.value || '';

export function parseApprovedReview(message) {
  const embed = message?.embeds?.[0];
  const marker = readReviewState(embed);
  if (!embed || marker?.state !== 'approved') return null;
  const stars = Number.parseInt(getField(embed, FIELD_NAMES.rating), 10);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return null;

  return {
    id: marker.id,
    discordUserId: getField(embed, FIELD_NAMES.userId) === 'Not resolved' ? '' : getField(embed, FIELD_NAMES.userId),
    username: getField(embed, FIELD_NAMES.identity),
    displayName: getField(embed, FIELD_NAMES.displayName),
    message: getField(embed, FIELD_NAMES.review),
    stars,
    avatarUrl: embed.thumbnail?.url || '',
    createdAt: message.timestamp || embed.timestamp || '',
  };
}

const discordRequest = (path, token, options = {}, fetchImpl = fetch) => {
  const headers = { Authorization: `Bot ${token}`, ...options.headers };
  if (options.body) headers['Content-Type'] = 'application/json';
  return fetchImpl(`${API_ROOT}${path}`, { ...options, headers });
};

export async function getNextReviewId(env, fetchImpl = fetch) {
  const result = await discordRequest(`/channels/${env.channelId}/messages?limit=100`, env.token, {}, fetchImpl);
  if (!result.ok) throw new Error(`Discord review ID lookup returned ${result.status}.`);
  const escapedIdPrefix = reviewsConfig.moderation.idPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const simpleIdPattern = new RegExp(`^${escapedIdPrefix}(\\d+)$`, 'i');
  const numbers = (await result.json())
    .map((message) => readReviewState(message.embeds?.[0])?.id.match(simpleIdPattern)?.[1])
    .filter(Boolean)
    .map(Number);
  return `${reviewsConfig.moderation.idPrefix}${Math.max(0, ...numbers) + 1}`;
}

export async function createReview(body, env, fetchImpl = fetch) {
  if (body?.website) return { status: 200, data: { ok: true, message: 'Review sent' } };
  const review = normalizeReview(body);
  const error = validateReview(review);
  if (error) return { status: 400, data: { error } };
  if (!env.token || !env.channelId) return { status: 503, data: { error: 'Reviews are not configured yet.' } };

  const profile = await resolveReviewIdentity(review.discord, env.token, env.guildId, fetchImpl);
  const reviewId = await getNextReviewId(env, fetchImpl);
  const posted = await discordRequest(`/channels/${env.channelId}/messages`, env.token, {
    method: 'POST',
    body: JSON.stringify(buildReviewPayload(review, profile, reviewId)),
  }, fetchImpl);
  if (!posted.ok) throw new Error(`Discord review submission returned ${posted.status}.`);
  const message = await posted.json();

  for (const emoji of [reviewsConfig.moderation.approvalEmoji, reviewsConfig.moderation.denialEmoji]) {
    let added = false;
    for (let attempt = 0; attempt < 3 && !added; attempt += 1) {
      const reaction = await discordRequest(`/channels/${env.channelId}/messages/${message.id}/reactions/${encodeURIComponent(emoji)}/@me`, env.token, {
        method: 'PUT',
      }, fetchImpl);
      if (reaction.ok) {
        added = true;
      } else if (reaction.status === 429) {
        const rateLimit = await reaction.json().catch(() => ({}));
        await new Promise((resolve) => setTimeout(resolve, Math.min(Number(rateLimit.retry_after || 1) * 1000, 3000)));
      } else {
        break;
      }
    }
    if (!added) console.error(`Could not add the ${emoji} review reaction.`);
  }

  return { status: 200, data: { ok: true, message: 'Review sent' } };
}

export async function listReviews(env, fetchImpl = fetch) {
  if (!env.token || !env.channelId) return { status: 200, data: { reviews: [], configured: false } };
  const result = await discordRequest(`/channels/${env.channelId}/messages?limit=100`, env.token, {}, fetchImpl);
  if (!result.ok) throw new Error(`Discord review listing returned ${result.status}.`);
  const reviews = (await result.json()).map(parseApprovedReview).filter(Boolean);
  return { status: 200, data: { reviews, configured: true } };
}

const getEnv = () => ({
  token: process.env.DISCORD_BOT_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID,
  channelId: process.env.DISCORD_REVIEW_CHANNEL_ID || reviewsConfig.moderation.channelId,
});

export default async function handler(request, response) {
  let body = request.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { return response.status(400).json({ error: 'Invalid request body.' }); }
  }

  try {
    const result = request.method === 'GET'
      ? await listReviews(getEnv())
      : request.method === 'POST'
        ? await createReview(body, getEnv())
        : null;
    if (!result) {
      response.setHeader('Allow', 'GET, POST');
      return response.status(405).json({ error: 'Method not allowed.' });
    }
    if (request.method === 'GET') response.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    return response.status(result.status).json(result.data);
  } catch (error) {
    console.error('Discord reviews request failed.', error);
    const message = request.method === 'POST' ? 'The review could not be sent. Please try again.' : 'Reviews are temporarily unavailable.';
    return response.status(502).json({ error: message });
  }
}
