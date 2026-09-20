import './globals.css';
import Script from 'next/script';
import { Anek_Bangla, Hind_Siliguri } from 'next/font/google';
import { SITE } from '@/lib/config';

const display = Anek_Bangla({ subsets: ['bengali', 'latin'], variable: '--font-display', display: 'swap' });
const body = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: `Hoco EQ34 Plus রিমা ANC+ENC ইয়ারবাড | ${SITE.name}`,
  description:
    'ANC ও ENC নয়েজ কন্ট্রোল, ব্লুটুথ ৫.৪, ৭ ঘণ্টা প্লেব্যাক আর অ্যাপ সাপোর্ট। অফার প্রাইস মাত্র ৮০০৳। ক্যাশ অন ডেলিভারি।',
  openGraph: {
    title: 'Hoco EQ34 Plus রিমা ANC+ENC ইয়ারবাড',
    description: 'অফার প্রাইস ৮০০৳। ক্যাশ অন ডেলিভারি।',
    images: ['/images/eq34-plus.png'],
    locale: 'bn_BD',
    type: 'website',
  },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A7C66' };

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable}`}>
      <body>
        {PIXEL_ID && (
          <Script id="meta-pixel" strategy="beforeInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');`}
          </Script>
        )}
        {children}
      </body>
    </html>
  );
}
