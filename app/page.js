import Image from 'next/image';
import PageTracker from '@/components/PageTracker';
import TrackedLink from '@/components/TrackedLink';
import NoiseDemo from '@/components/NoiseDemo';
import OrderForm from '@/components/OrderForm';
import StickyBar from '@/components/StickyBar';
import { SITE, PRODUCT, DELIVERY } from '@/lib/config';
import { taka, toBn } from '@/lib/bn';

const features = [
  ['ANC + ENC নয়েজ কন্ট্রোল', 'ANC বাইরের শব্দ কমায়, ENC কলের সময় আপনার কণ্ঠ পরিষ্কার রাখে। প্যাকেজ অনুযায়ী ৪টি মাইক্রোফোন আছে।'],
  ['অ্যাপ সাপোর্ট', 'অ্যাপ থেকে EQ সাউন্ড টিউন করুন, টাচ কন্ট্রোল নিজের মতো সাজান, ফার্মওয়্যার আপডেট করুন।'],
  ['ব্লুটুথ ৫.৪', 'দ্রুত কানেকশন, স্থিতিশীল সংযোগ আর গেম ও ভিডিওর জন্য লো-ল্যাটেন্সি পারফরম্যান্স।'],
  ['হল সুইচ', 'কেস খুললেই ইয়ারবাড অটো পাওয়ার-অন হয়। আলাদা করে বাটন চাপতে হয় না।'],
  ['টাচ কন্ট্রোল ও ভয়েস অ্যাসিস্ট্যান্ট', 'গান চালানো, কল ধরা আর ভয়েস অ্যাসিস্ট্যান্ট ডাকা যায় ইয়ারবাডে ছুঁয়েই।'],
  ['আরামদায়ক ফিট', 'একাধিক ইয়ারটিপ দিয়ে নিজের কানের মাপ বেছে নিন, লম্বা সময় পরেও স্বস্তি।'],
];

const specs = [
  ['মডেল', 'Hoco EQ34 Plus'],
  ['ব্লুটুথ ভার্সন', '৫.৪'],
  ['নয়েজ কন্ট্রোল', 'ANC + ENC'],
  ['ইয়ারবাডের ব্যাটারি', '৭ ঘণ্টা পর্যন্ত মিউজিক প্লেব্যাক'],
  ['কেস সহ মোট', '২৮ ঘণ্টা (প্যাকেজে উল্লেখিত)'],
  ['কেস চার্জিং', 'টাইপ-সি'],
  ['অ্যাপ সাপোর্ট', 'EQ টিউনিং, কন্ট্রোল ম্যাপিং, ফার্মওয়্যার আপডেট'],
  ['অন্যান্য', 'হল সুইচ, ভয়েস অ্যাসিস্ট্যান্ট, টাচ কন্ট্রোল'],
];

const inBox = ['ওয়্যারলেস ইয়ারবাড', 'চার্জিং কেস', 'ইয়ারটিপ', 'টাইপ-সি কেবল', 'ইউজার ম্যানুয়াল'];

const faqs = [
  ['কোন কোন ডিভাইসের সাথে চলবে?', 'ব্লুটুথ সাপোর্ট করে এমন ফোন, ট্যাব ও ল্যাপটপের সাথে কানেক্ট করা যায়।'],
  ['অ্যাপ দিয়ে কী কী করা যায়?', 'EQ সাউন্ড টিউনিং, কন্ট্রোল ম্যাপিং আর ফার্মওয়্যার আপডেট করা যায়।'],
  ['ব্যাটারি কতক্ষণ চলে?', 'ইয়ারবাডে ৭ ঘণ্টা পর্যন্ত গান চলে। চার্জিং কেস সহ মোট ২৮ ঘণ্টা, কেস চার্জ হয় টাইপ-সি দিয়ে।'],
  ['ডেলিভারি চার্জ কত, টাকা কীভাবে দেব?', `ঢাকার ভেতরে ${taka(DELIVERY.dhaka)}, ঢাকার বাইরে ${taka(DELIVERY.outside)}। পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে টাকা দিন।`],
  ['কীভাবে অর্ডার করব?', `এই পেজের ফর্ম পূরণ করে "অর্ডার নিশ্চিত করুন" চাপুন, অথবা ${toBn(SITE.phone)} নম্বরে কল করুন।`],
];

