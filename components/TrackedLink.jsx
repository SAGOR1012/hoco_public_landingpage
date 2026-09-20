'use client';
import { trackEvent } from '@/lib/tracking-client';

// A normal link that also records an event when tapped.
export default function TrackedLink({ event, custom = false, params, children, ...rest }) {
  return (
    <a {...rest} onClick={() => trackEvent(event, params, { custom })}>
      {children}
    </a>
  );
}
