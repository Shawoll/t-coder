// The whisper: a deterministic, explainable troubleshooter.
// A free-text problem description (SK or EN) is scored against problem
// archetypes; every point of the score can be traced back to a matched term,
// error signature, literal T-code or area keyword, and is shown to the user.

import { ARCHETYPES, type Archetype } from '../data/archetypes.ts';
import { AREA_INFO } from '../data/areas.ts';
import { hasCode } from '../data/catalog.ts';
import { TOOLBOX } from '../data/reference.ts';
import { REPLACEMENTS } from '../data/replacements.ts';
import { isFioriStep, type AreaId, type L10n, type Landscape, type Step, type Symptom } from '../types.ts';
import { MATCH_SCORE, matchWord } from './fuzzy.ts';
import { analyze, normalizeTerm, type Analyzed } from './normalize.ts';

// ─────────────────────────────────────────────────────────────── tuning
/** Bonus for an archetype whose trail contains a T-code typed in the query. */
const LITERAL_CODE_BOOST = 1.5;
/** Bonus for the legacy archetype when the query names a code with an S/4 replacement. */
const LEGACY_CODE_BOOST = 3;
/** Bonus when a query word is one of the archetype's area keywords (once per area). */
const AREA_BONUS = 0.3;
/** Bonus per guided chip (area / symptom) the archetype matches. */
const FILTER_BONUS = 1;
/** Rank decay along a trail: step i counts 1 / (1 + 0.35 i). */
const STEP_DECAY = 0.35;
/** Below this, nothing is a match and the toolbox is shown instead. */
export const MIN_SCORE = 0.9;
/** Results weaker than this share of the best one are dropped as noise. */
const RELATIVE_CUTOFF = 0.3;
const HIGH = 3.5;
const MEDIUM = 1.8;

// ─────────────────────────────────────────────────────────────── types
export type Confidence = 'high' | 'medium' | 'low';

/** Why an archetype scored: rendered as chips so the logic is visible. */
export interface MatchChip {
  kind: 'term' | 'pattern' | 'code' | 'area' | 'filter';
  /** What matched, e.g. "faktúra≈faktura", "status 51", "XD01". */
  text: string;
  label?: L10n;
}

export interface TrailStep {
  step: Step;
  /** Legacy codes this step stands in for (landscape lens or legacy query). */
  replaces?: string[];
}

export interface WhisperHit {
  archetype: Archetype;
  score: number;
  confidence: Confidence;
  chips: MatchChip[];
  trail: TrailStep[];
}

export interface RankedCode {
  /** A T-code, or the Fiori app ID. */
  key: string;
  score: number;
}

export interface WhisperOptions {
  landscape?: Landscape;
  area?: AreaId;
  symptom?: Symptom;
  limit?: number;
}

export interface WhisperResult {
  query: string;
  analyzed: Analyzed;
  hits: WhisperHit[];
  /** Codes across all hits, ranked by Σ score × 1 / (1 + 0.35 · stepIndex). */
  ranking: RankedCode[];
  /** T-codes typed literally in the query. */
  literalCodes: string[];
  /** True when nothing matched and the first-response toolbox is suggested. */
  fallback: boolean;
  toolbox: TrailStep[];
}

// ─────────────────────────────────────────────────────────────── compiled corpus
interface CompiledTerm {
  source: string;
  words: string[];
  idf: number;
}
interface CompiledArchetype {
  archetype: Archetype;
  signals: { w: number; terms: CompiledTerm[] }[];
  stepCodes: ReadonlySet<string>;
  areaKeywords: string[];
}

const compile = (archetypes: readonly Archetype[]): CompiledArchetype[] => {
  const df = new Map<string, number>();
  const normalized = archetypes.map((a) => a.signals.map((s) => s.terms.map(normalizeTerm)));
  for (const signals of normalized) {
    for (const t of new Set(signals.flat())) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const n = archetypes.length;
  // idf scaled to (0, 1]: a term unique to one archetype weighs 1.
  const idf = (t: string): number => Math.log(1 + n / (df.get(t) ?? 1)) / Math.log(1 + n);

  return archetypes.map((archetype, i) => ({
    archetype,
    signals: archetype.signals.map((s, j) => ({
      w: s.w,
      terms: normalized[i]![j]!.map((t, k) => ({ source: s.terms[k]!, words: t.split(' '), idf: idf(t) })),
    })),
    stepCodes: new Set(archetype.steps.flatMap((s) => (isFioriStep(s) ? [s.fiori] : s.codes))),
    areaKeywords: [...new Set(archetype.areas.flatMap((id) => AREA_INFO[id]?.keywords ?? []))],
  }));
};

const CORPUS = compile(ARCHETYPES);

// ─────────────────────────────────────────────────────────────── matching
/** Best match of a (possibly multi-word) term against runs of adjacent query tokens. */
const matchTerm = (q: Analyzed, term: CompiledTerm): { score: number; at: number[] } | undefined => {
  const n = term.words.length;
  let best: { score: number; at: number[] } | undefined;
  for (let i = 0; i + n <= q.tokens.length; i++) {
    let score = 1;
    for (let k = 0; k < n; k++) {
      if (k > 0 && !q.adjacent[i + k]) {
        score = 0;
        break;
      }
      const kind = matchWord(q.tokens[i + k]!, term.words[k]!);
      if (!kind) {
        score = 0;
        break;
      }
      score = Math.min(score, MATCH_SCORE[kind]);
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, at: Array.from({ length: n }, (_, k) => i + k) };
    }
  }
  return best;
};

