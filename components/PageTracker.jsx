'use client';
import { useEffect, useRef } from 'react';
import { captureAttribution, trackEvent, productParams } from '@/lib/tracking-client';

// Fires PageView + ViewContent once per page load, then scroll-depth and 30-second engagement events.
export default function PageTracker() {
  const sentView = useRef(false);

  useEffect(() => {
    captureAttribution();
    if (!sentView.current) {
      sentView.current = true;
      trackEvent('PageView');
      trackEvent('ViewContent', productParams(1));
    }

    const fired = new Set();
    const onScroll = () => {
      const el = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / el.scrollHeight) * 100;
      [50, 90].forEach((t) => {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent('ScrollDepth', { depth: t }, { custom: true });
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = setTimeout(() => trackEvent('TimeOnPage30s', {}, { custom: true }), 30000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
