// Made by loxqcx on Discord.
import { homeMetricsConfig } from '../src/config/metrics.js';
import { buildHomeMetricsEmbed, defaultHomeMetricValues, readHomeMetricsEmbed } from '../src/utils/homeMetrics.js';

let updateQueue = Promise.resolve();

async function findMetricsMessage(channel, botUserId) {
  const messages = await channel.messages.fetch({ limit: homeMetricsConfig.discord.scanLimit });
  return [...messages.values()].find((message) => {
    if (message.author?.id !== botUserId) return false;
    const embed = message.embeds?.[0]?.toJSON?.() || message.embeds?.[0];
    return Boolean(readHomeMetricsEmbed(embed));
  });
}

async function applyMetricUpdate(channel, key, value, botUserId) {
  const message = await findMetricsMessage(channel, botUserId);
  const currentEmbed = message?.embeds?.[0]?.toJSON?.() || message?.embeds?.[0];
  const current = readHomeMetricsEmbed(currentEmbed) || defaultHomeMetricValues;
  const embed = buildHomeMetricsEmbed({ ...current, [key]: value });
  if (message) await message.edit({ embeds: [embed] });
  else await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
  return embed;
}

export function updateHomeMetric(channel, key, value, botUserId) {
  const operation = updateQueue.then(() => applyMetricUpdate(channel, key, value, botUserId));
  updateQueue = operation.catch(() => {});
  return operation;
}
