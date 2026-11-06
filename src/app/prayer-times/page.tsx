'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Plus_Jakarta_Sans } from 'next/font/google';

import CountdownTimer from '@/components/CountdownTimer';
import Icon, { IconName } from '@/components/Icon';
import {
  City,
  METHODS,
  MethodKey,
  PRAYERS,
  Settings,
  calcTimes,
  fmtTime,
  hm,
  reverseGeocode,
  ymd,
} from '@/lib/prayerTimes';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });
const STORAGE_KEY = 'prayer-settings';

const DEFAULTS: Settings = {
  lat: 32.569,
  lng: 74.084,
  offsets: [0, 0, 0, 0, 0, 0],
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
  diyanet: 'Diyanet / DİTİB',
};

const META: readonly { readonly sub: string; readonly icon: IconName }[] = [
  { sub: 'Dawn', icon: 'sunrise' },
  { sub: 'Shuruq • Non-prayer mark', icon: 'sun' },
  { sub: 'Midday', icon: 'sun' },
  { sub: 'Late Afternoon', icon: 'sun' },
  { sub: 'Sunset', icon: 'sunset' },
  { sub: 'Night prayer', icon: 'moon' },
];

// A prayer is "current" from its start until: Fajr→Sunrise, Dhuhr→Asr, Asr→Maghrib, Maghrib→Isha, Isha→next Fajr.
// Between Sunrise and Dhuhr no prayer is current.
const WINDOW_PRAYERS = [0, 2, 3, 4, 5] as const;
const END_IDX: Record<number, number> = { 0: 1, 2: 3, 3: 4, 4: 5 };
const ENDS = ['Sunrise', '', 'Asr', 'Maghrib', 'Isha', 'Fajr'] as const;

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

/** Reads numeric parts only: some phones return wrong month names/eras (e.g. "May 26, 1448 BC") for the Islamic calendar. */
function hijriDate(ms: number, tz?: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: tz,
    }).formatToParts(ms);
    const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '', 10);
    const d = get('day');
    const m = get('month');
    const y = get('year');
    if (d >= 1 && d <= 30 && m >= 1 && m <= 12 && y > 1300 && y < 1600) return `${d} ${HIJRI_MONTHS[m - 1]} ${y} AH`;
  } catch {}
  return '';
}

const HS = 'text-[length:clamp(1rem,0.9rem_+_0.45vw,1.25rem)] leading-snug font-semibold';
const LS = 'text-[length:clamp(0.65rem,0.6rem_+_0.25vw,0.8125rem)] leading-tight tracking-[0.04em] font-bold';
const BODY = 'text-[length:clamp(0.8125rem,0.75rem_+_0.3vw,1rem)]';
const BIG = 'text-[length:clamp(1.75rem,1.4rem_+_1.6vw,2.75rem)] leading-none font-bold tracking-tight';
const SELECT = `w-full appearance-none bg-indigo-50/80 text-gray-800 ${BODY} rounded-lg px-3.5 py-3 pr-10 border border-indigo-200/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500`;

