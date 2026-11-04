import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prayer Times',
  description: 'Accurate prayer times calculated on your device.',
};

export default function PrayerTimesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
