import { BUSINESS_NOTES } from './notes-business.ts';
import { TECH_NOTES } from './notes-tech.ts';
import type { Note } from './note.ts';

export type { Note } from './note.ts';

/**
 * Curated notes for ~80 key codes: the 48 fast-start codes, the codes of the
 * almanac playbooks and the process touchpoints. Every note starts with
 * `reviewed: false` until the author has checked it.
 */
export const NOTES: Readonly<Record<string, Note>> = { ...TECH_NOTES, ...BUSINESS_NOTES };

export const getNote = (code: string): Note | undefined => NOTES[code];
