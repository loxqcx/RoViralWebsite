// Made by loxqcx on Discord.
import { homeMetricsConfig, homepageMetrics } from '../config/metrics.js';

const suffixMultipliers = { '': 1, K: 1_000, M: 1_000_000, B: 1_000_000_000, T: 1_000_000_000_000 };
const editableKeys = Object.keys(homeMetricsConfig.commands);

export const defaultHomeMetricValues = Object.fromEntries(homepageMetrics.map((metric) => [metric.key, metric.value]));

export function parseHomeMetricInput(input) {
  const normalized = String(input ?? '').trim().toUpperCase().replace(/[,\s]/g, '');
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMBT]?)\+?$/);
  if (!match) return null;
  const value = Number(match[1]) * suffixMultipliers[match[2]];
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function normalizeHomeMetricValues(values = {}) {
  return Object.fromEntries(homepageMetrics.map((metric) => {
    const candidate = Number(values[metric.key]);
    return [metric.key, Number.isFinite(candidate) && candidate >= 0 ? candidate : metric.value];
  }));
}

const trimDecimal = (value) => value.toFixed(1).replace(/\.0$/, '');

export function formatHomeMetricValue(value, format = 'compact') {
  const number = Math.max(0, Number(value) || 0);
  if (format === 'rating') return `${number.toFixed(1)}/5`;
  if (number < 10_000) return Math.round(number).toLocaleString('en-US');

  const units = [
    { threshold: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ];
  const unit = units.find(({ threshold }) => number >= threshold);
  return `${trimDecimal(number / unit.threshold)}${unit.suffix}+`;
}

export function buildHomeMetricsEmbed(values) {
  const normalized = normalizeHomeMetricValues(values);
  return {
    title: homeMetricsConfig.discord.embedTitle,
    color: homeMetricsConfig.discord.embedColor,
    fields: editableKeys.map((key) => ({ name: key, value: String(normalized[key]), inline: true })),
    footer: { text: homeMetricsConfig.discord.footerMarker },
    timestamp: new Date().toISOString(),
  };
}

export function readHomeMetricsEmbed(embed = {}) {
  if (embed.footer?.text !== homeMetricsConfig.discord.footerMarker) return null;
  const values = Object.fromEntries((embed.fields || []).map((field) => [field.name, field.value]));
  return normalizeHomeMetricValues(values);
}
