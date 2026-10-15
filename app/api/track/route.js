import { NextResponse } from 'next/server';
import { sendCapiEvent, pickCustomData, str } from '@/lib/meta-capi';

export const runtime = 'nodejs';

// Only these events are accepted from the browser.
const ALLOWED = new Set([
  'PageView',
  'ViewContent',
  'ScrollDepth',
  'TimeOnPage30s',
  'CTAClick',
  'Contact',
  'InitiateCheckout',
  'ANCDemo',
]);

export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!ALLOWED.has(b?.event_name) || typeof b.event_id !== 'string') {
    return new NextResponse(null, { status: 400 });
  }

  await sendCapiEvent({
    name: b.event_name,
    eventId: b.event_id.slice(0, 100),
    url: str(b.url),
    headers: req.headers,
    fbp: str(b.fbp, 200),
    fbc: str(b.fbc, 200),
    visitorId: str(b.visitor_id, 100),
    customData: pickCustomData(b.params),
  });

  return new NextResponse(null, { status: 204 });
}
