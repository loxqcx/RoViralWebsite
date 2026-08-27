// Made by loxqcx on Discord.
import { botConfig } from './server.js';

export const homeMetricsConfig = {
  apiPath: '/api/home-metrics',
  refreshMs: 10_000,
  animationDurationMs: 1_250,
  discord: {
    channelId: botConfig.homeStatsChannelId,
    footerMarker: 'RoViral Home Metrics',
    embedTitle: 'Homepage totals',
    embedColor: 0x20ef55,
    scanLimit: 100,
  },
  commands: {
    viewsGenerated: {
      name: 'homet',
      description: 'Update the views generated total on the homepage.',
      successLabel: 'Views generated',
    },
    totalClients: {
      name: 'homec',
      description: 'Update the total clients amount on the homepage.',
      successLabel: 'Total clients',
    },
  },
};

export const homepageMetrics = [
  { key: 'viewsGenerated', value: 0, label: 'Views generated', format: 'compact' },
  { key: 'totalClients', value: 0, label: 'Total clients', format: 'compact' },
  { key: 'averageReviews', value: 4.5, label: 'Average star reviews', format: 'rating' },
];
