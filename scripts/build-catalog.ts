// Parses the extracted almanac text (data/raw/almanach.txt) into
// src/data/generated/catalog.json and asserts that the result agrees with
// every total the almanac states about itself:
//   • the per-area counts printed in each chapter header,
//   • the unique-code and type totals on the last page,
//   • the alphabetical index (code set and chapter of every code).
// Any mismatch exits with a non-zero code, so a bad parse can never ship.
//
// Runs on plain Node (>= 22.18 strips the TypeScript types natively):
//   node scripts/build-catalog.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type TType = 'R' | 'W' | 'A' | 'O' | 'L';
interface L10n {
  sk: string;
  en: string;
}
interface Row {
  code: string;
  area: string;
  type: TType;
  purpose: L10n;
}
interface AreaHeader {
  id: string;
  title: L10n;
  count: number;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = resolve(root, 'data/raw/almanach.txt');
const outPath = resolve(root, 'src/data/generated/catalog.json');

/** A transaction code: upper-case letters/digits, optionally namespaced (/SCWM/MON), with _ - . allowed. */
const CODE_RE = /^(?:\/[A-Z0-9_]+\/)?[A-Z0-9][A-Z0-9_.\-]*$/;
/** The English line of a row ends with the type tag, e.g. "Display sales order R / read". */
const EN_LINE_RE = /^(.+?)\s+([RWAOL]) \/ (?:read|write|admin|opt\.|legacy)$/;
const AREA_TITLE_RE = /^(\d{2}) (.+)$/;
const AREA_SUBTITLE_RE = /^(.+) · (\d+) T-codes$/;
const PAGE_RE = /^===== PAGE (\d+) =====$/;
const NOISE = [/^SAP \/ T-CODE ALMANACH/, /^Referenčný katalóg · /, /^T-CODE ÚČEL \/ PURPOSE TYP$/];

const errors: string[] = [];
const fail = (msg: string): void => {
  errors.push(msg);
};

// ---------------------------------------------------------------- pages
const pages = new Map<number, string[]>();
{
  let current = 0;
  for (const line of readFileSync(rawPath, 'utf8').split('\n')) {
    const m = PAGE_RE.exec(line);
    if (m) {
      current = Number(m[1]);
      pages.set(current, []);
    } else if (current > 0 && line.trim() !== '') {
      pages.get(current)!.push(line.trim());
    }
  }
}
const pageLines = (from: number, to: number): string[] => {
  const out: string[] = [];
  for (let p = from; p <= to; p++) out.push(...(pages.get(p) ?? []));
  return out;
};

// ---------------------------------------------------------------- code rows (pp. 6–30)
const rows: Row[] = [];
const areas: AreaHeader[] = [];
{
  const lines = pageLines(6, 30).filter((l) => !NOISE.some((re) => re.test(l)));
  let area: AreaHeader | undefined;
  let inRows = false;
  let pendingCode: string | undefined; // code that sat alone on its line
  let pendingSk: { code: string; sk: string } | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const next = lines[i + 1] ?? '';
    const title = AREA_TITLE_RE.exec(line);
    const subtitle = AREA_SUBTITLE_RE.exec(next);
    if (title && subtitle) {
      area = {
        id: title[1]!,
        title: { sk: title[2]!, en: subtitle[1]! },
        count: Number(subtitle[2]),
      };
      areas.push(area);
      inRows = false;
      i++; // consume the subtitle line
      // The intro paragraphs follow until the column header (which NOISE removed),
      // so detect the first row instead: a code token followed by text, and an EN line next.
      continue;
    }
    if (!area) continue;

    if (!inRows) {
      // Intro text runs until the first line that starts a valid row pair.
      const first = line.split(' ')[0]!;
      const looksLikeRow =
        CODE_RE.test(first) && (EN_LINE_RE.test(next) || (line === first && EN_LINE_RE.test(lines[i + 2] ?? '')));
      if (!looksLikeRow) continue;
      inRows = true;
    }

    const en = EN_LINE_RE.exec(line);
    if (en && pendingSk) {
      rows.push({
        code: pendingSk.code,
        area: area.id,
        type: en[2] as TType,
        purpose: { sk: pendingSk.sk, en: en[1]! },
      });
      pendingSk = undefined;
      continue;
    }
    if (pendingCode) {
      pendingSk = { code: pendingCode, sk: line };
      pendingCode = undefined;
      continue;
    }
    const space = line.indexOf(' ');
    const code = space === -1 ? line : line.slice(0, space);
    if (!CODE_RE.test(code) || pendingSk) {
      fail(`Unexpected line in area ${area.id}: "${line}"`);
      continue;
    }
    if (space === -1) pendingCode = code;
    else pendingSk = { code, sk: line.slice(space + 1).trim() };
  }
  if (pendingCode || pendingSk) fail(`Dangling row at end of catalog: ${pendingCode ?? pendingSk?.code}`);
}