const findLiteralCodes = (q: Analyzed): string[] => {
  const found = new Set<string>();
  for (const c of q.codeCandidates) {
    const upper = c.toUpperCase();
    if (hasCode(upper)) found.add(upper);
  }
  return [...found];
};

interface Scored {
  compiled: CompiledArchetype;
  raw: number;
  explained: Set<number>;
  chips: MatchChip[];
}

const scoreArchetype = (
  c: CompiledArchetype,
  q: Analyzed,
  literal: readonly string[],
  options: WhisperOptions,
): Scored => {
  const s: Scored = { compiled: c, raw: 0, explained: new Set(), chips: [] };
  const a = c.archetype;

  // 1–2. Signals: each counts once, through its best term, weighted by idf.
  for (const signal of c.signals) {
    let best: { score: number; at: number[]; term: CompiledTerm } | undefined;
    for (const term of signal.terms) {
      const m = matchTerm(q, term);
      if (m && (!best || m.score * term.idf > best.score)) best = { score: m.score * term.idf, at: m.at, term };
    }
    if (!best) continue;
    s.raw += signal.w * best.score;
    best.at.forEach((i) => s.explained.add(i));
    const typed = best.at.map((i) => q.tokens[i]).join(' ');
    const term = best.term.words.join(' ');
    s.chips.push({ kind: 'term', text: typed === term ? typed : `${typed}≈${term}` });
  }

  // 3. Error-message signatures.
  for (const p of a.patterns ?? []) {
    const m = p.re.exec(q.folded);
    if (!m) continue;
    s.raw += p.w;
    q.tokens.forEach((t, i) => {
      if (m[0].includes(t)) s.explained.add(i);
    });
    s.chips.push({ kind: 'pattern', text: m[0].trim(), label: p.label });
  }

  // 4. Literal T-codes typed in the query.
  for (const code of literal) {
    let boost = 0;
    if (c.stepCodes.has(code)) boost += LITERAL_CODE_BOOST;
    if (a.replacementTrail && REPLACEMENTS[code]) boost += LEGACY_CODE_BOOST;
    if (!boost) continue;
    s.raw += boost;
    const lower = code.toLowerCase();
    q.tokens.forEach((t, i) => {
      if (t === lower || t.split('/').includes(lower)) s.explained.add(i);
    });
    s.chips.push({ kind: 'code', text: code });
  }

  // 5. Area keywords.
  const areaHits = new Set<string>();
  q.tokens.forEach((t, i) => {
    const kw = c.areaKeywords.find((k) => matchWord(t, k) === 'exact' || matchWord(t, k) === 'prefix');
    if (kw) {
      areaHits.add(kw);
      s.explained.add(i);
    }
  });
  if (areaHits.size) {
    s.raw += AREA_BONUS * Math.min(areaHits.size, a.areas.length);
    s.chips.push({ kind: 'area', text: [...areaHits].join(', '), label: AREA_LABEL });
  }

  // Guided chips.
  if (options.area && a.areas.includes(options.area)) {
    s.raw += FILTER_BONUS;
    s.chips.push({ kind: 'filter', text: options.area });
  }
  if (options.symptom && a.symptoms.includes(options.symptom)) {
    s.raw += FILTER_BONUS;
    s.chips.push({ kind: 'filter', text: options.symptom });
  }
  return s;
};

// ─────────────────────────────────────────────────────────────── trails & lenses
const stepKeys = (s: Step): string[] => (isFioriStep(s) ? [s.fiori] : s.codes);

