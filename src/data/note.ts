import type { L10n } from '../types.ts';

/** A hand-written note for a key code. Conservative: where to look, never production steps. */
export interface Note {
  whenToUse: L10n;
  tips: L10n[];
  pitfalls: L10n[];
  s4?: L10n;
  /** Always false here; notes.ts sets it from the author's sign-off list (reviewed.ts). */
  reviewed: boolean;
}

/** [Slovak, English] */
export type Pair = readonly [sk: string, en: string];

const l = ([sk, en]: Pair): L10n => ({ sk, en });

/** Compact constructor so the note files stay readable. */
export const note = (whenToUse: Pair, tips: readonly Pair[], pitfalls: readonly Pair[], s4?: Pair): Note => {
  const n: Note = { whenToUse: l(whenToUse), tips: tips.map(l), pitfalls: pitfalls.map(l), reviewed: false };
  if (s4) n.s4 = l(s4);
  return n;
};
