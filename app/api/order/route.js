import { NextResponse } from 'next/server';
import { PRODUCT, DELIVERY, DELIVERY_LABEL, SITE } from '@/lib/config';
import { normalizePhone, isValidPhone, toBn } from '@/lib/bn';
import { sendCapiEvent, str } from '@/lib/meta-capi';
import { saveToSheet, telegram, storageConfigured } from '@/lib/notify';

export const runtime = 'nodejs';

const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'অনুরোধটি সঠিক নয়। আবার চেষ্টা করুন।' }, { status: 400 });
  }

  // Bots fill the hidden field, people don't. Pretend success.
  if (b.company_url) return NextResponse.json({ ok: true, orderId: 'GLB-OK', total: 0 });

  const name = clean(b.name, 80);
  const address = clean(b.address, 250);
  const phone = normalizePhone(b.phone);
  const area = b.area === 'dhaka' ? 'dhaka' : b.area === 'outside' ? 'outside' : null;
  const qty = Math.min(PRODUCT.maxQty, Math.max(1, parseInt(b.qty, 10) || 1));

  const errors = {};
  if (name.length < 2) errors.name = 'আপনার নাম লিখুন।';
  if (!isValidPhone(phone)) errors.phone = '১১ সংখ্যার সঠিক মোবাইল নম্বর দিন, যেমন ০১৭১২৩৪৫৬৭৮।';
  if (address.length < 10) errors.address = 'পুরো ঠিকানা লিখুন (এলাকা, রোড, বাসা নম্বর)।';
  if (!area) errors.area = 'ডেলিভারি এলাকা বেছে নিন।';
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors, error: 'ফর্মে কিছু তথ্য ঠিক নেই।' }, { status: 422 });
  }

  // Prices are always calculated here, never trusted from the browser.
  const subtotal = PRODUCT.price * qty;
  const delivery = DELIVERY[area];
  const total = subtotal + delivery;
  const orderId = `GLB-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).toUpperCase().slice(2, 5)}`;
  const time = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

  const row = {
    status: 'ORDER',
    time,
    orderId,
    visitorId: str(b.visitor_id, 100),
    name,
    phone,
    address,
    area: DELIVERY_LABEL[area],
    qty,
    subtotal,
    delivery,
    total,
    attribution: b.attribution && typeof b.attribution === 'object' ? b.attribution : {},
  };

  const message =
    `🛒 নতুন অর্ডার ${orderId}\n` +
    `${PRODUCT.name} x ${toBn(qty)}\n` +
    `নাম: ${name}\nফোন: ${phone}\nঠিকানা: ${address}\n` +
    `এলাকা: ${DELIVERY_LABEL[area]}\nমোট: ${toBn(total)}৳ (ক্যাশ অন ডেলিভারি)`;

  const [sheet, tg] = await Promise.all([saveToSheet(row), telegram(message)]);

  // If saving is set up but every channel failed, tell the customer instead of losing the order silently.
  if (storageConfigured() && !sheet.ok && !tg.ok) {
    return NextResponse.json(
      { ok: false, error: `অর্ডার জমা হয়নি। আবার চেষ্টা করুন অথবা ${toBn(SITE.phone)} নম্বরে কল করুন।` },
      { status: 502 }
    );
  }

  // Server-side Purchase. Same event_id as the browser Pixel so Meta counts it once.
  await sendCapiEvent({
    name: 'Purchase',
    eventId: str(b.event_id, 100) || `purchase_${orderId}`,
    url: str(b.url),
    headers: req.headers,
    fbp: str(b.fbp, 200),
    fbc: str(b.fbc, 200),
    visitorId: row.visitorId,
    phone: `88${phone}`,
    customData: {
      value: total,
      currency: PRODUCT.currency,
      content_ids: [PRODUCT.id],
      content_type: 'product',
      contents: [{ id: PRODUCT.id, quantity: qty, item_price: PRODUCT.price }],
      num_items: qty,
      order_id: orderId,
    },
  });

  return NextResponse.json({ ok: true, orderId, total });
}
