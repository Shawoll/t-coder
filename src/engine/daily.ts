/** FNV-1a: a tiny, stable string hash. */
const fnv1a = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** Local calendar day as YYYY-MM-DD. */
export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** The same pick for everyone on the same day, a different one tomorrow. */
export const pickOfTheDay = <T>(pool: readonly T[], date: Date): T | undefined =>
  pool.length ? pool[fnv1a(dayKey(date)) % pool.length] : undefined;
