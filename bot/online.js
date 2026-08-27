// Made by loxqcx on Discord.
import { ActivityType, Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { handleCommand, registerCommands } from './commands.js';
import { cleanupDuplicateDecisionReplies, handleReviewReaction, migrateLegacyReviewIds, syncPendingReviewReactions } from './reviews.js';
import { reviewsConfig } from '../src/config/reviews.js';
import { homeMetricsConfig } from '../src/config/metrics.js';
import { botConfig } from '../src/config/server.js';
import { acquireProcessLock } from './process-lock.js';

const token = process.env.DISCORD_BOT_TOKEN;
const activity = process.env.DISCORD_BOT_ACTIVITY || 'RoViral Marketing';
const guildId = process.env.DISCORD_GUILD_ID;
const reviewChannelId = process.env.DISCORD_REVIEW_CHANNEL_ID || reviewsConfig.moderation.channelId;
const homeStatsChannelId = process.env.DISCORD_HOME_STATS_CHANNEL_ID || homeMetricsConfig.discord.channelId;
const configuredBotAdmins = (process.env.DISCORD_BOT_ADMIN_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => /^\d{17,20}$/.test(id));
const adminUserIds = configuredBotAdmins.length ? configuredBotAdmins : botConfig.adminUserIds;
const releaseProcessLock = acquireProcessLock(new URL('../.bot.pid', import.meta.url));

if (!releaseProcessLock) {
  console.error('Another RoViral bot process is already running from this project.');
  process.exit(1);
}

if (!token) {
  console.error('DISCORD_BOT_TOKEN is not configured.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async (readyClient) => {
  readyClient.user.setPresence({
    status: 'online',
    activities: [{ name: activity, type: ActivityType.Watching }],
  });
  try {
    console.log(await registerCommands(readyClient, guildId));
    const migratedReviews = await migrateLegacyReviewIds(readyClient, reviewChannelId);
    if (migratedReviews) console.log(`Migrated ${migratedReviews} review ID(s).`);
    const duplicateReplies = await cleanupDuplicateDecisionReplies(readyClient, reviewChannelId);
    if (duplicateReplies) console.log(`Removed ${duplicateReplies} duplicate review confirmation(s).`);
    const repairedReviews = await syncPendingReviewReactions(readyClient, reviewChannelId, adminUserIds);
    if (repairedReviews) console.log(`Checked reactions on ${repairedReviews} pending review(s).`);
  } catch (error) {
    console.error('Could not finish Discord startup tasks.', error);
  }
  console.log(`${readyClient.user.tag} is online.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleCommand(interaction, { channelId: reviewChannelId, homeStatsChannelId, adminUserIds });
  } catch (error) {
    console.error('Could not respond to the Discord command.', error);
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  try {
    await handleReviewReaction(reaction, user, { channelId: reviewChannelId, adminUserIds });
  } catch (error) {
    console.error('Could not moderate the review.', error);
  }
});

const shutdown = async () => {
  client.destroy();
  releaseProcessLock();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

client.login(token).catch((error) => {
  console.error('Discord bot login failed.', error);
  releaseProcessLock();
  process.exit(1);
});