export default function Home() {
  const phoneText = toBn(SITE.phone);
  const off = PRODUCT.originalPrice - PRODUCT.price;

  return (
    <>
      <PageTracker />

      <header className="topbar">
        <div className="wrap topbar-in">
          <span className="brand">{SITE.name}</span>
          <TrackedLink href={`tel:${SITE.phone}`} className="topbar-call" event="Contact" params={{ label: 'header_call' }}>
            কল করুন {phoneText}
          </TrackedLink>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1>আশপাশের শব্দ কমিয়ে শুনুন শুধু নিজের গান</h1>
              <p className="lead">
                Hoco EQ34 Plus রিমা ANC+ENC ওয়্যারলেস ইয়ারবাড। ব্লুটুথ ৫.৪, ৭ ঘণ্টা প্লেব্যাক আর অ্যাপ দিয়ে সাউন্ড ও কন্ট্রোল সেটিং।
              </p>

              <div className="price">
                <span className="price-now">{taka(PRODUCT.price)}</span>
                <s className="price-old">{taka(PRODUCT.originalPrice)}</s>
                <span className="save">{taka(off)} ছাড়</span>
              </div>

              <div className="cta-row">
                <TrackedLink href="#order" className="btn" event="CTAClick" custom params={{ label: 'hero_order' }}>
                  অর্ডার করুন
                </TrackedLink>
                <TrackedLink href={`tel:${SITE.phone}`} className="btn btn-ghost" event="Contact" params={{ label: 'hero_call' }}>
                  কল করুন
                </TrackedLink>
              </div>

              <ul className="trust">
                <li>ক্যাশ অন ডেলিভারি</li>
                <li>সারা বাংলাদেশে ডেলিভারি</li>
                <li>হোকো ব্র্যান্ড</li>
              </ul>
            </div>

            <figure className="hero-img">
              <Image
                src="/images/eq34-plus.png"
                alt="Hoco EQ34 Plus ANC+ENC TWS ইয়ারবাডের বক্সের সামনে ও পেছনের ছবি"
                width={1080}
                height={1080}
                priority
                sizes="(min-width: 860px) 520px, 100vw"
              />
            </figure>
          </div>
        </section>

        <section className="section section-dark">
          <div className="wrap split">
            <div>
              <h2>ANC চালু করলে কী বদলায়, নিজে দেখুন</h2>
              <p className="muted-on-dark">
                ANC আপনার কানে আসা বাইরের শব্দ কমায়। ENC কলের সময় আপনার কণ্ঠ থেকে আশপাশের আওয়াজ আলাদা করে, তাই অপর পাশের মানুষ পরিষ্কার শোনে।
              </p>
            </div>
            <NoiseDemo />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>যা যা পাচ্ছেন</h2>
            <ul className="rows">
              {features.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-foam">
          <div className="wrap split split-top">
            <div>
              <h2>স্পেসিফিকেশন</h2>
              <dl className="specs">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2>বক্সে যা থাকছে</h2>
              <ul className="box-list">
                {inBox.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap narrow">
            <h2>সাধারণ প্রশ্ন</h2>
            <div className="faq">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-foam" id="order">
          <div className="wrap narrow">
            <h2>অর্ডার করতে ফর্মটি পূরণ করুন</h2>
            <p className="order-price">
              <s>{taka(PRODUCT.originalPrice)}</s> <strong>{taka(PRODUCT.price)}</strong> <span>অফার প্রাইস</span>
            </p>
            <OrderForm />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <p>© {SITE.name}</p>
          <TrackedLink href={`tel:${SITE.phone}`} event="Contact" params={{ label: 'footer_call' }}>
            {phoneText}
          </TrackedLink>
        </div>
      </footer>

      <StickyBar />
    </>
  );
}