/** The S/4HANA lens: swap legacy codes for their replacements and drop steps that became duplicates. */
const applyS4Lens = (trail: TrailStep[]): TrailStep[] => {
  const seen = new Set<string>();
  const out: TrailStep[] = [];
  for (const t of trail) {
    if (isFioriStep(t.step)) {
      if (!seen.has(t.step.fiori)) out.push(t);
      seen.add(t.step.fiori);
      continue;
    }
    const legacy = t.step.codes.filter((c) => REPLACEMENTS[c]);
    if (!legacy.length) {
      out.push(t);
      t.step.codes.forEach((c) => seen.add(c));
      continue;
    }
    // Keep the modern codes of a mixed step, then append each replacement.
    const modern = t.step.codes.filter((c) => !REPLACEMENTS[c] && !seen.has(c));
    if (modern.length) {
      out.push({ step: { codes: modern, why: t.step.why } });
      modern.forEach((c) => seen.add(c));
    }
    for (const code of legacy) {
      for (const r of REPLACEMENTS[code]!.steps) {
        const keys = stepKeys(r).filter((k) => !seen.has(k));
        if (!keys.length) continue;
        keys.forEach((k) => seen.add(k));
        out.push({ step: r, replaces: [code] });
      }
    }
  }
  return out;
};

const buildTrail = (a: Archetype, literal: readonly string[], landscape: Landscape): TrailStep[] => {
  let trail: TrailStep[] = a.steps.map((step) => ({ step }));
  if (a.replacementTrail) {
    const prefix: TrailStep[] = [];
    const seen = new Set<string>();
    for (const code of literal) {
      for (const r of REPLACEMENTS[code]?.steps ?? []) {
        const key = stepKeys(r).join('|');
        const existing = prefix.find((p) => stepKeys(p.step).join('|') === key);
        if (existing) existing.replaces!.push(code);
        else if (!seen.has(key)) prefix.push({ step: r, replaces: [code] });
        seen.add(key);
      }
    }
    trail = [...prefix, ...trail];
  }
  return landscape === 's4' ? applyS4Lens(trail) : trail;
};

/** A scenario's trail without a query (scenario pages), with the landscape lens applied. */
export const scenarioTrail = (a: Archetype, landscape: Landscape): TrailStep[] => buildTrail(a, [], landscape);

const confidenceOf = (score: number): Confidence => (score >= HIGH ? 'high' : score >= MEDIUM ? 'medium' : 'low');

const rankCodes = (hits: readonly WhisperHit[]): RankedCode[] => {
  const total = new Map<string, number>();
  for (const h of hits) {
    h.trail.forEach((t, i) => {
      for (const key of stepKeys(t.step)) {
        total.set(key, (total.get(key) ?? 0) + h.score / (1 + STEP_DECAY * i));
      }
    });
  }
  return [...total].map(([key, score]) => ({ key, score })).sort((a, b) => b.score - a.score);
};

const AREA_LABEL: L10n = { sk: 'Oblasť', en: 'Area' };

const TOOLBOX_TRAIL: TrailStep[] = TOOLBOX.map((t) => ({ step: { codes: t.codes, why: t.why } }));

// ─────────────────────────────────────────────────────────────── entry point
export const whisper = (query: string, options: WhisperOptions = {}): WhisperResult => {
  const { landscape = 's4', limit = 5 } = options;
  const q = analyze(query);
  const literalCodes = findLiteralCodes(q);
  const guidedOnly = q.tokens.length === 0;

  const scored = CORPUS.map((c) => scoreArchetype(c, q, literalCodes, options))
    .map((s) => {
      // 6. Coverage: reward archetypes that explain more of the query.
      const coverage = guidedOnly ? 1 : s.explained.size / q.tokens.length;
      // Almanac playbooks win ties against curated archetypes.
      const tieBreak = s.compiled.archetype.source === 'almanac' ? 0.01 : 0;
      return { ...s, score: s.raw * (0.5 + 0.5 * coverage) + (s.raw > 0 ? tieBreak : 0) };
    })
    .filter((s) => s.score >= (guidedOnly ? FILTER_BONUS : MIN_SCORE))
    .sort((a, b) => b.score - a.score);

  // With guided chips only, require every chosen chip to match.
  const required = (options.area ? FILTER_BONUS : 0) + (options.symptom ? FILTER_BONUS : 0);
  const candidates = guidedOnly ? scored.filter((s) => s.raw >= required) : scored;
  const top = candidates[0]?.score ?? 0;
  const hits: WhisperHit[] = candidates
    .filter((s) => s.score >= top * RELATIVE_CUTOFF)
    .slice(0, limit)
    .map((s) => ({
      archetype: s.compiled.archetype,
      score: Math.round(s.score * 100) / 100,
      confidence: guidedOnly ? (required >= 2 * FILTER_BONUS ? 'high' : 'medium') : confidenceOf(s.score),
      chips: s.chips,
      trail: buildTrail(s.compiled.archetype, literalCodes, landscape),
    }));

  const fallback = hits.length === 0 && (q.tokens.length > 0 || required > 0);
  return {
    query,
    analyzed: q,
    hits,
    ranking: rankCodes(hits),
    literalCodes,
    fallback,
    toolbox: TOOLBOX_TRAIL,
  };
};
