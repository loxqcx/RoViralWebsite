// Made by loxqcx on Discord.
import { useEffect, useState } from 'react';
import { homeMetricsConfig } from '../config/metrics';
import { defaultHomeMetricValues, normalizeHomeMetricValues } from '../utils/homeMetrics';

export function useHomeMetrics() {
  const [values, setValues] = useState(defaultHomeMetricValues);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(homeMetricsConfig.apiPath);
        if (!response.ok) return;
        const data = await response.json();
        if (active) setValues(normalizeHomeMetricValues(data.metrics));
      } catch {
        // Configured defaults remain visible if Discord is temporarily unavailable.
      }
    };

    load();
    const timer = window.setInterval(load, homeMetricsConfig.refreshMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return values;
}
