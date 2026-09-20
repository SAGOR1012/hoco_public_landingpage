// Browser-side tracking helpers. Every event gets ONE event_id that is sent to
// both the Meta Pixel (browser) and our server (Conversions API), so Meta can
// de-duplicate the two copies.
import { PRODUCT } from './config';

const VID_KEY = 'glb_vid';
const ATTR_KEY = 'glb_attr';

export function uid(prefix = 'e') {
  const r =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${r}`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function getVisitorId() {
  try {
    let v = localStorage.getItem(VID_KEY);
    if (!v) {
      v = uid('v');
      localStorage.setItem(VID_KEY, v);
    }
    return v;
  } catch {
    window.__glbVid = window.__glbVid || uid('v');
    return window.__glbVid;
  }
}

// Remember where the visitor came from (ad campaign etc.) for this session.
export function captureAttribution() {
  try {
    const p = new URLSearchParams(location.search);
    const cur = JSON.parse(sessionStorage.getItem(ATTR_KEY) || 'null') || {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => {
      const v = p.get(k);
      if (v) cur[k] = v;
    });
    if (!cur.referrer && document.referrer) cur.referrer = document.referrer;
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(cur));
    return cur;
  } catch {
    return {};
  }
}

export function getAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getFbc() {
  const c = getCookie('_fbc');
  if (c) return c;
  const { fbclid } = getAttribution();
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

// true only the first time per browser session
export function firstTime(key) {
  try {
    const k = 'glb_once_' + key;
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, '1');
    return true;
  } catch {
    return true;
  }
}

export function pixel(name, params = {}, eventId, custom = false) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq(custom ? 'trackCustom' : 'track', name, params, eventId ? { eventID: eventId } : undefined);
    }
  } catch {}
}

export function beacon(url, payload) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return;
  } catch {}
  try {
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch {}
}

export function baseContext() {
  return {
    visitor_id: getVisitorId(),
    fbp: getCookie('_fbp'),
    fbc: getFbc(),
    url: location.href,
    attribution: getAttribution(),
  };
}

// Browser Pixel + server (Conversions API) with the same event_id.
export function trackEvent(name, params = {}, { custom = false, eventId } = {}) {
  const id = eventId || uid(name.toLowerCase());
  pixel(name, params, id, custom);
  beacon('/api/track', { event_name: name, event_id: id, params, ...baseContext() });
  return id;
}

export const productParams = (qty = 1) => ({
  content_ids: [PRODUCT.id],
  content_type: 'product',
  content_name: PRODUCT.name,
  currency: PRODUCT.currency,
  value: PRODUCT.price * qty,
  contents: [{ id: PRODUCT.id, quantity: qty, item_price: PRODUCT.price }],
});
