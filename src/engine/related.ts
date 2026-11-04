import { ARCHETYPES, type Archetype } from '../data/archetypes.ts';
import { CODES, codesInArea, getCode } from '../data/catalog.ts';
import { PROCESSES, type Process } from '../data/processes.ts';
import { isFioriStep } from '../types.ts';

const VERB_ORDER = ['Create', 'Change', 'Display'] as const;
type Verb = (typeof VERB_ORDER)[number];

/** "Create sales order" → { verb: Create, object: "sales order" }; parentheticals are ignored. */
const verbObject = (en: string): { verb: Verb; object: string } | undefined => {
  const m = /^(Create|Change|Display) (.+?)(?:\s*\(.*\))?$/.exec(en);
  return m ? { verb: m[1] as Verb, object: m[2]!.toLowerCase() } : undefined;
};

/**
 * Create / change / display siblings. Swap one digit of the code for 1, 2 or 3
 * at the same position and keep the candidate only if it exists in the
 * catalog and its English purpose is the same object with another of the
 * three verbs: VA01 → VA02, VA03 (but not VA11, a sales *inquiry*).
 */
export const siblings = (code: string): string[] => {
  const self = getCode(code);
  const own = self && verbObject(self.purpose.en);
  if (!own) return [];
  const found = new Map<string, Verb>();
  for (let i = 0; i < code.length; i++) {
    if (!/\d/.test(code[i]!)) continue;
    for (const d of '123') {
      if (d === code[i]) continue;
      const candidate = `${code.slice(0, i)}${d}${code.slice(i + 1)}`;
      const other = getCode(candidate);
      const vo = other && verbObject(other.purpose.en);
      if (vo && vo.object === own.object && vo.verb !== own.verb) found.set(candidate, vo.verb);
    }
  }
  return [...found].sort((a, b) => VERB_ORDER.indexOf(a[1]) - VERB_ORDER.indexOf(b[1])).map(([c]) => c);
};

const archetypeCodes = (a: Archetype): string[] => a.steps.flatMap((s) => (isFioriStep(s) ? [] : s.codes));
const processCodes = (p: Process): string[] => p.touchpoints.flatMap((t) => t.codes);

/** Reverse index: code → the playbooks, archetypes and processes that use it. */
const REVERSE = new Map<string, { archetypes: Set<Archetype>; processes: Set<Process> }>();
const entry = (code: string) => {
  let e = REVERSE.get(code);
  if (!e) REVERSE.set(code, (e = { archetypes: new Set(), processes: new Set() }));
  return e;
};
for (const a of ARCHETYPES) for (const c of archetypeCodes(a)) entry(c).archetypes.add(a);
for (const p of PROCESSES) for (const c of processCodes(p)) entry(c).processes.add(p);

export interface UsedIn {
  playbooks: Archetype[];
  archetypes: Archetype[];
  processes: Process[];
}

export const usedIn = (code: string): UsedIn => {
  const e = REVERSE.get(code);
  const archetypes = [...(e?.archetypes ?? [])];
  return {
    playbooks: archetypes.filter((a) => a.source === 'almanac'),
    archetypes: archetypes.filter((a) => a.source === 'curated'),
    processes: [...(e?.processes ?? [])],
  };
};

const CATALOG_ORDER = new Map(CODES.map((c, i) => [c.code, i]));

/** Codes that share playbooks, archetypes or processes with this one, most shared first. */
export const coOccurring = (code: string, limit = 8): string[] => {
  const counts = new Map<string, number>();
  const { playbooks, archetypes, processes } = usedIn(code);
  const groups = [
    ...[...playbooks, ...archetypes].map(archetypeCodes),
    ...processes.map(processCodes),
  ];
  for (const group of groups) {
    for (const other of new Set(group)) {
      if (other !== code) counts.set(other, (counts.get(other) ?? 0) + 1);
    }
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || (CATALOG_ORDER.get(a[0]) ?? 0) - (CATALOG_ORDER.get(b[0]) ?? 0))
    .slice(0, limit)
    .map(([c]) => c);
};

/** Other codes of the same almanac chapter. */
export const sameArea = (code: string, exclude: readonly string[] = []): string[] => {
  const self = getCode(code);
  if (!self) return [];
  return codesInArea(self.area)
    .map((c) => c.code)
    .filter((c) => c !== code && !exclude.includes(c));
};
