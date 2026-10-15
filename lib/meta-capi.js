// Server-side: Meta Conversions API.
import crypto from 'node:crypto';

const sha = (v) => (v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);

export const str = (v, max = 500) => (typeof v === 'string' && v ? v.slice(0, max) : undefined);

export function clientIp(headers) {
  const xff = headers.get('x-forwarded-for');
  return (xff ? xff.split(',')[0].trim() : headers.get('x-real-ip')) || undefined;
}

const CUSTOM_KEYS = ['value', 'currency', 'content_ids', 'content_type', 'content_name', 'contents', 'num_items', 'depth', 'state', 'order_id'];
export function pickCustomData(params) {
  const out = {};
  if (params && typeof params === 'object') {
    for (const k of CUSTOM_KEYS) if (params[k] !== undefined) out[k] = params[k];
  }
  return out;
}

// phone: international digits without "+", e.g. 8801712345678
export async function sendCapiEvent({ name, eventId, url, headers, fbp, fbc, visitorId, phone, customData = {} }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return { skipped: true };

  const user_data = {
    client_ip_address: clientIp(headers),
    client_user_agent: headers.get('user-agent') || undefined,
    fbp,
    fbc,
    external_id: visitorId ? [sha(visitorId)] : undefined,
    country: [sha('bd')],
    ph: phone ? [sha(phone)] : undefined,
  };

  const payload = {
    data: [
      {
        event_name: name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: url,
        action_source: 'website',
        user_data,
        custom_data: customData,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  const version = process.env.META_GRAPH_VERSION || 'v23.0';
  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), cache: 'no-store' }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) console.error('[CAPI]', name, res.status, JSON.stringify(json));
    return { ok: res.ok };
  } catch (e) {
    console.error('[CAPI] request failed', e);
    return { ok: false };
  }
}
