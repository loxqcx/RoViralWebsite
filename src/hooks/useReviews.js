// Made by loxqcx on Discord.
import { useCallback, useEffect, useState } from 'react';
import { reviewsConfig } from '../config/reviews';

export default function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async (signal) => {
    try {
      const response = await fetch('/api/reviews', { signal });
      if (!response.ok) throw new Error('Reviews are unavailable.');
      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setStatus('ready');
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const interval = window.setInterval(() => load(controller.signal), reviewsConfig.refreshMs);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [load]);

  return { reviews, status };
}
