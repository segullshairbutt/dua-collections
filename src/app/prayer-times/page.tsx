'use client';

import { useEffect, useState } from 'react';

import { METHODS, MethodKey, PRAYERS, calcTimes, fmtTime, ymd } from 'lib/prayerTimes';

interface Settings {
  lat: number;
  lng: number;
  name: string;
  tz: string;
  method: MethodKey;
  hanafi: boolean;
  set: boolean;
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
  lat: 21.4225,
  lng: 39.8262,
  name: 'Makkah (default)',
  tz: 'Asia/Riyadh',
  method: 'mwl',
  hanafi: false,
  set: false,
};

export default function PrayerTimesPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [msg, setMsg] = useState('');

  const update = (p: Partial<Settings>) =>
    setS((prev) => {
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
      (p) => {
        const { latitude: a, longitude: b } = p.coords;
        update({ lat: a, lng: b, tz: '', name: `${a.toFixed(2)}, ${b.toFixed(2)}`, set: true });
        setMsg('');
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${a}&longitude=${b}&localityLanguage=en`)
          .then((r) => r.json())
          .then((j) => {
            const n = [j.city || j.locality, j.countryName].filter(Boolean).join(', ');
            if (n) update({ name: n });
          })
          .catch(() => {});
      },
      () => setMsg('Location denied. Search your city below instead.'),
      { timeout: 15000, maximumAge: 36e5 },
    );
  };

  useEffect(() => {
    let saved: Settings | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {}
    if (saved) setS({ ...DEFAULTS, ...saved });
    setNow(Date.now());
    setReady(true);
    if (!saved?.set) locate();
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) return setResults([]);
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.trim())}`,
        );
        const j = await r.json();
        setResults(j.results ?? []);
        setMsg(j.results?.length ? '' : 'No match');
      } catch {
        setMsg('Search needs an internet connection');
      }
    }, 350);
    return () => clearTimeout(id);
  }, [q]);

  if (!ready) return null;

  const times = calcTimes(ymd(now, s.tz), s.lat, s.lng, s.method, s.hanafi);
  let idx = times.findIndex((t, i) => i !== 1 && t > now);
  const next =
    idx >= 0 ? times[idx] : calcTimes(ymd(now + 864e5, s.tz), s.lat, s.lng, s.method, s.hanafi)[0];
  if (idx < 0) idx = 0;
  const sec = Math.max(0, Math.round((next - now) / 1000));
  const cd = [(sec / 3600) | 0, ((sec % 3600) / 60) | 0, sec % 60].map((v) => String(v).padStart(2, '0')).join(':');

  let hijri = '';
  try {
    hijri = ' · ' + new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: s.tz || undefined,
    }).format(now);
  } catch {}
  const dateStr =
    new Date(now).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', timeZone: s.tz || undefined }) +
    hijri;

  const field = 'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5';

  return (
    <main className="max-w-md mx-auto px-4 pt-4">
      <section className="rounded-3xl bg-gradient-to-br from-teal-900 to-teal-600 text-white text-center p-6">
        <p className="text-sm opacity-80">Next prayer</p>
        <h1 className="text-3xl font-bold">{PRAYERS[idx]}</h1>
        <p className="text-5xl font-bold tabular-nums my-1">{cd}</p>
        <p className="text-sm opacity-85">{dateStr}</p>
      </section>

      <ul className="my-4 rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
        {times.map((t, i) => (
          <li
            key={PRAYERS[i]}
            className={`flex justify-between px-4 py-3.5 ${i === idx ? 'bg-teal-50 text-teal-700 font-bold' : ''} ${
              i === 1 ? 'text-gray-500 text-sm' : ''
            }`}
          >
            <span>{PRAYERS[i]}</span>
            <span className="tabular-nums">{fmtTime(t, s.tz)}</span>
          </li>
        ))}
      </ul>

      <p className="text-center text-sm text-gray-500 my-3">📍 {s.name}</p>
      {msg && <p className="text-center text-sm text-gray-500 mb-2">{msg}</p>}

      <input className={field} placeholder="🔍 Search city (e.g. Dubai, London)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex flex-col gap-1.5 mt-2">
        {results.map((c) => (
          <button
            key={c.id}
            className="text-left rounded-xl border border-gray-200 bg-white px-3 py-2"
            onClick={() => {
              update({
                lat: c.latitude, lng: c.longitude, tz: c.timezone || '',
                name: [c.name, c.country].filter(Boolean).join(', '), set: true,
              });
              setQ('');
              setResults([]);
            }}
          >
            {c.name}
            <small className="block text-gray-500">{[c.admin1, c.country].filter(Boolean).join(', ')}</small>
          </button>
        ))}
      </div>
      <button className="w-full mt-3 rounded-xl bg-teal-700 text-white font-semibold py-2.5" onClick={locate}>
        📍 Use my location
      </button>

      <div className="flex gap-2 mt-4">
        <select className={field} value={s.method} onChange={(e) => update({ method: e.target.value as MethodKey })}>
          {Object.entries(METHODS).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
        <select className={field} value={s.hanafi ? '1' : '0'} onChange={(e) => update({ hanafi: e.target.value === '1' })}>
          <option value="0">Asr: Standard</option>
          <option value="1">Asr: Hanafi</option>
        </select>
      </div>
    </main>
  );
}
