import { NextResponse } from 'next/server';
import { PRODUCT, DELIVERY, DELIVERY_LABEL } from '@/lib/config';
import { normalizePhone, isValidPhone, toBn } from '@/lib/bn';
import { sendCapiEvent, str } from '@/lib/meta-capi';
import { saveToSheet, telegram } from '@/lib/notify';

export const runtime = 'nodejs';

const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Called (often via sendBeacon) when someone typed a valid phone number but has not ordered yet.
export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const phone = normalizePhone(b.phone);
  if (!isValidPhone(phone) || b.company_url) return new NextResponse(null, { status: 204 });

  const area = b.area === 'outside' ? 'outside' : 'dhaka';
  const qty = Math.min(PRODUCT.maxQty, Math.max(1, parseInt(b.qty, 10) || 1));
  const subtotal = PRODUCT.price * qty;
  const delivery = DELIVERY[area];
  const name = clean(b.name, 80);
  const address = clean(b.address, 250);

  // The sheet script keeps ONE row per visitor and updates it as they type more.
  await saveToSheet({
    status: 'INCOMPLETE',
    time: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
    orderId: '',
    visitorId: str(b.visitor_id, 100),
    name,
    phone,
    address,
    area: DELIVERY_LABEL[area],
    qty,
    subtotal,
    delivery,
    total: subtotal + delivery,
    attribution: b.attribution && typeof b.attribution === 'object' ? b.attribution : {},
  });

  if (b.first) {
    await Promise.all([
      telegram(`⚠️ অসম্পূর্ণ অর্ডার\nফোন: ${phone}${name ? `\nনাম: ${name}` : ''}\n${PRODUCT.name} x ${toBn(qty)}\nফর্ম শেষ করেনি, কল করে ফলো-আপ করুন।`),
      sendCapiEvent({
        name: 'IncompleteOrder',
        eventId: str(b.event_id, 100) || `incomplete_${Date.now()}`,
        url: str(b.url),
        headers: req.headers,
        fbp: str(b.fbp, 200),
        fbc: str(b.fbc, 200),
        visitorId: str(b.visitor_id, 100),
        phone: `88${phone}`,
        customData: {
          value: subtotal,
          currency: PRODUCT.currency,
          content_ids: [PRODUCT.id],
          content_type: 'product',
          num_items: qty,
        },
      }),
    ]);
  }

  return new NextResponse(null, { status: 204 });
}
