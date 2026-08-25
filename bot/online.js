// Made by loxqcx on Discord.
import { ActivityType, Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { handleCommand, registerCommands } from './commands.js';
import { handleReviewReaction } from './reviews.js';
import { reviewsConfig } from '../src/config/reviews.js';

const token = process.env.DISCORD_BOT_TOKEN;
const activity = process.env.DISCORD_BOT_ACTIVITY || 'RoViral Marketing';
const guildId = process.env.DISCORD_GUILD_ID;
const reviewChannelId = process.env.DISCORD_REVIEW_CHANNEL_ID || reviewsConfig.moderation.channelId;
const moderatorUserIds = (process.env.DISCORD_REVIEW_MODERATOR_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => /^\d{17,20}$/.test(id));

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
  } catch (error) {
    console.error('Could not register Discord commands.', error);
  }
  console.log(`${readyClient.user.tag} is online.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleCommand(interaction);
  } catch (error) {
    console.error('Could not respond to the Discord command.', error);
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  try {
    await handleReviewReaction(reaction, user, { channelId: reviewChannelId, moderatorUserIds });
  } catch (error) {
    console.error('Could not moderate the review.', error);
  }
});

const shutdown = async () => {
  client.destroy();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

client.login(token).catch((error) => {
  console.error('Discord bot login failed.', error);
  process.exit(1);
});
