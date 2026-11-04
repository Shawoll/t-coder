#!/usr/bin/env node
// Extracts the almanac PDF to plain text, page by page, using macOS PDFKit
// through JXA (osascript -l JavaScript). No npm dependencies are needed.
// The output (data/raw/almanach.txt) is committed, so the rest of the
// pipeline and the build run on any OS.
//
// Usage: node scripts/extract-pdf.mjs [path/to/almanac.pdf]

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = resolve(
  process.argv[2] ??
    process.env.ALMANAC_PDF ??
    resolve(root, '../SAP/pdfs/SAP_T_Code_Almanach_SK_EN_2026.pdf'),
);
const outPath = resolve(root, 'data/raw/almanach.txt');

if (process.platform !== 'darwin') {
  console.error('extract-pdf needs macOS (PDFKit). The extracted text is committed; run `npm run data:build` instead.');
  process.exit(1);
}

// Each page is wrapped in a marker line so the parser can track page numbers.
const jxa = `
ObjC.import('PDFKit');
function run(argv) {
  const url = $.NSURL.fileURLWithPath(argv[0]);
  const doc = $.PDFDocument.alloc.initWithURL(url);
  if (!doc || doc.isNil()) throw new Error('Cannot open PDF: ' + argv[0]);
  const out = [];
  const n = doc.pageCount;
  for (let i = 0; i < n; i++) {
    const s = doc.pageAtIndex(i).string;
    out.push('===== PAGE ' + (i + 1) + ' =====');
    out.push(s && !s.isNil() ? s.js : '');
  }
  return out.join('\\n');
}
`;

const text = execFileSync('osascript', ['-l', 'JavaScript', '-e', jxa, pdfPath], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

mkdirSync(dirname(outPath), { recursive: true });
// PDFKit may emit U+2028 line separators and CRs; normalise them to \n.
const cleaned = text.replace(/\r\n?|\u2028|\u2029/g, '\n').normalize('NFC');
writeFileSync(outPath, cleaned.endsWith('\n') ? cleaned : cleaned + '\n');
const pages = (cleaned.match(/^===== PAGE \d+ =====$/gm) ?? []).length;
console.log(`Extracted ${pages} pages → ${outPath}`);
