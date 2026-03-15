import { useState, useEffect } from 'react';

const COUNTER_API_BASE = 'https://api.counterapi.dev/v1';
const COUNTER_NAMESPACE = 'creative-tech-lab';
const COUNTER_KEY = 'home-visits';

export const useVisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = window.location.hostname || 'local';
    const counterName = `${COUNTER_NAMESPACE}-${host.replace(/\./g, '-')}`;
    const sessionKey = `ctl_visited_${host}`;
    const localFallbackKey = `ctl_local_visits_${host}`;

    const trackVisit = async () => {
      try {
        // Check if already counted this session
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        if (!alreadyCounted) {
          // Hit the counter (increment)
          const res = await fetch(`${COUNTER_API_BASE}/${counterName}/${COUNTER_KEY}/up`, {
            method: 'GET',
          });
          if (res.ok) {
            const data = await res.json();
            setCount(data.count);
            sessionStorage.setItem(sessionKey, '1');
          } else {
            // Fallback: just get current count
            const getRes = await fetch(`${COUNTER_API_BASE}/${counterName}/${COUNTER_KEY}`);
            if (getRes.ok) {
              const getData = await getRes.json();
              setCount(getData.count);
            }
          }
        } else {
          // Already counted, just get current value
          const res = await fetch(`${COUNTER_API_BASE}/${counterName}/${COUNTER_KEY}`);
          if (res.ok) {
            const data = await res.json();
            setCount(data.count);
          }
        }
      } catch (err) {
        console.warn('Visitor counter unavailable:', err);
        // Fallback to localStorage counter
        const stored = parseInt(localStorage.getItem(localFallbackKey) || '0', 10);
        const newCount = stored + (sessionStorage.getItem(sessionKey) ? 0 : 1);
        localStorage.setItem(localFallbackKey, String(newCount));
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
        }
        setCount(newCount);
      } finally {
        setLoading(false);
      }
    };

    trackVisit();
  }, []);

  return { count, loading };
};
