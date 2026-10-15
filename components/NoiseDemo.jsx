'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/tracking-client';

const BARS = [46, 72, 58, 90, 34, 82, 64, 96, 42, 78, 55, 88, 38, 70, 60, 92, 48, 76, 52, 86, 36, 74, 62, 94, 44, 80, 56, 84];

export default function NoiseDemo() {
  const [on, setOn] = useState(false);

  return (
    <div className="demo">
      <div className="demo-bars" aria-hidden="true">
        {BARS.map((h, i) => (
          <span key={i} style={{ height: `${h}%`, transform: `scaleY(${on ? 0.12 : 1})` }} />
        ))}
      </div>
      <div className="demo-row">
        <p className="demo-caption" aria-live="polite">
          {on
            ? 'ANC চালু: আশপাশের শব্দ অনেকটাই কমে যায়, আপনার গান থাকে সামনে।'
            : 'ANC বন্ধ: বাসের হর্ন, ফ্যান আর ভিড়ের শব্দ সরাসরি কানে আসে।'}
        </p>
        <button
          type="button"
          className="toggle"
          aria-pressed={on}
          onClick={() => {
            setOn((v) => !v);
            trackEvent('ANCDemo', { state: on ? 'off' : 'on' }, { custom: true });
          }}
        >
          {on ? 'ANC বন্ধ করুন' : 'ANC চালু করুন'}
        </button>
      </div>
      <p className="demo-note">ছবিটি ধারণা দেওয়ার জন্য, আসল ডেসিবেল মাপ নয়।</p>
    </div>
  );
}
