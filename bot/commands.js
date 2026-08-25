// Made by loxqcx on Discord.
import { SlashCommandBuilder } from 'discord.js';

export const testCommand = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Check that the RoViral bot is working.');

export async function registerCommands(client, guildId) {
  const manager = guildId
    ? (await client.guilds.fetch(guildId)).commands
    : client.application.commands;
  const commandData = testCommand.toJSON();
  const commands = await manager.fetch();
  const existing = commands.find((command) => command.name === commandData.name);

  if (!existing) await manager.create(commandData);
  else if (existing.description !== commandData.description) await manager.edit(existing.id, commandData);

  return guildId ? `Registered /test in server ${guildId}.` : 'Registered /test globally.';
}

export async function handleCommand(interaction) {
  if (!interaction.isChatInputCommand() || interaction.commandName !== testCommand.toJSON().name) return false;
  await interaction.reply({ content: 'lox test successful', allowedMentions: { parse: [] } });
  return true;
}
