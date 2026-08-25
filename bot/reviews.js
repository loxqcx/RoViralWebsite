// Made by loxqcx on Discord.
import { readReviewState } from '../api/reviews.js';
import { reviewsConfig } from '../src/config/reviews.js';

const decisionsInProgress = new Set();
const REVIEW_ID_FIELD = 'Review ID';
const LEGACY_REVIEW_ID_FIELD = 'Legacy Review ID';

export function buildModeratedEmbed(embed, state) {
  const marker = readReviewState(embed);
  if (!marker || marker.state !== 'pending' || !['approved', 'declined'].includes(state)) return null;
  return {
    ...embed,
    title: state === 'approved' ? 'Approved review' : 'Declined review',
    color: reviewsConfig.moderation.colors[state],
    footer: { text: `${reviewsConfig.moderation.footerPrefix} | ${state} | ${marker.id}` },
  };
}

async function applyReviewDecision(message, state, botUserId) {
  if (message.author?.id !== botUserId) return false;
  const original = message.embeds[0]?.toJSON?.() || message.embeds[0];
  const updated = buildModeratedEmbed(original, state);
  if (!updated) return false;
  await message.edit({ embeds: [updated] });
  const content = state === 'approved'
    ? reviewsConfig.moderation.approvedMessage
    : reviewsConfig.moderation.declinedMessage;
  await message.reply({ content, allowedMentions: { parse: [] } });
  return true;
}

const hasNonBotReaction = (message, emoji) => {
  const reactions = message.reactions?.cache ? [...message.reactions.cache.values()] : [];
  const reaction = reactions.find((item) => item.emoji.name === emoji);
  return Boolean(reaction && reaction.count - (reaction.me ? 1 : 0) > 0);
};

export async function migrateLegacyReviewIds(client, channelId = reviewsConfig.moderation.channelId) {
  const channel = await client.channels.fetch(channelId);
  if (!channel?.messages) return 0;
  const messages = [...(await channel.messages.fetch({ limit: 100 })).values()]
    .filter((message) => message.author?.id === client.user.id)
    .map((message) => ({ message, embed: message.embeds[0]?.toJSON?.() || message.embeds[0] }))
    .map((entry) => ({ ...entry, marker: readReviewState(entry.embed) }))
    .filter((entry) => entry.marker)
    .sort((a, b) => String(a.message.id).localeCompare(String(b.message.id)));
  const prefix = reviewsConfig.moderation.idPrefix;
  const pattern = new RegExp(`^${prefix}(\\d+)$`, 'i');
  const used = new Set(messages.map(({ marker }) => Number(marker.id.match(pattern)?.[1])).filter(Number.isInteger));
  let migrated = 0;

  for (const entry of messages.filter(({ marker }) => !pattern.test(marker.id))) {
    let sequence = 1;
    while (used.has(sequence)) sequence += 1;
    used.add(sequence);
    const nextId = `${prefix}${sequence}`;
    const fields = (entry.embed.fields || [])
      .filter((item) => item.name !== LEGACY_REVIEW_ID_FIELD)
      .map((item) => item.name === REVIEW_ID_FIELD ? { ...item, value: nextId } : item);
    if (!fields.some((item) => item.name === REVIEW_ID_FIELD)) fields.push({ name: REVIEW_ID_FIELD, value: nextId, inline: false });
    fields.push({ name: LEGACY_REVIEW_ID_FIELD, value: entry.marker.id, inline: false });
    await entry.message.edit({
      embeds: [{
        ...entry.embed,
        fields,
        footer: { text: `${reviewsConfig.moderation.footerPrefix} | ${entry.marker.state} | ${nextId}` },
      }],
    });
    migrated += 1;
  }
  return migrated;
}

export async function syncPendingReviewReactions(client, channelId = reviewsConfig.moderation.channelId) {
  const channel = await client.channels.fetch(channelId);
  if (!channel?.messages) return 0;
  const messages = await channel.messages.fetch({ limit: 100 });
  const pending = [...messages.values()].filter((message) => {
    if (message.author?.id !== client.user.id) return false;
    const embed = message.embeds[0]?.toJSON?.() || message.embeds[0];
    return readReviewState(embed)?.state === 'pending';
  });
  for (const message of pending) {
    const approved = hasNonBotReaction(message, reviewsConfig.moderation.approvalEmoji);
    const declined = hasNonBotReaction(message, reviewsConfig.moderation.denialEmoji);
    if (approved !== declined) {
      await applyReviewDecision(message, approved ? 'approved' : 'declined', client.user.id);
    } else {
      await message.react(reviewsConfig.moderation.approvalEmoji);
      await message.react(reviewsConfig.moderation.denialEmoji);
    }
  }
  return pending.length;
}

export async function findReviewMessage(channel, reviewId, scanLimit = reviewsConfig.moderation.deleteCommand.scanLimit) {
  const targetId = String(reviewId || '').trim().toLowerCase();
  if (!targetId) return null;
  let before;
  let scanned = 0;

  while (scanned < scanLimit) {
    const batch = await channel.messages.fetch({ limit: Math.min(100, scanLimit - scanned), ...(before ? { before } : {}) });
    const messages = [...batch.values()];
    const match = messages.find((message) => {
      const embed = message.embeds[0]?.toJSON?.() || message.embeds[0];
      const marker = readReviewState(embed);
      const legacyId = embed?.fields?.find((item) => item.name === LEGACY_REVIEW_ID_FIELD)?.value;
      return marker && (marker.id.toLowerCase() === targetId || legacyId?.toLowerCase() === targetId);
    });
    if (match) return match;
    if (messages.length < 100) return null;
    scanned += messages.length;
    before = messages.at(-1)?.id;
  }

  return null;
}

export async function deleteReviewById(channel, reviewId, botUserId) {
  const message = await findReviewMessage(channel, reviewId);
  if (!message || message.author?.id !== botUserId) return false;
  await message.delete();
  return true;
}

export async function deleteAllReviews(channel, botUserId, scanLimit = reviewsConfig.moderation.deleteCommand.scanLimit) {
  let before;
  let scanned = 0;
  let deleted = 0;

  while (scanned < scanLimit) {
    const batch = await channel.messages.fetch({ limit: Math.min(100, scanLimit - scanned), ...(before ? { before } : {}) });
    const messages = [...batch.values()];
    const reviews = messages.filter((message) => {
      if (message.author?.id !== botUserId) return false;
      const embed = message.embeds[0]?.toJSON?.() || message.embeds[0];
      return Boolean(readReviewState(embed));
    });
    for (const review of reviews) {
      await review.delete();
      deleted += 1;
    }
    if (messages.length < 100) break;
    scanned += messages.length;
    before = messages.at(-1)?.id;
  }

  return deleted;
}

export async function handleReviewReaction(reaction, user, options = {}) {
  if (user.bot) return false;
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();

  const channelId = options.channelId || reviewsConfig.moderation.channelId;
  if (reaction.message.channelId !== channelId) return false;

  const state = reaction.emoji.name === reviewsConfig.moderation.approvalEmoji
    ? 'approved'
    : reaction.emoji.name === reviewsConfig.moderation.denialEmoji
      ? 'declined'
      : null;
  if (!state || decisionsInProgress.has(reaction.message.id)) return false;

  decisionsInProgress.add(reaction.message.id);
  try {
    const message = await reaction.message.channel.messages.fetch(reaction.message.id);
    return applyReviewDecision(message, state, reaction.client.user.id);
  } finally {
    decisionsInProgress.delete(reaction.message.id);
  }
}
