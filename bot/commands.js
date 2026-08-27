// Made by loxqcx on Discord.
import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { homeMetricsConfig } from '../src/config/metrics.js';
import { reviewsConfig } from '../src/config/reviews.js';
import { botConfig } from '../src/config/server.js';
import { formatHomeMetricValue, parseHomeMetricInput } from '../src/utils/homeMetrics.js';
import { updateHomeMetric } from './home-metrics.js';
import { markAllReviewsDeleted, markReviewDeletedById } from './reviews.js';

export const testCommand = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Check that the RoViral bot is working.');

const deleteConfig = reviewsConfig.moderation.deleteCommand;
const deleteAllConfig = reviewsConfig.moderation.deleteAllCommand;

export const deleteReviewCommand = new SlashCommandBuilder()
  .setName(deleteConfig.name)
  .setDescription(deleteConfig.description)
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) => option
    .setName(deleteConfig.optionName)
    .setDescription(deleteConfig.optionDescription)
    .setRequired(true)
    .setMinLength(`${reviewsConfig.moderation.idPrefix}1`.length)
    .setMaxLength(64));

export const deleteAllReviewsCommand = new SlashCommandBuilder()
  .setName(deleteAllConfig.name)
  .setDescription(deleteAllConfig.description)
  .setContexts(InteractionContextType.Guild);

const buildHomeMetricCommand = (config) => new SlashCommandBuilder()
  .setName(config.name)
  .setDescription(config.description)
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) => option
    .setName('value')
    .setDescription('A number such as 100, 10K, 1.5M, or 2B.')
    .setRequired(true)
    .setMaxLength(24));

export const homeTotalCommand = buildHomeMetricCommand(homeMetricsConfig.commands.viewsGenerated);
export const homeClientsCommand = buildHomeMetricCommand(homeMetricsConfig.commands.totalClients);

const homeCommands = new Map([
  [homeTotalCommand.toJSON().name, 'viewsGenerated'],
  [homeClientsCommand.toJSON().name, 'totalClients'],
]);
const commandBuilders = [testCommand, deleteReviewCommand, deleteAllReviewsCommand, homeTotalCommand, homeClientsCommand];
const commandNames = new Set(commandBuilders.map((builder) => builder.toJSON().name));

export async function registerCommands(client, guildId) {
  const manager = guildId
    ? (await client.guilds.fetch(guildId)).commands
    : client.application.commands;
  const commands = await manager.fetch();
  for (const builder of commandBuilders) {
    const commandData = builder.toJSON();
    const existing = commands.find((command) => command.name === commandData.name);
    if (!existing) await manager.create(commandData);
    else await manager.edit(existing.id, commandData);
  }

  const names = commandBuilders.map((builder) => `/${builder.toJSON().name}`).join(' and ');
  return guildId ? `Registered ${names} in server ${guildId}.` : `Registered ${names} globally.`;
}

export async function handleCommand(interaction, options = {}) {
  if (!interaction.isChatInputCommand()) return false;
  if (!commandNames.has(interaction.commandName)) return false;

  const adminUserIds = options.adminUserIds || botConfig.adminUserIds;
  if (!adminUserIds.includes(interaction.user.id)) {
    await interaction.reply({ content: botConfig.deniedMessage, flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.commandName === testCommand.toJSON().name) {
    await interaction.reply({ content: 'lox test successful', allowedMentions: { parse: [] } });
    return true;
  }

  const homeMetricKey = homeCommands.get(interaction.commandName);
  if (homeMetricKey) {
    const channelId = options.homeStatsChannelId || homeMetricsConfig.discord.channelId;
    const channel = await interaction.client.channels.fetch(channelId);
    const value = parseHomeMetricInput(interaction.options.getString('value', true));
    if (value === null) {
      await interaction.reply({ content: 'Enter a valid amount such as 100, 10K, 1.5M, or 2B.', flags: MessageFlags.Ephemeral });
      return true;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await updateHomeMetric(channel, homeMetricKey, value, interaction.client.user.id);
    const config = homeMetricsConfig.commands[homeMetricKey];
    await interaction.editReply(`${config.successLabel} updated to ${formatHomeMetricValue(value)}.`);
    return true;
  }

  const deletesOne = interaction.commandName === deleteReviewCommand.toJSON().name;
  const deletesAll = interaction.commandName === deleteAllReviewsCommand.toJSON().name;
  if (!deletesOne && !deletesAll) return false;

  const channelId = options.channelId || reviewsConfig.moderation.channelId;
  const channel = await interaction.client.channels.fetch(channelId);

  if (deletesAll) {
    await interaction.deferReply();
    if (channel?.messages) await markAllReviewsDeleted(channel, interaction.client.user.id);
    await interaction.editReply(deleteAllConfig.successMessage);
    return true;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const reviewId = interaction.options.getString(deleteConfig.optionName, true);
  const deleted = channel?.messages ? await markReviewDeletedById(channel, reviewId, interaction.client.user.id) : false;
  await interaction.editReply(deleted ? deleteConfig.successMessage : deleteConfig.notFoundMessage);
  return true;
}
