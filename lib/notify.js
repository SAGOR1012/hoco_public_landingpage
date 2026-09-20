// Server-side: where orders / incomplete orders are saved and announced.

export function storageConfigured() {
  return Boolean(process.env.ORDER_WEBHOOK_URL || (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID));
}

export async function saveToSheet(row) {
  const url = process.env.ORDER_WEBHOOK_URL;
  if (!url) {
    console.log('[ORDER_WEBHOOK_URL not set] ', JSON.stringify(row));
    return { skipped: true };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.ORDER_WEBHOOK_SECRET, ...row }),
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) console.error('[sheet] status', res.status);
    return { ok: res.ok };
  } catch (e) {
    console.error('[sheet] failed', e);
    return { ok: false };
  }
}

export async function telegram(text) {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  const c = process.env.TELEGRAM_CHAT_ID;
  if (!t || !c) return { skipped: true };
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c, text }),
      cache: 'no-store',
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('[telegram] failed', e);
    return { ok: false };
  }
}