export default function PrayerTimesPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [feedback, setFeedback] = useState('');
  const [liveNow, setLiveNow] = useState<number>(() => Date.now());
  const [livePct, setLivePct] = useState<number>(0);

  const update = useCallback((p: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...p };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save settings to localStorage:', err);
      }
      return next;
    });
  }, []);

  const handleTick = useCallback((n: number, _s: number, p: number) => {
    setLiveNow(n);
    setLivePct(p);
  }, []);

  // Auto-clear feedback after 7 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 7000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Debounced Search with AbortController
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(searchQuery.trim())}`,
          { signal: controller.signal }
        );
        const j = await r.json();
        setResults(j.results ?? []);
        setFeedback(j.results?.length ? '' : 'No match');
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setFeedback('Search needs an internet connection');
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  const handleGeoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setFeedback('Geolocation is not supported by your browser');
      return;
    }

    setFeedback('Locating…');

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude: lat, longitude: lng } = position.coords;
        update({
          lat,
          lng,
          tz: '',
          auto: true,
          name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
          set: true,
        });

        setFeedback('Fetching location name…');
        const resolvedName = await reverseGeocode(lat, lng);
        if (resolvedName) update({ name: resolvedName });
        setFeedback('');
      },
      error => {
        const errorMsg =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Please search your city manually.'
            : 'Unable to retrieve your location.';
        setFeedback(errorMsg);
      },
      { timeout: 15000, maximumAge: 36e5 }
    );
  }, [update]);

  useEffect(() => {
    let saved: Settings | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to read settings from localStorage:', err);
    }

    if (saved) setSettings(prev => ({ ...prev, ...saved }));
    setReady(true);

    // Trigger auto-geolocation if settings haven't been configured yet
    if (!saved?.set && typeof window !== 'undefined' && navigator.geolocation) {
      handleGeoLocation();
    }
  }, [handleGeoLocation]);

  // All six times (incl. Sunrise) for a day relative to today
  const timesFor = useCallback(
    (offDays: number) =>
      calcTimes(
        ymd(liveNow + offDays * 864e5, settings.tz),
        settings.lat,
        settings.lng,
        settings.method,
        settings.hanafi,
        settings.offsets
      ),
    [liveNow, settings.tz, settings.lat, settings.lng, settings.method, settings.hanafi, settings.offsets]
  );

  const times = useMemo(() => timesFor(0), [timesFor]);

  // Yesterday + today + tomorrow without Sunrise: used to find the next prayer
  const seq = useMemo(
    () =>
      [-1, 0, 1].flatMap(o =>
        timesFor(o)
          .map((t, i) => ({ i, t }))
          .filter(e => e.i !== 1)
      ),
    [timesFor]
  );
  const k = useMemo(
    () =>
      Math.max(
        1,
        seq.findIndex(e => e.t > liveNow)
      ),
    [seq, liveNow]
  );
  const nextE = seq[k] || seq[1];

  // The prayer whose window we are inside right now (if any)
  const cur = useMemo(() => {
    const tomorrowFajr = timesFor(1)[0];
    const windows = (
      [
        [timesFor(-1), times[0]],
        [times, tomorrowFajr],
      ] as [number[], number][]
    ).flatMap(([t, nextFajr]) =>
      WINDOW_PRAYERS.map(i => ({ i, start: t[i], end: i === 5 ? nextFajr : t[END_IDX[i]] }))
    );
    return windows.find(w => w.start <= liveNow && liveNow < w.end);
  }, [timesFor, times, liveNow]);

  const tz = settings.tz || undefined;
  const hijri = useMemo(() => hijriDate(liveNow, tz), [liveNow, tz]);

  const off = useMemo(() => {
    try {
      return (
        new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' })
          .formatToParts(liveNow)
          .find(p => p.type === 'timeZoneName')?.value || ''
      ).replace('GMT', 'UTC');
    } catch {
      return '';
    }
  }, [liveNow, tz]);

  const city = /^-?\d/.test(settings.name) ? settings.name : settings.name.split(',')[0];
  const c = METHODS[settings.method];
  const angles = c.ishaMin
    ? `${c.fajr.toFixed(1)}° / ${c.ishaMin} min`
    : `${c.fajr.toFixed(1)}° / ${(c.isha as number).toFixed(1)}°`;
  const col = 'flex flex-col gap-4 sm:gap-5 min-w-0';

  // Hero: count down to the END of the current prayer window, or to the next prayer when none is current
  const target = cur ? cur.end : nextE.t;
  const from = cur ? cur.start : times[1];
  const secLeft = Math.max(0, Math.round((target - liveNow) / 1000));
  const endingSoon = !!cur && secLeft < 30 * 60;
  const secNext = Math.max(0, Math.round((nextE.t - liveNow) / 1000));
  const nextIsTomorrow = ymd(nextE.t, settings.tz)[2] !== ymd(liveNow, settings.tz)[2];
  const startedYesterday = !!cur && ymd(cur.start, settings.tz)[2] !== ymd(liveNow, settings.tz)[2];

  if (!ready) return <p className="text-center text-indigo-600 font-medium mt-24">Loading prayer times…</p>;

  return (
    <main
      className={`${jakarta.className} w-full max-w-md sm:max-w-xl md:max-w-xl lg:max-w-5xl mx-auto px-4 sm:px-6 grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-8 lg:items-start text-gray-900`}
    >
      <div className={col}>
        {/* Location Section */}
        <section className="flex flex-col gap-2">
          <div className="relative">
            <div className="relative flex items-center bg-white rounded-full shadow-sm border border-indigo-100">
              <span className="absolute left-4 text-indigo-500 pointer-events-none">
                <Icon name="search" className="w-5 h-5" />
              </span>
              <input
                className={`w-full bg-transparent py-3.5 sm:py-4 pl-11 pr-11 ${BODY} text-gray-800 placeholder:text-gray-400 focus:outline-none`}
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
                  className="absolute right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              )}
            </div>
            {results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden divide-y divide-indigo-50 border border-indigo-100">
                {results.map(r => (
                  <button
                    key={r.id}
                    className={`w-full text-left px-4 py-3 ${BODY} hover:bg-indigo-50/60 transition-colors`}
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
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    <span className={`block ${LS} font-normal text-gray-500`}>
                      {[r.admin1, r.country].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 bg-white p-2 pr-3.5 sm:p-2.5 sm:pr-4 rounded-full shadow-sm border border-indigo-100/60">
            <button
              onClick={handleGeoLocation}
              className={`flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full ${BODY} font-semibold shadow-sm active:scale-95 transition-all shrink-0`}
            >
              <Icon name="gps" className="w-[18px] h-[18px]" />
              <span>
                GPS<span className="hidden min-[380px]:inline"> location</span>
              </span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <span className={`${LS} text-gray-700 truncate font-medium`}>
                {settings.auto ? 'Auto-detected' : 'Selected'}:{' '}
                <strong className="text-gray-900 font-semibold">{settings.name}</strong>
              </span>
            </div>
          </div>
          {feedback && <p className={`text-center ${LS} font-medium text-indigo-600`}>{feedback}</p>}
        </section>

        {/* Hero Section: current prayer window if one is active, otherwise the next prayer */}
        <section className="relative overflow-hidden bg-indigo-600 text-white rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col gap-4">
          {/* Top Row: Date & Hijri & Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className={`${LS} text-indigo-200 uppercase tracking-wider`}>
                {new Date(liveNow).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: tz,
                })}
              </span>
              {hijri && (
                <h2 className={`${HS} flex items-center gap-1.5 text-indigo-50 font-semibold`}>
                  <span className="text-orange-400">
                    <Icon name="moon" className="w-4 h-4" fill />
                  </span>
                  {hijri}
                </h2>
              )}
            </div>
            <span className={`${LS} px-3 py-1 rounded-full bg-white/15 text-white font-bold tracking-wide shrink-0`}>
              Today
            </span>
          </div>

          {/* Main Countdown & Active Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10 flex flex-col gap-3">
            {/* State label & live timer */}
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-flex items-center gap-2 ${LS} px-3 py-1 rounded-full bg-white/15 text-indigo-100 font-bold uppercase tracking-wider`}
              >
                <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                {cur ? 'Prayer time now' : 'Fajr ended'}
              </span>
              <CountdownTimer
                nextTime={target}
                prevTime={from}
                badge={endingSoon ? 'Ending soon' : undefined}
                caption={cur ? 'Time left' : `Until ${PRAYERS[nextE.i]}`}
                urgent={endingSoon}
                onTick={handleTick}
              />
            </div>

            {/* Prayer name + the time that matters (end of window, or start of next prayer) */}
            <div className="flex items-end justify-between gap-2 pt-1">
              <div className="flex flex-col gap-1 min-w-0">
                <span className={BIG}>{PRAYERS[cur ? cur.i : nextE.i]}</span>
                <span className={`${LS} text-indigo-200 font-medium`}>
                  {cur
                    ? `Started ${fmtTime(cur.start, settings.tz)}${startedYesterday ? ' (yesterday)' : ''}`
                    : 'Next prayer'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className={`${LS} block text-indigo-200 font-medium`}>
                  {cur ? `Until ${ENDS[cur.i]}` : nextIsTomorrow ? 'Starts tomorrow' : 'Starts at'}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-orange-300 tabular-nums">
                  {fmtTime(target, settings.tz)}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className={`${LS} flex justify-between gap-2 text-indigo-200 font-medium`}>
                <span>
                  {cur ? PRAYERS[cur.i] : 'Sunrise'} ({fmtTime(from, settings.tz)})
                </span>
                <span className="text-orange-300 font-bold">{livePct}% Elapsed</span>
              </div>
              <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${livePct}%` }}
                />
              </div>
            </div>

            {/* While a prayer is current, still show what comes next */}
            {cur && (
              <p
                className={`${LS} flex flex-wrap justify-between gap-x-2 pt-3 border-t border-white/15 text-indigo-200 font-medium`}
              >
                <span>
                  Next: <span className="text-white font-bold">{PRAYERS[nextE.i]}</span> {fmtTime(nextE.t, settings.tz)}
                  {nextIsTomorrow ? ' (tomorrow)' : ''}
                </span>
                <span>in {hm(secNext)}</span>
              </p>
            )}
          </div>
        </section>
      </div>

      <div className={col}>
        {/* Daily Schedule */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className={HS}>Daily Schedule</h3>
            <span className={`${LS} text-gray-600 font-semibold truncate`}>
              {city} {off && `• ${off}`}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {times.map((t, i) => {
              const name = PRAYERS[i];
              const sun = i === 1;
              const isCur = !!cur && cur.start === t;
              const isNext = nextE.t === t && !isCur;
              const passed = !isCur && !sun && t <= liveNow;
              const isSunNow = sun && !cur && t <= liveNow; // between Sunrise and Dhuhr
              const filled = isCur; // the solid row always means "this prayer is happening now"
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl transition-all ${
                    filled
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/30'
                      : isNext
                        ? 'bg-white shadow-sm border border-indigo-100/60 ring-2 ring-indigo-400 text-gray-800'
                        : isSunNow
                          ? 'bg-indigo-100 border border-indigo-200 ring-2 ring-indigo-300 text-gray-800'
                          : sun
                            ? 'bg-indigo-50/80 border border-indigo-100 text-gray-800'
                            : 'bg-white shadow-sm border border-indigo-100/60 text-gray-800'
                  } ${passed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl flex items-center justify-center ${
                        filled
                          ? 'bg-white/20 text-orange-400'
                          : sun
                            ? 'bg-indigo-200/70 text-orange-600'
                            : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <Icon name={META[i].icon} fill={filled && i !== 4} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`${HS} ${filled ? 'font-bold text-white' : 'text-gray-900'}`}>{name}</span>
                        {isCur && (
                          <span
                            className={`${LS} px-2 py-0.5 rounded-full bg-orange-400 text-gray-900 font-bold uppercase`}
                          >
                            Now
                          </span>
                        )}
                        {isSunNow && (
                          <span
                            className={`${LS} px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold uppercase`}
                          >
                            Now
                          </span>
                        )}
                        {isNext && (
                          <span
                            className={`${LS} px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase`}
                          >
                            Next
                          </span>
                        )}
                      </div>
                      <span className={`${LS} font-medium ${filled ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {isCur && cur
                          ? `Until ${ENDS[i]} ${fmtTime(cur.end, settings.tz)}`
                          : isSunNow
                            ? 'Fajr time has ended'
                            : META[i].sub}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${HS} tabular-nums whitespace-nowrap shrink-0 ${
                      filled ? 'text-orange-300 font-bold' : sun ? 'text-gray-700' : 'text-gray-800'
                    }`}
                  >
                    {fmtTime(t, settings.tz)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Calculation Settings */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className={HS}>Calculation Settings</h3>
            <span className={`${LS} text-gray-600`}>Method &amp; Asr</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer list-none select-none hover:bg-indigo-50/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Icon name="sliders" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={HS}>Calculation Parameters</h4>
                    <p className={`${LS} text-gray-500 font-medium truncate`}>
                      {SHORT[settings.method]} • {settings.hanafi ? 'Hanafi' : "Shafi'i Standard"}
                    </p>
                  </div>
                </div>
                <span className="text-indigo-500 transition-transform duration-200 group-open:rotate-180 shrink-0">
                  <Icon name="chevron" className="w-[22px] h-[22px]" />
                </span>
              </summary>

              {/* Dropdown Content */}
              <div className="px-3.5 sm:px-4 pb-4 pt-3 border-t border-indigo-100 flex flex-col gap-4 bg-white">
                <label className="flex flex-col gap-1.5">
                  <span className={`flex flex-wrap justify-between gap-x-2 ${LS} text-gray-700`}>
                    Calculation Method <span className="text-indigo-600 font-semibold">Angles: {angles}</span>
                  </span>
                  <select
                    className={SELECT}
                    value={settings.method}
                    onChange={e => {
                      const method = e.target.value as MethodKey;
                      // Diyanet publishes standard (single-shadow) Asr
                      update(method === 'diyanet' ? { method, hanafi: false } : { method });
                    }}
                  >
                    {Object.entries(METHODS).map(([key, v]) => (
                      <option key={key} value={key}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={`flex flex-wrap justify-between gap-x-2 ${LS} text-gray-700`}>
                    Asr Juristic Method{' '}
                    <span className="text-indigo-600 font-semibold">
                      {settings.hanafi ? 'Double Shadow' : 'Single Shadow'}
                    </span>
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

                {/* Traveler Prayer Offsets Section */}
                <div className="flex flex-col gap-2 pt-2 border-t border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className={`${HS} text-gray-800`}>Traveler Prayer Offsets (min)</span>
                    {settings.offsets && settings.offsets.some(o => o !== 0) && (
                      <button
                        onClick={() => update({ offsets: [0, 0, 0, 0, 0, 0] })}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className={`${LS} text-gray-500 font-medium`}>
                    Fine-tune individual prayer times to match your local mosque or travel conditions.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                    {PRAYERS.map((prayerName, idx) => {
                      const currentOffset = settings.offsets?.[idx] || 0;
                      return (
                        <div
                          key={prayerName}
                          className="flex flex-col bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100"
                        >
                          <span className={`${LS} text-gray-800 font-bold mb-1.5 truncate`}>{prayerName}</span>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                const nextOffsets = [...(settings.offsets || [0, 0, 0, 0, 0, 0])];
                                nextOffsets[idx] = currentOffset - 1;
                                update({ offsets: nextOffsets });
                              }}
                              className="w-7 h-7 bg-white rounded-lg shadow-sm border border-indigo-100 flex items-center justify-center font-bold text-gray-700 hover:bg-indigo-50 active:scale-95 transition-all"
                            >
                              -
                            </button>
                            <span
                              className={`${BODY} font-bold tabular-nums ${
                                currentOffset > 0
                                  ? 'text-indigo-600'
                                  : currentOffset < 0
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {currentOffset > 0 ? `+${currentOffset}` : currentOffset}m
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextOffsets = [...(settings.offsets || [0, 0, 0, 0, 0, 0])];
                                nextOffsets[idx] = currentOffset + 1;
                                update({ offsets: nextOffsets });
                              }}
                              className="w-7 h-7 bg-white rounded-lg shadow-sm border border-indigo-100 flex items-center justify-center font-bold text-gray-700 hover:bg-indigo-50 active:scale-95 transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="flex items-start gap-2 bg-indigo-50 p-3 rounded-xl text-indigo-900 border border-indigo-100/60 mt-1">
                  <span className="text-indigo-600 mt-0.5 shrink-0">
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
