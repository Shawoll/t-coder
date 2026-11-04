/** Shared domain types. Every user-facing string is bilingual (Slovak + English). */

export type Lang = 'sk' | 'en';

export interface L10n {
  sk: string;
  en: string;
}

/** Almanac type tags: Read, Write, Admin, Optional component, Legacy. */
export type TType = 'R' | 'W' | 'A' | 'O' | 'L';
export const TTYPES: readonly TType[] = ['R', 'W', 'A', 'O', 'L'];

/** Chapter number of the almanac, "01" … "18". */
export type AreaId = string;

export interface TCode {
  code: string;
  area: AreaId;
  type: TType;
  purpose: L10n;
}

export interface Area {
  id: AreaId;
  title: L10n;
  count: number;
}

export interface Catalog {
  source: { title: string; edition: string; pages: number };
  areas: Area[];
  codes: TCode[];
}

/** The only non-T-code the app links to: the Fiori "Migrate Your Data" app. */
export type FioriId = 'F3473';

/**
 * One position in a trail. A code step may list alternatives at the same
 * position (e.g. SMQ1 / SMQ2), exactly as the almanac writes them.
 */
export type Step =
  | { codes: string[]; why: L10n }
  | { fiori: FioriId; label: L10n; why: L10n };

export const isFioriStep = (s: Step): s is Extract<Step, { fiori: FioriId }> => 'fiori' in s;

/** Guided-whisper symptom chips. */
export type Symptom = 'error' | 'stuck' | 'data' | 'slow' | 'access' | 'missing' | 'blocked';
export const SYMPTOMS: readonly Symptom[] = ['error', 'stuck', 'data', 'slow', 'access', 'missing', 'blocked'];

export type Landscape = 'ecc' | 's4' | 'btp';
