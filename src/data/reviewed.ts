// Author sign-off for the curated content and the curated codes.
// AUTHOR-OWNED: add an id only after you have checked the item yourself in
// both languages (`npm run review` writes the checklist to
// review/checklist.md). Tests reject unknown or duplicate ids.

export interface ReviewList {
  /** T-codes of curated notes, e.g. 'SE16N'. */
  notes: readonly string[];
  /** Whisper scenario ids (playbooks and curated), e.g. 'idoc-failed'. */
  scenarios: readonly string[];
  /** 1-based quiz question numbers. */
  quiz: readonly number[];
  /** Curated T-codes (not in the almanac), e.g. 'COGI'. */
  codes: readonly string[];
}

export const REVIEWED: ReviewList = {
  notes: [],
  scenarios: [],
  quiz: [],
  codes: [],
};

const notes = new Set(REVIEWED.notes);
const scenarios = new Set(REVIEWED.scenarios);
const quiz = new Set(REVIEWED.quiz);
const codes = new Set(REVIEWED.codes);

export const isNoteReviewed = (code: string): boolean => notes.has(code);
export const isScenarioReviewed = (id: string): boolean => scenarios.has(id);
export const isQuizReviewed = (n: number): boolean => quiz.has(n);
export const isCodeReviewed = (code: string): boolean => codes.has(code);
