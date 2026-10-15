import Link from 'next/link';
import { SITE } from '@/lib/config';
import { toBn } from '@/lib/bn';

export const metadata = {
  title: `অর্ডার সম্পন্ন | ${SITE.name}`,
  robots: { index: false },
};

export default async function ThankYou({ searchParams }) {
  const { order } = await searchParams;

  return (
    <main className='thanks'>
      <div className='wrap narrow'>
        <h1>আপনার অর্ডার পেয়েছি, ধন্যবাদ</h1>
        {order && (
          <p className='thanks-id'>
            অর্ডার নম্বর: <strong>{String(order).slice(0, 20)}</strong>
          </p>
        )}
        <p>
          পণ্য হাতে পেয়ে টাকা দিন। প্রয়োজনে আমাদের প্রতিনিধি আপনার দেওয়া
          নম্বরে যোগাযোগ করতে পারেন । .
        </p>
        <p>
          কিছু জানার থাকলে কল করুন:{' '}
          <a href={`tel:${SITE.phone}`}>{toBn(SITE.phone)}</a>
        </p>
        <Link
          href='/'
          className='btn btn-ghost'>
          পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
