export type MethodKey = 'mwl' | 'isna' | 'egypt' | 'makkah' | 'karachi';

export const METHODS: Record<MethodKey, { name: string; fajr: number; isha?: number; ishaMin?: number }> = {
  mwl: { name: 'Muslim World League', fajr: 18, isha: 17 },
  isna: { name: 'ISNA (North America)', fajr: 15, isha: 15 },
  egypt: { name: 'Egyptian Authority', fajr: 19.5, isha: 17.5 },
  makkah: { name: 'Umm al-Qura (Makkah)', fajr: 18.5, ishaMin: 90 },
  karachi: { name: 'Karachi', fajr: 18, isha: 18 },
};

export const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

const R = Math.PI / 180;

/** [year, monthIndex, day] of the given instant in the given timezone (device tz if empty). */
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

/** Returns epoch ms for [Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha] (NaN if undefined at this latitude). */
export function calcTimes(
  [y, mo, dd]: [number, number, number],
  latDeg: number,
  lng: number,
  method: MethodKey,
  hanafi: boolean,
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
  const maghrib = noon + T(0.833);
  const hours = [
    noon - T(c.fajr),
    noon - T(0.833),
    noon,
    noon + T(-alt),
    maghrib,
    c.ishaMin ? maghrib + c.ishaMin / 60 : noon + T(c.isha as number),
  ];
  return hours.map((h) => base + h * 36e5);
}

export const fmtTime = (t: number, tz?: string) =>
  Number.isNaN(t)
    ? '—'
    : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined });
