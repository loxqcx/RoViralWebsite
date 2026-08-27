// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { buildHomeMetricsEmbed } from '../src/utils/homeMetrics.js';
import { listHomeMetrics } from './home-metrics.js';

describe('homepage metrics API', () => {
  it('returns configured totals from Discord', async () => {
    const fetchMock = async () => ({
      ok: true,
      json: async () => [{ embeds: [buildHomeMetricsEmbed({ viewsGenerated: 250_000, totalClients: 31 })] }],
    });
    await expect(listHomeMetrics({ token: 'private-token', channelId: 'channel-id' }, fetchMock)).resolves.toEqual({
      status: 200,
      data: { metrics: { viewsGenerated: 250_000, totalClients: 31, averageReviews: 4.5 }, configured: true },
    });
  });

  it('returns config defaults when Discord is not configured', async () => {
    await expect(listHomeMetrics({})).resolves.toMatchObject({ status: 200, data: { configured: false } });
  });
});
