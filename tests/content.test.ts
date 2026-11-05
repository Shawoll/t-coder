import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from '../src/data/archetypes.ts';
import { AREA_INFO } from '../src/data/areas.ts';
import { ALMANAC_CODES, AREAS, CODES, CURATED_CODES, hasCode } from '../src/data/catalog.ts';
import { WHISPER_EXAMPLES } from '../src/data/examples.ts';
import { NOTES } from '../src/data/notes.ts';
import { PROCESSES } from '../src/data/processes.ts';
import { QUIZ } from '../src/data/quiz.ts';
import * as reference from '../src/data/reference.ts';
import { REPLACEMENTS } from '../src/data/replacements.ts';
import { REVIEWED } from '../src/data/reviewed.ts';
import { isFioriStep, TTYPES, type L10n, type Step } from '../src/types.ts';

const stepCodes = (steps: readonly Step[]) => steps.flatMap((s) => (isFioriStep(s) ? [] : s.codes));

/** Every { sk, en } object anywhere inside a value. */
const collectL10n = (value: unknown, path = '', out: [string, L10n][] = []): [string, L10n][] => {
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o['sk'] === 'string' && typeof o['en'] === 'string' && Object.keys(o).length === 2) {
      out.push([path, o as unknown as L10n]);
    } else {
      for (const [k, v] of Object.entries(o)) collectL10n(v, `${path}.${k}`, out);
    }
  }
  return out;
};

const almanacCodes = new Set(ALMANAC_CODES.map((c) => c.code));

describe('catalog', () => {
  it('has the almanac’s 393 unique codes in 18 areas', () => {
    expect(ALMANAC_CODES).toHaveLength(393);
    expect(almanacCodes.size).toBe(393);
    expect(AREAS).toHaveLength(18);
  });
  it('matches the almanac type totals', () => {
    const count = (t: string) => ALMANAC_CODES.filter((c) => c.type === t).length;
    expect([count('R'), count('W'), count('A'), count('O'), count('L')]).toEqual([123, 134, 89, 30, 17]);
  });
  it('has an intro for every area', () => {
    for (const a of AREAS) expect(AREA_INFO[a.id], a.id).toBeDefined();
  });
  it('merges almanac and curated codes, each code once', () => {
    expect(CODES).toHaveLength(ALMANAC_CODES.length + CURATED_CODES.length);
    expect(new Set(CODES.map((c) => c.code)).size).toBe(CODES.length);
  });
});

describe('curated codes', () => {
  it('has at least 100, each once', () => {
    expect(CURATED_CODES.length).toBeGreaterThanOrEqual(100);
    expect(new Set(CURATED_CODES.map((c) => c.code)).size).toBe(CURATED_CODES.length);
  });
  it('never repeats an almanac code (delete it here once the almanac lists it)', () => {
    expect(CURATED_CODES.filter((c) => almanacCodes.has(c.code)).map((c) => c.code)).toEqual([]);
  });
  it('uses an almanac area, a legend type and an upper-case code', () => {
    const areaIds = new Set(AREAS.map((a) => a.id));
    for (const c of CURATED_CODES) {
      expect(areaIds.has(c.area), `${c.code}: area ${c.area}`).toBe(true);
      expect(TTYPES, c.code).toContain(c.type);
      // lookupCode() upper-cases the input, so a code must be upper case to be found.
      expect(c.code, c.code).toMatch(/^\/?[A-Z0-9][A-Z0-9_/.]*$/);
    }
  });
  it('names the S/4HANA replacement of every curated legacy code', () => {
    const missing = CURATED_CODES.filter((c) => c.type === 'L' && !REPLACEMENTS[c.code]).map((c) => c.code);
    expect(missing).toEqual([]);
  });
});

