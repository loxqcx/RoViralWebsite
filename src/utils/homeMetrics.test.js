// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { buildHomeMetricsEmbed, formatHomeMetricValue, parseHomeMetricInput, readHomeMetricsEmbed } from './homeMetrics.js';

describe('homepage metrics', () => {
  it('parses plain and abbreviated totals', () => {
    expect(parseHomeMetricInput('100')).toBe(100);
    expect(parseHomeMetricInput('10K')).toBe(10_000);
    expect(parseHomeMetricInput('1.5m+')).toBe(1_500_000);
    expect(parseHomeMetricInput('not a number')).toBeNull();
    expect(parseHomeMetricInput('1+0')).toBeNull();
  });

  it('formats large totals and ratings', () => {
    expect(formatHomeMetricValue(9_999)).toBe('9,999');
    expect(formatHomeMetricValue(10_000)).toBe('10K+');
    expect(formatHomeMetricValue(1_500_000)).toBe('1.5M+');
    expect(formatHomeMetricValue(4.5, 'rating')).toBe('4.5/5');
  });

  it('round trips the Discord storage embed', () => {
    const embed = buildHomeMetricsEmbed({ viewsGenerated: 100_000, totalClients: 24 });
    expect(readHomeMetricsEmbed(embed)).toEqual({ viewsGenerated: 100_000, totalClients: 24, averageReviews: 4.5 });
  });
});
