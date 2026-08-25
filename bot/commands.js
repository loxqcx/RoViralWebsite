// Made by loxqcx on Discord.
import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { reviewsConfig } from '../src/config/reviews.js';
import { deleteReviewById } from './reviews.js';

export const testCommand = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Check that the RoViral bot is working.');

const deleteConfig = reviewsConfig.moderation.deleteCommand;

export const deleteReviewCommand = new SlashCommandBuilder()
  .setName(deleteConfig.name)
  .setDescription(deleteConfig.description)
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) => option
    .setName(deleteConfig.optionName)
    .setDescription(deleteConfig.optionDescription)
    .setRequired(true)
    .setMinLength(8)
    .setMaxLength(64));

const commandBuilders = [testCommand, deleteReviewCommand];

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
  if (interaction.commandName === testCommand.toJSON().name) {
    await interaction.reply({ content: 'lox test successful', allowedMentions: { parse: [] } });
    return true;
  }
  if (interaction.commandName !== deleteReviewCommand.toJSON().name) return false;

  const channelId = options.channelId || reviewsConfig.moderation.channelId;
  const channel = await interaction.client.channels.fetch(channelId);
  const moderatorUserIds = options.moderatorUserIds || reviewsConfig.moderation.moderatorUserIds;
  const allowed = moderatorUserIds.length
    ? moderatorUserIds.includes(interaction.user.id)
    : interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)
      || channel?.permissionsFor?.(interaction.user)?.has(PermissionFlagsBits.ViewChannel);
  if (!allowed) {
    await interaction.reply({ content: deleteConfig.deniedMessage, flags: MessageFlags.Ephemeral });
    return true;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const reviewId = interaction.options.getString(deleteConfig.optionName, true);
  const deleted = channel?.messages
    ? await deleteReviewById(channel, reviewId, interaction.client.user.id)
    : false;
  await interaction.editReply(deleted ? deleteConfig.successMessage : deleteConfig.notFoundMessage);
  return true;
}
