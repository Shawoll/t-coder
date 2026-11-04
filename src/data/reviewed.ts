// Author sign-off for the curated content. AUTHOR-OWNED: add an id only after
// you have checked the item yourself in both languages (`npm run review`
// writes the checklist to review/checklist.md). Tests reject unknown or
// duplicate ids.

export interface ReviewList {
  /** T-codes of curated notes, e.g. 'SE16N'. */
  notes: readonly string[];
  /** Whisper scenario ids (playbooks and curated), e.g. 'idoc-failed'. */
  scenarios: readonly string[];
  /** 1-based quiz question numbers. */
  quiz: readonly number[];
}

export const REVIEWED: ReviewList = {
  notes: [],
  scenarios: [],
  quiz: [],
};

const notes = new Set(REVIEWED.notes);
const scenarios = new Set(REVIEWED.scenarios);
const quiz = new Set(REVIEWED.quiz);

export const isNoteReviewed = (code: string): boolean => notes.has(code);
export const isScenarioReviewed = (id: string): boolean => scenarios.has(id);
export const isQuizReviewed = (n: number): boolean => quiz.has(n);
