'use client';
import { useEffect, useState } from 'react';
import TrackedLink from './TrackedLink';
import { PRODUCT } from '@/lib/config';
import { taka } from '@/lib/bn';

// Mobile-only bar with the price and an order button. Hides while the order form is on screen.
export default function StickyBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById('order');
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sticky${hidden ? ' sticky-hide' : ''}`}>
      <div className="sticky-price">
        <s>{taka(PRODUCT.originalPrice)}</s> <strong>{taka(PRODUCT.price)}</strong>
      </div>
      <TrackedLink href="#order" className="btn" event="CTAClick" custom params={{ label: 'sticky_bar' }}>
        অর্ডার করুন
      </TrackedLink>
    </div>
  );
}