// ---------------------------------------------------------------- self-declared totals
const lastPage = (pages.get(40) ?? []).join('\n');
const totals = /Počet unikátnych kódov: (\d+) · Sekcie: (\d+) · R: (\d+) W: (\d+) A: (\d+) O: (\d+) L: (\d+)/.exec(
  lastPage,
);
if (!totals) throw new Error('Totals line not found on page 40');
const [, totalCodes, totalAreas, ...typeCounts] = totals.map(Number);
const expectedTypes: Record<TType, number> = {
  R: typeCounts[0]!,
  W: typeCounts[1]!,
  A: typeCounts[2]!,
  O: typeCounts[3]!,
  L: typeCounts[4]!,
};

// ---------------------------------------------------------------- alphabetical index (pp. 38–39)
const index = new Map<string, string>();
{
  const lines = pageLines(38, 39);
  const start = lines.findIndex((l) => l.startsWith('Select a code to jump'));
  for (const line of lines.slice(start + 1)) {
    for (const m of line.matchAll(/(\S+) \[(\d{2})\]/g)) {
      if (index.has(m[1]!)) fail(`Index lists ${m[1]} twice`);
      index.set(m[1]!, m[2]!);
    }
  }
}

// ---------------------------------------------------------------- checks
const report: string[] = [];
const codes = new Set(rows.map((r) => r.code));
if (codes.size !== rows.length) {
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.code)) fail(`Duplicate code ${r.code}`);
    seen.add(r.code);
  }
}
const check = (ok: boolean, label: string, detail: string): void => {
  report.push(`${ok ? '✔' : '✘'} ${label}: ${detail}`);
  if (!ok) fail(`${label}: ${detail}`);
};

check(codes.size === totalCodes, 'Unique codes', `${codes.size} (almanac says ${totalCodes})`);
check(areas.length === totalAreas, 'Areas', `${areas.length} (almanac says ${totalAreas})`);
for (const a of areas) {
  const n = rows.filter((r) => r.area === a.id).length;
  if (n !== a.count) check(false, `Area ${a.id}`, `${n} rows, header says ${a.count}`);
}
check(
  areas.every((a) => rows.filter((r) => r.area === a.id).length === a.count),
  'Per-area counts',
  areas.map((a) => a.count).join(', '),
);
const typeSum = areas.reduce((s, a) => s + a.count, 0);
check(typeSum === totalCodes, 'Header counts sum', String(typeSum));
for (const t of Object.keys(expectedTypes) as TType[]) {
  const n = rows.filter((r) => r.type === t).length;
  check(n === expectedTypes[t], `Type ${t}`, `${n} (almanac says ${expectedTypes[t]})`);
}
const missingFromIndex = [...codes].filter((c) => !index.has(c));
const missingFromCatalog = [...index.keys()].filter((c) => !codes.has(c));
check(
  missingFromIndex.length === 0 && missingFromCatalog.length === 0,
  'Index code set',
  `${index.size} index entries` +
    (missingFromIndex.length ? `; not in index: ${missingFromIndex.join(' ')}` : '') +
    (missingFromCatalog.length ? `; not in catalog: ${missingFromCatalog.join(' ')}` : ''),
);
const areaMismatch = rows.filter((r) => index.has(r.code) && index.get(r.code) !== r.area);
check(
  areaMismatch.length === 0,
  'Index areas',
  areaMismatch.length ? areaMismatch.map((r) => `${r.code} ${r.area}≠${index.get(r.code)}`).join(', ') : 'all match',
);
for (const r of rows) {
  if (!r.purpose.sk || !r.purpose.en) fail(`Empty purpose for ${r.code}`);
}

console.log(report.join('\n'));
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

const catalog = {
  source: {
    title: 'SAP T-Code Almanach SK/EN',
    edition: '2026-10-23',
    pages: pages.size,
  },
  areas,
  codes: rows,
};
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(catalog, null, 1) + '\n');
console.log(`\nWrote ${rows.length} codes in ${areas.length} areas → ${outPath}`);
