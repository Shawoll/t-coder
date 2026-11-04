import { CODES } from '../data/catalog.ts';
import type { AreaId, TCode, TType } from '../types.ts';
import { damerauLevenshtein } from './fuzzy.ts';
import { analyze, fold, tokenize, STOPWORDS } from './normalize.ts';

export type HitReason = 'exact' | 'prefix' | 'segment' | 'fuzzy' | 'text';

export interface SearchHit {
  code: TCode;
  score: number;
  reason: HitReason;
}

export interface SearchOptions {
  limit?: number;
  types?: readonly TType[];
  areas?: readonly AreaId[];
}

// Tiers keep code matches strictly above description matches.
const EXACT = 1000;
const PREFIX = 800;
const SEGMENT = 700;
const FUZZY = 500;
const TEXT_MAX = 300;

interface Indexed {
  code: TCode;
  segments: string[];
  words: string[];
}

/** Description words of both languages, folded, without stopwords. */
const INDEX: readonly Indexed[] = CODES.map((code) => ({
  code,
  segments: code.code.split(/[/_]/).filter(Boolean),
  words: [...new Set(tokenize(`${code.purpose.sk} ${code.purpose.en}`).filter((w) => !STOPWORDS.has(w)))],
}));

/** Score a single code-shaped token against a code. */
const scoreCode = (entry: Indexed, q: string): { score: number; reason: HitReason } | undefined => {
  const code = entry.code.code;
  if (code === q) return { score: EXACT, reason: 'exact' };
  if (q.length >= 2 && code.startsWith(q)) return { score: PREFIX - (code.length - q.length), reason: 'prefix' };
  if (q.length >= 2) {
    if (entry.segments.includes(q)) return { score: SEGMENT, reason: 'segment' };
    if (q.length >= 3 && entry.segments.some((s) => s.startsWith(q))) {
      return { score: SEGMENT - 50, reason: 'segment' };
    }
  }
  if (q.length >= 3) {
    const d = damerauLevenshtein(code, q, 2);
    if (d === 1) return { score: FUZZY, reason: 'fuzzy' };
    if (d === 2 && q.length >= 5) return { score: FUZZY - 100, reason: 'fuzzy' };
  }
  return undefined;
};

/** How well one query word matches a description word (search is more lenient than whisper). */
const wordScore = (q: string, w: string): number => {
  if (q === w) return 1;
  if (q.length >= 3 && w.startsWith(q)) return 0.85;
  if (q.length >= 5 && w.length >= 5 && damerauLevenshtein(q, w, 1) === 1) return 0.6;
  return 0;
};

/** Average best match of the query words against a code's description words, 0…1. */
const scoreText = (entry: Indexed, words: readonly string[]): number => {
  if (words.length === 0) return 0;
  let total = 0;
  for (const q of words) {
    let best = 0;
    for (const w of entry.words) best = Math.max(best, wordScore(q, w));
    total += best;
  }
  return total / words.length;
};

/**
 * Rank catalog codes for a query. Order: exact code, code prefix, code segment
 * (/SCWM/MON for "mon"), fuzzy code, then description words in SK and EN
 * (diacritics ignored). Ties keep catalog order.
 */
export const searchCodes = (query: string, options: SearchOptions = {}): SearchHit[] => {
  const { limit = 50, types, areas } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];
  const codeTokens = trimmed
    .split(/\s+/)
    .map((t) => t.toUpperCase().replace(/[,;:!?]+$/, ''))
    .filter(Boolean);
  const words = analyze(trimmed).tokens.map(fold);

  const hits: SearchHit[] = [];
  for (const entry of INDEX) {
    if (types && types.length && !types.includes(entry.code.type)) continue;
    if (areas && areas.length && !areas.includes(entry.code.area)) continue;
    let best: { score: number; reason: HitReason } | undefined;
    for (const t of codeTokens) {
      const s = scoreCode(entry, t);
      if (s && (!best || s.score > best.score)) best = s;
    }
    const text = scoreText(entry, words);
    // A partial description match must cover at least half the query words.
    if (text >= 0.5 && (!best || TEXT_MAX * text > best.score)) best = { score: TEXT_MAX * text, reason: 'text' };
    if (best) hits.push({ code: entry.code, ...best });
  }
  // Array.prototype.sort is stable, so equal scores keep catalog order.
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
};

/** "Did you mean …?" candidates for an unknown code: prefix matches and near misses. */
export const suggestCodes = (input: string, limit = 5): string[] => {
  const q = input.trim().toUpperCase();
  if (!q) return [];
  const scored: { code: string; d: number }[] = [];
  for (const { code } of CODES) {
    if (code.startsWith(q) || (q.startsWith(code) && code.length >= 2)) {
      scored.push({ code, d: Math.abs(code.length - q.length) * 0.5 });
      continue;
    }
    const d = damerauLevenshtein(code, q, 2);
    if (d <= 2) scored.push({ code, d });
  }
  return scored
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((s) => s.code);
};
