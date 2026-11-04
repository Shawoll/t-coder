import { BUSINESS_NOTES } from './notes-business.ts';
import { TECH_NOTES } from './notes-tech.ts';
import type { Note } from './note.ts';
import { isNoteReviewed } from './reviewed.ts';

export type { Note } from './note.ts';

/**
 * Curated notes for ~80 key codes: the 48 fast-start codes, the codes of the
 * almanac playbooks and the process touchpoints. A note counts as reviewed
 * only once the author lists its code in reviewed.ts.
 */
export const NOTES: Readonly<Record<string, Note>> = Object.fromEntries(
  Object.entries({ ...TECH_NOTES, ...BUSINESS_NOTES }).map(([code, n]) => [code, { ...n, reviewed: isNoteReviewed(code) }]),
);

export const getNote = (code: string): Note | undefined => NOTES[code];
