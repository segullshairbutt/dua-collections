import { ReactNode, Suspense } from 'react';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Footer from 'components/Footer';
import { Navbar } from 'components/Navbar';

import 'styles/globals.css';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Quran & Masnoon Dua Collection',
  description: 'Developed for personal use',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'favicon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div className="text-center my-80"> Loading... </div>}>
          <Navbar />
          <div className="relative pt-16 pb-32 min-h-[calc(100vh_-_156px)]">{children}</div>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
