'use client';

import { Fragment, useEffect, useState } from 'react';

import { pad } from '@/lib/prayerTimes';

interface CountdownTimerProps {
  nextTime: number;
  prevTime: number;
  onTick?: (now: number, sec: number, pct: number) => void;
}

export default function CountdownTimer({ nextTime, prevTime, onTick }: CountdownTimerProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sec = Math.max(0, Math.round((nextTime - now) / 1000));
  const totalDuration = Math.max(1, nextTime - prevTime);
  const elapsed = Math.max(0, now - prevTime);
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  const hours = pad((sec / 3600) | 0);
  const minutes = pad(((sec % 3600) / 60) | 0);
  const seconds = pad(sec % 60);

  useEffect(() => {
    onTick?.(now, sec, pct);
  }, [now, sec, pct, onTick]);

  return (
    <Fragment>
      <span className="text-[length:clamp(0.65rem,0.6rem_+_0.25vw,0.8125rem)] leading-tight tracking-[0.04em] font-bold px-2 py-0.5 rounded-full bg-orange-400 text-gray-800">
        Adhan in {hours}h {minutes}m
      </span>
      <div className="text-right">
        <span className="text-[length:clamp(1.05rem,0.9rem_+_0.8vw,1.6rem)] font-semibold tabular-nums tracking-wider text-orange-400">
          {hours}:{minutes}:{seconds}
        </span>
        <span className="text-[length:clamp(0.65rem,0.6rem_+_0.25vw,0.8125rem)] leading-tight tracking-[0.04em] font-bold block text-gray-300">
          Remaining
        </span>
      </div>
    </Fragment>
  );
}
