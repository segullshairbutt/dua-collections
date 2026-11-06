export type MethodKey = 'mwl' | 'isna' | 'egypt' | 'makkah' | 'karachi' | 'diyanet';

export interface Method {
  name: string;
  fajr: number;
  isha?: number;
  ishaMin?: number;
  adj?: number[];
}

export interface Settings {
  lat: number;
  lng: number;
  name: string;
  tz: string;
  method: MethodKey;
  hanafi: boolean;
  set: boolean;
  auto: boolean;
  offsets?: number[];
}

export interface City {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const METHODS: Record<MethodKey, Method> = {
  mwl: { name: 'Muslim World League', fajr: 18, isha: 17 },
  isna: { name: 'ISNA (North America)', fajr: 15, isha: 15 },
  egypt: { name: 'Egyptian Authority', fajr: 19.5, isha: 17.5 },
  makkah: { name: 'Umm al-Qura (Makkah)', fajr: 18.5, ishaMin: 90 },
  karachi: { name: 'Karachi', fajr: 18, isha: 18 },
  diyanet: {
    name: 'Diyanet / DİTİB (Turkish mosques)',
    fajr: 18,
    isha: 16,
    adj: [-0.7, -7.7, 5, 4.6, 7.8, 0.7],
  },
};

export const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
const R = Math.PI / 180;

export function ymd(ms: number, tz?: string): [number, number, number] {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(ms)
    .split('-');
  return [+p[0], +p[1] - 1, +p[2]];
}

export function calcTimes(
  [y, mo, dd]: [number, number, number],
  latDeg: number,
  lng: number,
  method: MethodKey,
  hanafi: boolean,
  offsets?: number[]
): number[] {
  const base = Date.UTC(y, mo, dd);
  const D = base / 864e5 + 2440588 - 2451545;
  const g = (357.529 + 0.98560028 * D) * R;
  const q = 280.459 + 0.98564736 * D;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * R;
  const e = (23.439 - 3.6e-7 * D) * R;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = (Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / R / 15 + 24) % 24;
  let eq = q / 15 - ra;
  eq = ((((eq + 12) % 24) + 24) % 24) - 12;

  const lat = latDeg * R;
  const noon = 12 - lng / 15 - eq;
  const c = METHODS[method];
  const T = (a: number) =>
    Math.acos((-Math.sin(a * R) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / R / 15;

  const alt = Math.atan(1 / ((hanafi ? 2 : 1) + Math.tan(Math.abs(lat - dec)))) / R;
  const sunrise = noon - T(0.833);
  const maghrib = noon + T(0.833);

  let fajr = noon - T(c.fajr);
  let isha = c.ishaMin ? maghrib + c.ishaMin / 60 : noon + T(c.isha as number);

  // High-Latitude Fallback (One-Seventh of the Night)
  if (Number.isNaN(fajr) || Number.isNaN(isha)) {
    const daylight = maghrib - sunrise;
    const nightLength = 24 - daylight;
    if (Number.isNaN(fajr)) fajr = sunrise - nightLength / 7;
    if (Number.isNaN(isha)) isha = c.ishaMin ? maghrib + c.ishaMin / 60 : maghrib + nightLength / 7;
  }

  const hours = [fajr, sunrise, noon, noon + T(-alt), maghrib, isha];

  return hours.map((h, i) => {
    if (Number.isNaN(h)) return NaN;

    // Combine method institutional adjustment + user traveler offset
    const methodAdj = c.adj ? c.adj[i] : 0;
    const userOffset = offsets && typeof offsets[i] === 'number' ? offsets[i] : 0;
    const totalAdj = methodAdj + userOffset;

    return base + Math.round(h * 60 + totalAdj) * 6e4;
  });
}

export const fmtTime = (t: number, tz?: string) =>
  Number.isNaN(t)
    ? '—'
    : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined });

export const pad = (n: number) => String(n).padStart(2, '0');
export const hm = (sec: number) => `${pad(Math.floor(sec / 3600))}h ${pad(Math.floor((sec % 3600) / 60))}m`;

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal }
    );
    if (!res.ok) throw new Error(`Reverse geocoding failed with status ${res.status}`);

    const data = await res.json();
    const locationName = [data.city || data.locality, data.countryName].filter(Boolean).join(', ');
    return locationName || null;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.warn('Reverse geocoding error:', error);
    }
    return null;
  }
}
