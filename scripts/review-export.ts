// Writes review/checklist.md: every curated item (notes, whisper scenarios,
// quiz, curated T-codes) with Slovak and English side by side, ticked when its
// id is in src/data/reviewed.ts. The file is gitignored; regenerate it after edits.
//
// Runs on plain Node (>= 22.18 strips the TypeScript types natively):
//   node scripts/review-export.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARCHETYPES, type Archetype } from '../src/data/archetypes.ts';
import { CURATED_CODES } from '../src/data/codes-curated.ts';
import { NOTES } from '../src/data/notes.ts';
import { QUIZ } from '../src/data/quiz.ts';
import { REVIEWED, isCodeReviewed, isQuizReviewed, isScenarioReviewed } from '../src/data/reviewed.ts';
import { isFioriStep, type Catalog, type L10n, type Step } from '../src/types.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(root, 'review/checklist.md');
// catalog.ts imports JSON the Vite way, which plain Node cannot, so read the file.
const catalog = JSON.parse(readFileSync(resolve(root, 'src/data/generated/catalog.json'), 'utf8')) as Catalog;

/** Backslash-escape Markdown punctuation so content renders literally inside table cells. */
const esc = (s: string): string => s.replace(/\s+/g, ' ').replace(/[\\`*_<>[\]|]/g, '\\$&');

const box = (done: boolean): string => (done ? '[x]' : '[ ]');

/** One table with SK and EN in adjacent columns. */
const table = (rows: readonly (readonly [label: string, text: L10n])[]): string[] => [
  '| | SK | EN |',
  '|---|---|---|',
  ...rows.map(([label, t]) => `| ${esc(label)} | ${esc(t.sk)} | ${esc(t.en)} |`),
  '',
];

const stepRow = (s: Step, i: number): [string, L10n] =>
  isFioriStep(s) ? [`${i + 1}. Fiori ${s.fiori} (${s.label.en})`, s.why] : [`${i + 1}. ${s.codes.join(' / ')}`, s.why];

const out: string[] = [];
const push = (...lines: string[]) => out.push(...lines);

// ── Notes, grouped by catalog area in almanac order ─────────────────────
const noteCodes = new Set(Object.keys(NOTES));
const allCodes = [...catalog.codes, ...CURATED_CODES];
const notesByArea = catalog.areas
  .map((a) => ({ area: a, codes: allCodes.filter((c) => c.area === a.id && noteCodes.has(c.code)) }))
  .filter((g) => g.codes.length > 0);

const reviewedNotes = Object.values(NOTES).filter((n) => n.reviewed).length;

push('## 1. Notes', '', 'Curated for T-Coder. Check accuracy and that nothing reads as a production procedure.', '');
for (const { area, codes } of notesByArea) {
  push(`### ${area.id} · ${area.title.en} / ${area.title.sk}`, '');
  for (const c of codes) {
    const n = NOTES[c.code];
    if (!n) continue;
    push(`#### ${c.code} — ${c.purpose.en}`, '', `- ${box(n.reviewed)} \`'${c.code}'\` → \`REVIEWED.notes\``, '');
    push(
      ...table([
        ['When to use', n.whenToUse],
        ...n.tips.map((t, i): [string, L10n] => [`Tip ${i + 1}`, t]),
        ...n.pitfalls.map((p, i): [string, L10n] => [`Pitfall ${i + 1}`, p]),
        ...(n.s4 ? [['S/4HANA', n.s4] as [string, L10n]] : []),
      ]),
    );
  }
}

// ── Whisper scenarios ───────────────────────────────────────────────────
const scenario = (a: Archetype) => {
  const meta = `areas ${a.areas.join(', ')} · symptoms ${a.symptoms.join(', ')}`;
  push(`### ${a.playbook ? `Playbook ${a.playbook}: ` : ''}${a.title.en}`, '');
  push(`- ${box(isScenarioReviewed(a.id))} \`'${a.id}'\` → \`REVIEWED.scenarios\` · ${meta}`, '');
  push(
    ...table([
      ['Title', a.title],
      ['Summary', a.summary],
      ...a.steps.map(stepRow),
      ...(a.caution ? [['Caution', a.caution] as [string, L10n]] : []),
    ]),
  );
};

const playbooks = ARCHETYPES.filter((a) => a.source === 'almanac');
const curated = ARCHETYPES.filter((a) => a.source === 'curated');

push('## 2. Almanac playbooks', '', 'Transcribed from almanac pp. 31–33: compare against the PDF. Step "why" lines are condensed.', '');
playbooks.forEach(scenario);
push('## 3. Curated scenarios', '', 'Written for T-Coder. Check the trail order, the codes and the wording.', '');
curated.forEach(scenario);

// ── Quiz ────────────────────────────────────────────────────────────────
push('## 4. Quiz', '', 'Questions are transcribed from almanac pp. 37–38; model answers are curated.', '');
QUIZ.forEach((item, i) => {
  const n = i + 1;
  push(`### Question ${n}`, '', `- ${box(isQuizReviewed(n))} \`${n}\` → \`REVIEWED.quiz\` · codes ${item.codes.join(', ')}`, '');
  push(...table([['Question', item.question], ['Model answer', item.answer]]));
});

// ── Curated T-codes, grouped by area ────────────────────────────────────
push(
  '## 5. Curated codes',
  '',
  'Added for T-Coder, not in the almanac. Check that the code exists under this name, the type tag',
  '(R read, W write, A admin, O optional component, L legacy) and both purposes.',
  '',
);
for (const area of catalog.areas) {
  const codes = CURATED_CODES.filter((c) => c.area === area.id);
  if (!codes.length) continue;
  push(`### ${area.id} · ${area.title.en} / ${area.title.sk}`, '', '| | Code | Type | SK | EN |', '|---|---|---|---|---|');
  for (const c of codes) {
    push(`| ${box(isCodeReviewed(c.code))} | \`'${c.code}'\` | ${c.type} | ${esc(c.purpose.sk)} | ${esc(c.purpose.en)} |`);
  }
  push('');
}

// ── Header, unknown ids, write ──────────────────────────────────────────
const reviewedScenarios = ARCHETYPES.filter((a) => isScenarioReviewed(a.id)).length;
const reviewedQuiz = QUIZ.filter((_, i) => isQuizReviewed(i + 1)).length;
const reviewedCodes = CURATED_CODES.filter((c) => isCodeReviewed(c.code)).length;
const summary =
  `Reviewed: notes ${reviewedNotes}/${noteCodes.size} · ` +
  `scenarios ${reviewedScenarios}/${ARCHETYPES.length} · quiz ${reviewedQuiz}/${QUIZ.length} · ` +
  `codes ${reviewedCodes}/${CURATED_CODES.length}`;

// sv-SE formats as YYYY-MM-DD in local time (toISOString would give the UTC date).
const today = new Date().toLocaleDateString('sv-SE');
const header = [
  '# T-Coder — content review checklist',
  '',
  `Generated by \`npm run review\` on ${today}. Do not edit this file; it is overwritten.`,
  '',
  'When an item is correct in both languages, add the quoted id to the named list in `src/data/reviewed.ts`',
  'and run `npm run review` again. Fix wrong content in `src/data/` first.',
  '',
  `**${summary}**`,
  '',
  `1. Notes (${noteCodes.size})`,
  `2. Almanac playbooks (${playbooks.length})`,
  `3. Curated scenarios (${curated.length})`,
  `4. Quiz (${QUIZ.length})`,
  `5. Curated codes (${CURATED_CODES.length}) → \`REVIEWED.codes\``,
  '',
];

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, [...header, ...out].join('\n'));
console.log(`${summary}\nWrote ${relative(root, outPath)}`);

// The tests catch these too; reporting them here saves a round trip.
const scenarioIds = new Set(ARCHETYPES.map((a) => a.id));
const unknown = [
  ...REVIEWED.notes.filter((c) => !noteCodes.has(c)).map((c) => `notes: '${c}'`),
  ...REVIEWED.scenarios.filter((id) => !scenarioIds.has(id)).map((id) => `scenarios: '${id}'`),
  ...REVIEWED.quiz.filter((n) => !Number.isInteger(n) || n < 1 || n > QUIZ.length).map((n) => `quiz: ${n}`),
  ...REVIEWED.codes.filter((c) => !CURATED_CODES.some((x) => x.code === c)).map((c) => `codes: '${c}'`),
];
if (unknown.length > 0) {
  console.error(`Unknown ids in src/data/reviewed.ts: ${unknown.join(', ')}`);
  process.exitCode = 1;
}
