import { lookupCode } from '../data/catalog.ts';
import { suggestCodes } from './search.ts';

/** What the SAP-style command field should do with its input. */
export type Command =
  | { kind: 'empty' }
  | { kind: 'home' }
  | { kind: 'newSession' }
  | { kind: 'open'; code: string; newSession: boolean }
  | { kind: 'unknown'; code: string; suggestions: string[] }
  | { kind: 'search'; query: string }
  | { kind: 'logoff' }
  | { kind: 'debug' };

/**
 * A lone word "looks like a transaction" when it has a digit, a slash or an
 * underscore, or was typed in capitals (XYZ). Lower-case words such as
 * "banana" or "ewm" are treated as a search instead.
 */
const looksLikeCode = (s: string): boolean =>
  /^\/?[A-Za-z0-9][A-Za-z0-9_/.-]{1,39}$/.test(s) && (/[\d/_]/.test(s) || (/[A-Z]/.test(s) && s === s.toUpperCase()));

const openOrUnknown = (raw: string, newSession: boolean): Command => {
  const found = lookupCode(raw);
  if (found) return { kind: 'open', code: found.code, newSession };
  const code = raw.trim().toUpperCase();
  return { kind: 'unknown', code, suggestions: suggestCodes(code) };
};

/**
 * Parse command-field input the way SAP GUI does:
 *   SE16N · se16n · /nSE16N  → open SE16N
 *   /n                       → back to the start menu
 *   /oVA03 · /o              → VA03 / start menu in a new session (tab)
 *   /n/SCWM/MON              → namespaced codes work after /n and /o
 *   /nend · /nex             → log off (not possible in a browser)
 *   /h                       → "debugging switched on"
 * Anything that is not a transaction becomes a search.
 */
export const parseCommand = (input: string): Command => {
  const text = input.trim();
  if (!text) return { kind: 'empty' };

  const prefixed = /^\/([no])(.*)$/i.exec(text);
  if (prefixed) {
    const newSession = prefixed[1]!.toLowerCase() === 'o';
    const rest = prefixed[2]!.trim();
    if (!rest) return newSession ? { kind: 'newSession' } : { kind: 'home' };
    if (!newSession && /^(end|ex)$/i.test(rest)) return { kind: 'logoff' };
    return openOrUnknown(rest, newSession);
  }
  if (/^\/h$/i.test(text)) return { kind: 'debug' };

  if (!/\s/.test(text)) {
    if (lookupCode(text)) return openOrUnknown(text, false);
    if (looksLikeCode(text)) return openOrUnknown(text, false);
  }
  return { kind: 'search', query: text };
};
