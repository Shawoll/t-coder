// String similarity used by search, the command field and whisper.

/**
 * Damerau–Levenshtein distance (optimal string alignment variant): insertions,
 * deletions, substitutions and adjacent transpositions each cost 1.
 * `max` allows an early exit: once every cell of a row exceeds it, the
 * result is reported as `max + 1`.
 */
export const damerauLevenshtein = (a: string, b: string, max = Infinity): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = b.length;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2]! + 1);
      }
      row.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = row;
  }
  return prev[n]!;
};

const commonPrefix = (a: string, b: string): number => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

const hasDigit = (s: string): boolean => /\d/.test(s);

export type MatchKind = 'exact' | 'prefix' | 'fuzzy';
export const MATCH_SCORE: Readonly<Record<MatchKind, number>> = { exact: 1, prefix: 0.8, fuzzy: 0.6 };

/**
 * How well a query word matches an authored word (both already folded).
 *  • exact  – identical.
 *  • prefix – one starts with the other, or they share a stem and differ only
 *             in the last two letters; both at least 4 letters. This absorbs
 *             Slovak inflection: faktúra / faktúru / faktúry.
 *  • fuzzy  – one typo (Damerau–Levenshtein ≤ 1), both at least 5 letters.
 * Words containing digits (T-codes, status numbers) only match exactly, so
 * ME21N never "almost" matches ME22N.
 */
export const matchWord = (token: string, term: string): MatchKind | undefined => {
  if (token === term) return 'exact';
  if (hasDigit(token) || hasDigit(term)) return undefined;
  const shorter = Math.min(token.length, term.length);
  const longer = Math.max(token.length, term.length);
  if (shorter >= 4) {
    const cp = commonPrefix(token, term);
    if (cp === shorter || (cp >= 4 && cp >= longer - 2)) return 'prefix';
  }
  if (shorter >= 5 && damerauLevenshtein(token, term, 1) <= 1) return 'fuzzy';
  return undefined;
};
