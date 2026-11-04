'use client';

import { useEffect, useState } from 'react';

import { Plus_Jakarta_Sans } from 'next/font/google';

import Icon, { IconName } from '@/components/Icon';
import { METHODS, MethodKey, PRAYERS, calcTimes, fmtTime, ymd } from '@/lib/prayerTimes';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface Settings {
  lat: number;
  lng: number;
  name: string;
  tz: string;
  method: MethodKey;
  hanafi: boolean;
  set: boolean;
  auto: boolean;
}
interface City {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

const KEY = 'prayer-settings';
const DEFAULTS: Settings = {
  lat: 32.569,
  lng: 74.084,
  name: 'Gujrat, Pakistan',
  tz: 'Asia/Karachi',
  method: 'karachi',
  hanafi: true,
  auto: false,
  set: false,
};

const SHORT: Record<MethodKey, string> = {
  mwl: 'MWL',
  isna: 'ISNA',
  egypt: 'Egyptian',
  makkah: 'Umm al-Qura',
  karachi: 'Karachi',
};
const META: { sub: string; icon: IconName }[] = [
  { sub: 'Dawn', icon: 'sunrise' },
  { sub: 'Shuruq • Non-prayer mark', icon: 'sun' },
  { sub: 'Midday', icon: 'sun' },
  { sub: 'Late Afternoon', icon: 'sun' },
  { sub: 'Sunset', icon: 'sunset' },
  { sub: 'Night prayer', icon: 'moon' },
];

// Fluid type scale: grows smoothly from small phones to desktop (min, preferred, max)
const HS = 'text-[length:clamp(1rem,0.9rem_+_0.45vw,1.25rem)] leading-snug font-semibold';
const LS = 'text-[length:clamp(0.65rem,0.6rem_+_0.25vw,0.8125rem)] leading-tight tracking-[0.04em] font-bold';
const BODY = 'text-[length:clamp(0.8125rem,0.75rem_+_0.3vw,1rem)]';
const BIG = 'text-[length:clamp(1.75rem,1.4rem_+_1.6vw,2.75rem)] leading-none font-bold tracking-tight';
const CD = 'text-[length:clamp(1.05rem,0.9rem_+_0.8vw,1.6rem)] font-semibold tabular-nums tracking-wider';
const SELECT = `w-full appearance-none bg-indigo-100/50 text-gray-800 ${BODY} rounded-lg px-3.5 py-3 pr-10 border border-gray-300/40 cursor-pointer focus:outline-none`;
const pad = (n: number) => String(n).padStart(2, '0');

export default function PrayerTimesPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [msg, setMsg] = useState('');

  const update = (p: Partial<Settings>) =>
    setSettings(prev => {
      const n = { ...prev, ...p };
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {}
      return n;
    });

