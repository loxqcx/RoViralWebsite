// Made by loxqcx on Discord.
import { readReviewState } from '../api/reviews.js';
import { reviewsConfig } from '../src/config/reviews.js';

const decisionsInProgress = new Set();

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
    await message.react(reviewsConfig.moderation.approvalEmoji);
    await message.react(reviewsConfig.moderation.denialEmoji);
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
      return marker?.state === 'approved' && marker.id.toLowerCase() === targetId;
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
    if (message.author?.id !== reaction.client.user.id) return false;
    const original = message.embeds[0]?.toJSON?.() || message.embeds[0];
    const updated = buildModeratedEmbed(original, state);
    if (!updated) return false;
    await message.edit({ embeds: [updated] });
    const content = state === 'approved'
      ? reviewsConfig.moderation.approvedMessage
      : reviewsConfig.moderation.declinedMessage;
    await message.reply({ content, allowedMentions: { parse: [] } });
    return true;
  } finally {
    decisionsInProgress.delete(reaction.message.id);
  }
}
