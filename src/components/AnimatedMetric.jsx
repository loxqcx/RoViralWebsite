// Made by loxqcx on Discord.
import { useEffect, useMemo, useState } from 'react';
import { homeMetricsConfig } from '../config/metrics';
import { formatHomeMetricValue } from '../utils/homeMetrics';

export default function AnimatedMetric({ metric, value }) {
  const target = Math.max(0, Number(value) || 0);
  const [displayValue, setDisplayValue] = useState(target >= 1_000 ? 100 : 0);
  const finalLabel = useMemo(() => formatHomeMetricValue(target, metric.format), [metric.format, target]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(target);
      return undefined;
    }

    const initial = target >= 1_000 ? 100 : 0;
    const startedAt = performance.now();
    let frameId;
    setDisplayValue(initial);

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / homeMetricsConfig.animationDurationMs);
      const eased = 1 - ((1 - progress) ** 3);
      setDisplayValue(initial + ((target - initial) * eased));
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <strong aria-label={`${metric.label}: ${finalLabel}`}>
      <span aria-hidden="true">{formatHomeMetricValue(displayValue, metric.format)}</span>
    </strong>
  );
}