  const locate = () => {
    if (!navigator.geolocation) return setMsg('Geolocation not supported');
    setMsg('Locating…');
    navigator.geolocation.getCurrentPosition(
      p => {
        const { latitude: a, longitude: b } = p.coords;
        update({ lat: a, lng: b, tz: '', auto: true, name: `${a.toFixed(2)}, ${b.toFixed(2)}`, set: true });
        setMsg('');
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${a}&longitude=${b}&localityLanguage=en`
        )
          .then(r => r.json())
          .then(j => {
            const n = [j.city || j.locality, j.countryName].filter(Boolean).join(', ');
            if (n) update({ name: n });
          })
          .catch(() => {});
      },
      () => setMsg('Location denied. Search your city instead.'),
      { timeout: 15000, maximumAge: 36e5 }
    );
  };

  useEffect(() => {
    let saved: Settings | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {}
    if (saved) setSettings({ ...DEFAULTS, ...saved });
    setNow(Date.now());
    setReady(true);
    const id = setInterval(() => setNow(Date.now()), 1000);
    const t = setTimeout(() => {
      if (!saved?.set) {
        try {
          locate();
        } catch {}
      }
    }, 0);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) return setResults([]);
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(searchQuery.trim())}`
        );
        const j = await r.json();
        setResults(j.results ?? []);
        setMsg(j.results?.length ? '' : 'No match');
      } catch {
        setMsg('Search needs an internet connection');
      }
    }, 350);
    return () => clearTimeout(id);
  }, [searchQuery]);

  if (!ready) return <p className="text-center text-gray-500 mt-24">Loading prayer times…</p>;

  // Yesterday + today + tomorrow, without Sunrise, to find the previous and next prayer
  const day = (off: number) =>
    calcTimes(ymd(now + off * 864e5, settings.tz), settings.lat, settings.lng, settings.method, settings.hanafi)
      .map((t, i) => ({ i, t }))
      .filter(e => e.i !== 1);
  const seq = [...day(-1), ...day(0), ...day(1)];
  const k = Math.max(
    1,
    seq.findIndex(e => e.t > now)
  );
  const nextE = seq[k];
  const prevE = seq[k - 1];
  const times = calcTimes(ymd(now, settings.tz), settings.lat, settings.lng, settings.method, settings.hanafi);

  const sec = Math.max(0, Math.round((nextE.t - now) / 1000));
  const cd = `${pad((sec / 3600) | 0)}:${pad(((sec % 3600) / 60) | 0)}:${pad(sec % 60)}`;
  const pct = Math.min(100, Math.max(0, Math.round(((now - prevE.t) / (nextE.t - prevE.t)) * 100)));

  const tz = settings.tz || undefined;
  let hijri = '';
  try {
    hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: tz,
    }).format(now);
    if (!/AH/.test(hijri)) hijri += ' AH';
  } catch {}
  let off = '';
  try {
    off = (
      new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' })
        .formatToParts(now)
        .find(p => p.type === 'timeZoneName')?.value || ''
    ).replace('GMT', 'UTC');
  } catch {}
  const city = /^-?\d/.test(settings.name) ? settings.name : settings.name.split(',')[0];
  const c = METHODS[settings.method];
  const angles = c.ishaMin
    ? `${c.fajr.toFixed(1)}° / ${c.ishaMin} min`
    : `${c.fajr.toFixed(1)}° / ${(c.isha as number).toFixed(1)}°`;

  const col = 'flex flex-col gap-4 sm:gap-5 min-w-0';

  return (
    // 1 column on phones/tablets, 2 columns (hero | schedule) from the lg breakpoint
    <main
      className={`${jakarta.className} w-full max-w-md sm:max-w-xl md:max-w-xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-4 lg:pt-8 grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-8 lg:items-start`}
    >
      <div className={col}>
        {/* Location */}
        <section className="flex flex-col gap-2">
          <div className="relative">
            <div className="relative flex items-center bg-white rounded-full shadow-sm">
              <span className="absolute left-4 text-gray-700 pointer-events-none">
                <Icon name="search" className="w-5 h-5" />
              </span>
              <input
                className={`w-full bg-transparent py-3.5 sm:py-4 pl-11 pr-11 ${BODY} placeholder:text-gray-700 focus:outline-none`}
                placeholder="Search city or country…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('');
                    setResults([]);
                  }}
                  className="absolute right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-200 text-gray-800"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              )}
            </div>
            {results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-indigo-100">
                {results.map(r => (
                  <button
                    key={r.id}
                    className={`w-full text-left px-4 py-2.5 ${BODY}`}
                    onClick={() => {
                      update({
                        lat: r.latitude,
                        lng: r.longitude,
                        tz: r.timezone || '',
                        auto: false,
                        set: true,
                        name: [r.name, r.country].filter(Boolean).join(', '),
                      });
                      setSearchQuery('');
                      setResults([]);
                    }}
                  >
                    {r.name}
                    <span className={`block ${LS} font-normal text-gray-700`}>
                      {[r.admin1, r.country].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 bg-white p-2 pr-3.5 sm:p-2.5 sm:pr-4 rounded-full shadow-sm">
            <button
              onClick={locate}
              className={`flex items-center gap-1 bg-indigo-500 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full ${BODY} font-semibold shadow-sm active:scale-95 transition-transform shrink-0`}
            >
              <Icon name="gps" className="w-[18px] h-[18px]" />
              <span>
                GPS<span className="hidden min-[380px]:inline"> location</span>
              </span>
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-800" />
              </span>
              <span className={`${LS} text-gray-800 truncate`}>
                {settings.auto ? 'Auto-detected' : 'Selected'}: {settings.name}
              </span>
            </div>
          </div>
          {msg && <p className={`text-center ${LS} font-normal text-gray-700`}>{msg}</p>}
        </section>

        {/* Hero */}
        <section className="relative overflow-hidden bg-indigo-500 text-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`${LS} text-gray-300 uppercase`}>
                {new Date(now).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: tz,
                })}
              </span>
              <span className={`${LS} px-2.5 py-0.5 rounded-full bg-white/10 shrink-0`}>Today</span>
            </div>
            {hijri && (
              <h2 className={`${HS} flex items-center gap-1.5`}>
                <span className="text-orange-400">
                  <Icon name="moon" className="w-5 h-5" fill />
                </span>
                {hijri}
              </h2>
            )}
          </div>

          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-3.5 sm:p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className={`flex items-center gap-1.5 ${LS} text-gray-300`}>
                <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" /> Next Prayer
              </span>
              <span className={`${LS} px-2 py-0.5 rounded-full bg-orange-400 text-gray-800`}>
                Adhan in {pad((sec / 3600) | 0)}h {pad(((sec % 3600) / 60) | 0)}m
              </span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 mt-2">
              <div className="flex items-baseline gap-2">
                <span className={BIG}>{PRAYERS[nextE.i]}</span>
                <span className={`${BODY} font-semibold text-gray-300`}>{fmtTime(nextE.t, settings.tz)}</span>
              </div>
              <div className="text-right">
                <span className={`${CD} text-orange-400`}>{cd}</span>
                <span className={`${LS} block text-gray-300`}>Remaining</span>
              </div>
            </div>
            <div className="mt-3">
              <div className={`${LS} flex flex-wrap justify-between gap-x-2 text-gray-300 mb-1.5`}>
                <span>
                  {PRAYERS[prevE.i]} {fmtTime(prevE.t, settings.tz)}
                </span>
                <span className="text-orange-400">{pct}% Elapsed</span>
                <span>
                  {PRAYERS[nextE.i]} {fmtTime(nextE.t, settings.tz)}
                </span>
              </div>
              <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={col}>
        {/* Daily schedule */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className={HS}>Daily Schedule</h3>
            <span className={`${LS} text-gray-800 truncate`}>
              {city}
              {off && ` • ${off}`}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {times.map((t, i) => {
              const name = PRAYERS[i];
              const isNext = nextE.i === i;
              const sun = i === 1;
              const passed = !isNext && !sun && t <= now;
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 md:p-4 rounded-xl ${
                    isNext ? 'bg-indigo-500 text-white shadow-md' : sun ? 'bg-indigo-100/75' : 'bg-white shadow-sm'
                  } ${passed ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 rounded-full flex items-center justify-center ${
                        isNext
                          ? 'bg-white/20 text-orange-400'
                          : sun
                            ? 'bg-indigo-200 text-orange-800'
                            : 'bg-indigo-100 text-gray-800'
                      }`}
                    >
                      <Icon name={META[i].icon} fill={isNext && i !== 4} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`${HS} ${isNext ? 'font-bold' : ''}`}>{name}</span>
                        {isNext && (
                          <span className={`${LS} px-2 py-0.5 rounded-full bg-orange-400 text-gray-800 uppercase`}>
                            Next
                          </span>
                        )}
                        {passed && (
                          <span className="text-indigo-500">
                            <Icon name="check" className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <span className={`${LS} font-semibold ${isNext ? 'text-gray-300' : 'text-gray-700'}`}>
                        {META[i].sub}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${HS} tabular-nums whitespace-nowrap shrink-0 ${isNext ? 'text-orange-400 font-bold' : sun ? 'text-gray-700' : ''}`}
                  >
                    {fmtTime(t, settings.tz)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Calculation settings */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className={HS}>Calculation Settings</h3>
            <span className={`${LS} text-gray-800`}>Method &amp; Asr</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-300/30 overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer list-none select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500">
                    <Icon name="sliders" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={HS}>Calculation Parameters</h4>
                    <p className={`${LS} text-gray-700 truncate`}>
                      {SHORT[settings.method]} • {settings.hanafi ? 'Hanafi' : "Shafi'i Standard"}
                    </p>
                  </div>
                </div>
                <span className="text-gray-700 transition-transform duration-200 group-open:rotate-180 shrink-0">
                  <Icon name="chevron" className="w-[22px] h-[22px]" />
                </span>
              </summary>
              <div className="px-3.5 sm:px-4 pb-4 pt-3 border-t border-indigo-200 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={`flex flex-wrap justify-between gap-x-2 ${LS}`}>
                    Calculation Method
                    <span className="text-gray-700">Angles: {angles}</span>
                  </span>
                  <select
                    className={SELECT}
                    value={settings.method}
                    onChange={e => update({ method: e.target.value as MethodKey })}
                  >
                    {Object.entries(METHODS).map(([key, v]) => (
                      <option key={key} value={key}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={`flex flex-wrap justify-between gap-x-2 ${LS}`}>
                    Asr Juristic Method
                    <span className="text-gray-700">{settings.hanafi ? 'Double Shadow' : 'Single Shadow'}</span>
                  </span>
                  <select
                    className={SELECT}
                    value={settings.hanafi ? '1' : '0'}
                    onChange={e => update({ hanafi: e.target.value === '1' })}
                  >
                    <option value="0">Standard (Shafi&apos;i, Maliki, Hanbali)</option>
                    <option value="1">Hanafi</option>
                  </select>
                </label>
                <p className="flex items-start gap-1.5 bg-indigo-100/75 p-2.5 rounded-lg text-gray-800">
                  <span className="text-indigo-500 mt-0.5 shrink-0">
                    <Icon name="info" className="w-[18px] h-[18px]" />
                  </span>
                  <span className={`${LS} font-semibold`}>
                    Times are calculated on your device, so they keep working offline.
                  </span>
                </p>
              </div>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
