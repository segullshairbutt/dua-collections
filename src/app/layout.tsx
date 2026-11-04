import { ReactNode, Suspense } from 'react';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Footer from '@/components/Footer';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { Navbar } from '@/components/navbar';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Quran & Masnoon Dua Collection',
  description: 'Developed for personal use',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Duas' },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'favicon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegister />
        <Suspense fallback={<div className="text-center my-80"> Loading... </div>}>
          <Navbar />
          <div className="relative pt-16 pb-32 min-h-[calc(100vh_-_156px)]">{children}</div>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
