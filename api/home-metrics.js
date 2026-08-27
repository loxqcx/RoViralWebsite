// Made by loxqcx on Discord.
import { homeMetricsConfig } from '../src/config/metrics.js';
import { defaultHomeMetricValues, readHomeMetricsEmbed } from '../src/utils/homeMetrics.js';

const API_ROOT = 'https://discord.com/api/v10';

export async function listHomeMetrics(env, fetchImpl = fetch) {
  if (!env.token || !env.channelId) {
    return { status: 200, data: { metrics: defaultHomeMetricValues, configured: false } };
  }

  const result = await fetchImpl(`${API_ROOT}/channels/${env.channelId}/messages?limit=${homeMetricsConfig.discord.scanLimit}`, {
    headers: { Authorization: `Bot ${env.token}` },
  });
  if (!result.ok) throw new Error(`Discord home metrics lookup returned ${result.status}.`);
  const message = (await result.json()).find((candidate) => readHomeMetricsEmbed(candidate.embeds?.[0]));
  const metrics = readHomeMetricsEmbed(message?.embeds?.[0]) || defaultHomeMetricValues;
  return { status: 200, data: { metrics, configured: true } };
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const result = await listHomeMetrics({
      token: process.env.DISCORD_BOT_TOKEN,
      channelId: process.env.DISCORD_HOME_STATS_CHANNEL_ID || homeMetricsConfig.discord.channelId,
    });
    response.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    return response.status(result.status).json(result.data);
  } catch (error) {
    console.error('Discord home metrics request failed.', error);
    return response.status(502).json({ error: 'Homepage totals are temporarily unavailable.' });
  }
}
