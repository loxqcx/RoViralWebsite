// Made by loxqcx on Discord.
import { readReviewState } from '../api/reviews.js';
import { reviewsConfig } from '../src/config/reviews.js';

const decisionsInProgress = new Set();

export function buildModeratedEmbed(embed, state) {
  const marker = readReviewState(embed);
  if (!marker || marker.state !== 'pending' || !['approved', 'denied'].includes(state)) return null;
  return {
    ...embed,
    title: state === 'approved' ? 'Approved review' : 'Denied review',
    color: reviewsConfig.moderation.colors[state],
    footer: { text: `${reviewsConfig.moderation.footerPrefix} | ${state} | ${marker.id}` },
  };
}

export async function handleReviewReaction(reaction, user, options = {}) {
  if (user.bot) return false;
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();

  const channelId = options.channelId || reviewsConfig.moderation.channelId;
  const moderators = options.moderatorUserIds || reviewsConfig.moderation.moderatorUserIds;
  if (reaction.message.channelId !== channelId) return false;
  if (moderators.length && !moderators.includes(user.id)) return false;

  const state = reaction.emoji.name === reviewsConfig.moderation.approvalEmoji
    ? 'approved'
    : reaction.emoji.name === reviewsConfig.moderation.denialEmoji
      ? 'denied'
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
    if (state === 'denied') {
      await message.reply({ content: 'Review denied', allowedMentions: { parse: [] } });
    }
    return true;
  } finally {
    decisionsInProgress.delete(reaction.message.id);
  }
}