describe('every referenced code exists in the catalog', () => {
  it('archetype trails', () => {
    for (const a of ARCHETYPES) for (const c of stepCodes(a.steps)) expect(hasCode(c), `${a.id}: ${c}`).toBe(true);
  });
  it('only F3473 is used as a non-T-code step', () => {
    const fiori = ARCHETYPES.flatMap((a) => a.steps.filter(isFioriStep).map((s) => s.fiori));
    expect(new Set(fiori)).toEqual(new Set(['F3473']));
  });
  it('process touchpoints', () => {
    for (const p of PROCESSES) for (const t of p.touchpoints) for (const c of t.codes) expect(hasCode(c), `${p.id}: ${c}`).toBe(true);
  });
  it('notes, quiz and replacements', () => {
    for (const c of Object.keys(NOTES)) expect(hasCode(c), `note ${c}`).toBe(true);
    for (const item of QUIZ) for (const c of item.codes) expect(hasCode(c), `quiz ${c}`).toBe(true);
    for (const [legacy, r] of Object.entries(REPLACEMENTS)) {
      expect(hasCode(legacy)).toBe(true);
      for (const c of stepCodes(r.steps)) expect(hasCode(c), `${legacy} → ${c}`).toBe(true);
    }
  });
  it('fast start lists 48 catalog codes', () => {
    expect(reference.FAST_START_CODES.size).toBe(48);
    for (const c of reference.FAST_START_CODES) expect(hasCode(c), c).toBe(true);
  });
  it('replacements cover only legacy (L) codes', () => {
    for (const legacy of Object.keys(REPLACEMENTS)) expect(CODES.find((c) => c.code === legacy)?.type).toBe('L');
  });
  it('content transcribed from the almanac uses almanac codes only', () => {
    const transcribed = {
      fastStart: [...reference.FAST_START_CODES],
      processes: PROCESSES.flatMap((p) => p.touchpoints.flatMap((t) => t.codes)),
      playbooks: ARCHETYPES.filter((a) => a.source === 'almanac').flatMap((a) => stepCodes(a.steps)),
      quiz: QUIZ.flatMap((item) => item.codes),
    };
    for (const [where, codes] of Object.entries(transcribed)) {
      expect(codes.filter((c) => !almanacCodes.has(c)), where).toEqual([]);
    }
  });
});

describe('curated content', () => {
  it('has the 10 almanac playbooks and ~50 curated archetypes with unique ids', () => {
    expect(ARCHETYPES.filter((a) => a.source === 'almanac').map((a) => a.playbook)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(ARCHETYPES.filter((a) => a.source === 'curated').length).toBeGreaterThanOrEqual(40);
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(ARCHETYPES.length);
  });
  it('has a note for every fast-start code, playbook code and process touchpoint', () => {
    const needed = new Set([
      ...reference.FAST_START_CODES,
      ...ARCHETYPES.filter((a) => a.source === 'almanac').flatMap((a) => stepCodes(a.steps)),
      ...PROCESSES.flatMap((p) => p.touchpoints.flatMap((t) => t.codes)),
    ]);
    const missing = [...needed].filter((c) => !NOTES[c] && c !== 'FBL3N' && c !== 'VA05');
    expect(missing).toEqual([]);
    expect(Object.keys(NOTES).length).toBeGreaterThanOrEqual(80);
  });
  it('notes have 2–4 tips and 1–3 pitfalls', () => {
    for (const [code, n] of Object.entries(NOTES)) {
      expect(n.tips.length, code).toBeGreaterThanOrEqual(2);
      expect(n.tips.length, code).toBeLessThanOrEqual(4);
      expect(n.pitfalls.length, code).toBeGreaterThanOrEqual(1);
      expect(n.pitfalls.length, code).toBeLessThanOrEqual(3);
    }
  });
  it('whisper examples point at existing scenarios, once each', () => {
    expect(WHISPER_EXAMPLES.length).toBeGreaterThanOrEqual(4); // the home screen shows four
    expect(WHISPER_EXAMPLES.filter((e) => !ARCHETYPES.some((a) => a.id === e.id))).toEqual([]);
    const ids = WHISPER_EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has the 20 almanac self-test questions', () => {
    expect(QUIZ).toHaveLength(20);
  });
});

describe('author sign-off list (reviewed.ts)', () => {
  const dupes = <T,>(ids: readonly T[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
  it('lists only existing items, each once', () => {
    expect(REVIEWED.notes.filter((c) => !NOTES[c])).toEqual([]);
    expect(REVIEWED.scenarios.filter((id) => !ARCHETYPES.some((a) => a.id === id))).toEqual([]);
    expect(REVIEWED.quiz.filter((n) => !Number.isInteger(n) || n < 1 || n > QUIZ.length)).toEqual([]);
    expect(REVIEWED.codes.filter((c) => !CURATED_CODES.some((x) => x.code === c))).toEqual([]);
    expect([
      ...dupes(REVIEWED.notes),
      ...dupes(REVIEWED.scenarios),
      ...dupes(REVIEWED.quiz),
      ...dupes(REVIEWED.codes),
    ]).toEqual([]);
  });
  it('marks a note reviewed exactly when its code is listed', () => {
    const reviewed = Object.entries(NOTES).filter(([, n]) => n.reviewed).map(([c]) => c);
    expect(reviewed.sort()).toEqual([...REVIEWED.notes].sort());
  });
});

describe('every bilingual text is filled in both languages', () => {
  const sources = { ARCHETYPES, AREA_INFO, NOTES, PROCESSES, QUIZ, REPLACEMENTS, WHISPER_EXAMPLES, reference, catalog: CODES };
  const all = collectL10n(sources);
  it('found a meaningful amount of text', () => {
    expect(all.length).toBeGreaterThan(1200);
  });
  it.each(['sk', 'en'] as const)('%s is never empty', (lang) => {
    const empty = all.filter(([, v]) => !v[lang].trim()).map(([p]) => p);
    expect(empty).toEqual([]);
  });
});
