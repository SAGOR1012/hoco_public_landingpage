'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCT, DELIVERY, SITE } from '@/lib/config';
import { taka, toBn, isValidPhone } from '@/lib/bn';
import { trackEvent, pixel, beacon, baseContext, uid, firstTime, productParams } from '@/lib/tracking-client';

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'আপনার নাম লিখুন।';
  if (!isValidPhone(f.phone)) e.phone = '১১ সংখ্যার সঠিক মোবাইল নম্বর দিন, যেমন ০১৭১২৩৪৫৬৭৮।';
  if (f.address.trim().length < 10) e.address = 'পুরো ঠিকানা লিখুন (এলাকা, রোড, বাসা নম্বর)।';
  return e;
}

export default function OrderForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '', area: 'dhaka', qty: 1 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending
  const [serverError, setServerError] = useState('');

  const formRef = useRef(form);
  formRef.current = form;
  const lastSent = useRef('');
  const ordered = useRef(false);

  const subtotal = PRODUCT.price * form.qty;
  const delivery = DELIVERY[form.area];
  const total = subtotal + delivery;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // 1) First time the customer touches the form
  function onStart() {
    if (firstTime('checkout')) trackEvent('InitiateCheckout', productParams(formRef.current.qty));
  }

  // 2) Incomplete order: valid phone typed, no order placed
  function flushIncomplete() {
    const f = formRef.current;
    if (ordered.current || !isValidPhone(f.phone)) return;
    const snapshot = JSON.stringify(f);
    if (snapshot === lastSent.current) return;
    lastSent.current = snapshot;

    const first = firstTime('incomplete');
    const eventId = first ? uid('incomplete') : undefined;
    if (first) pixel('IncompleteOrder', productParams(f.qty), eventId, true);
    beacon('/api/incomplete', { ...baseContext(), first, event_id: eventId, ...f });
  }

  // save shortly after they stop typing
  useEffect(() => {
    if (!isValidPhone(form.phone)) return;
    const t = setTimeout(flushIncomplete, 2000);
    return () => clearTimeout(t);
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  // save when they leave the tab or close the page
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushIncomplete();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushIncomplete);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushIncomplete);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Purchase
  async function onSubmit(ev) {
    ev.preventDefault();
    if (status === 'sending') return;

    const e = validate(form);
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.getElementById('f-' + firstKey)?.focus();
      return;
    }

    setStatus('sending');
    setServerError('');
    const eventId = uid('purchase');
    const honeypot = new FormData(ev.currentTarget).get('company_url') || '';

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company_url: honeypot, event_id: eventId, ...baseContext() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setErrors(data.errors || {});
        setServerError(data.error || 'অর্ডার জমা হয়নি। আবার চেষ্টা করুন।');
        setStatus('idle');
        return;
      }

      ordered.current = true;
      pixel('Purchase', { ...productParams(form.qty), value: data.total, num_items: form.qty, order_id: data.orderId }, eventId);
      router.push(`/thank-you?order=${encodeURIComponent(data.orderId)}`);
    } catch {
      setServerError(`ইন্টারনেট সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা ${toBn(SITE.phone)} নম্বরে কল করুন।`);
      setStatus('idle');
    }
  }

  const sending = status === 'sending';

  return (
    <form className="form" onSubmit={onSubmit} onFocus={onStart} noValidate>
      <div className="field">
        <label htmlFor="f-name">আপনার নাম</label>
        <input
          id="f-name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'e-name' : undefined}
        />
        {errors.name && <p className="err" id="e-name">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-phone">মোবাইল নম্বর</label>
        <input
          id="f-phone"
          type="tel"
          inputMode="numeric"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'e-phone' : undefined}
        />
        {errors.phone && <p className="err" id="e-phone">{errors.phone}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-address">পুরো ঠিকানা</label>
        <textarea
          id="f-address"
          rows={3}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          autoComplete="street-address"
          placeholder="বাসা/হোল্ডিং, রোড, এলাকা, থানা, জেলা"
          aria-invalid={Boolean(errors.address)}
          aria-describedby={errors.address ? 'e-address' : undefined}
        />
        {errors.address && <p className="err" id="e-address">{errors.address}</p>}
      </div>

      <fieldset className="field choices">
        <legend>ডেলিভারি এলাকা</legend>
        {[
          ['dhaka', 'ঢাকার ভেতরে'],
          ['outside', 'ঢাকার বাইরে'],
        ].map(([value, label]) => (
          <label key={value} className={`choice${form.area === value ? ' on' : ''}`}>
            <input type="radio" name="area" value={value} checked={form.area === value} onChange={() => set('area', value)} />
            <span>{label}</span>
            <b>{taka(DELIVERY[value])}</b>
          </label>
        ))}
      </fieldset>

      <div className="field qty">
        <span id="qty-label">পরিমাণ</span>
        <div className="stepper" role="group" aria-labelledby="qty-label">
          <button type="button" aria-label="কমান" disabled={form.qty <= 1} onClick={() => set('qty', form.qty - 1)}>−</button>
          <output aria-live="polite">{toBn(form.qty)}</output>
          <button type="button" aria-label="বাড়ান" disabled={form.qty >= PRODUCT.maxQty} onClick={() => set('qty', form.qty + 1)}>+</button>
        </div>
      </div>

      {/* Hidden trap for bots. Real people never see or fill it. */}
      <input className="hp" type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <dl className="sum">
        <div><dt>পণ্যের দাম</dt><dd>{taka(subtotal)}</dd></div>
        <div><dt>ডেলিভারি চার্জ</dt><dd>{taka(delivery)}</dd></div>
        <div className="sum-total"><dt>মোট (ক্যাশ অন ডেলিভারি)</dt><dd>{taka(total)}</dd></div>
      </dl>

      {serverError && <p className="err err-box" role="alert">{serverError}</p>}

      <button className="btn btn-block" type="submit" disabled={sending}>
        {sending ? 'অর্ডার জমা হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
      </button>
      <p className="hint">পণ্য হাতে পেয়ে টাকা দিন। আগে কোনো পেমেন্ট লাগবে না।</p>
    </form>
  );
}
