# T-Coder — guide for Claude

Static, offline-first PWA: a bilingual (SK/EN) SAP T-code almanac (393 codes, 18 areas, plus 110
curated codes) and a deterministic troubleshooter ("whisper"), styled as a late-90s SAP GUI
session. Portfolio piece for employers: code quality, tests, accessibility and content accuracy
matter as much as features.
README.md has the user-facing detail (features, whisper algorithm, provenance, design) — read the
relevant section there instead of re-deriving it from code.

## Non-negotiables
- No framework, no backend, no AI/LLM, no analytics. Everything runs in the browser; user data
  (favorites, recent, history, whispers, lang, landscape) lives only in localStorage (`tcoder:v1`).
- Every user-facing string exists in both Slovak and English. Never ship one language only.
- Content is conservative: say *where to look*, never how to intervene in production.
- Author sign-off lives in `src/data/reviewed.ts` (note codes, scenario ids, quiz numbers, curated
  codes). Never add ids there — only the author does that, after checking the item.
- No SAP assets, logos or fonts. Icons are original inline SVGs (`src/ui/icons.ts`).
- Ask before every commit/push; approval does not carry over to the next one.

## Commands (Node ≥ 22.18)
```
npm run dev          # Vite dev server :5173
npm test             # Vitest (node env, tests/**/*.test.ts)
npm run typecheck    # tsc --noEmit — run after every change
npm run build        # typecheck + vite build → dist/
npm run preview      # serve dist/ :4173 (add `-- --host` for LAN demo)
npm run data:build   # re-parse data/raw/almanach.txt → src/data/generated/catalog.json (self-checking)
npm run data:extract # macOS only: PDF → data/raw/almanach.txt (PDF path: arg or ALMANAC_PDF)
npm run icons        # regenerate PWA PNG icons
npm run review       # write review/checklist.md (gitignored) and print the sign-off counts
```
Done = `npm run typecheck && npm test` green (plus `npm run data:build && git diff --exit-code
src/data/generated/catalog.json` if anything in the data pipeline was touched — CI runs exactly this,
but only when triggered by hand, so the local run is the real gate).

## Architecture (dependency direction: data → engine → ui; nothing imports upward)
```
src/types.ts      Shared domain types: L10n {sk,en}, TCode, TType R/W/A/O/L, Step, Symptom, Landscape
src/config.ts     AUTHOR (placeholders) and SYSTEM id shown in the status bar
src/state.ts      `store`: localStorage-backed state + subscribe(); parseState() is defensive
src/router.ts     Hash routes. `Route` union, parseHash() ⇄ href() are inverses; navigate()
src/main.ts       Font/CSS imports, render(route) switch → view, re-render on lang/landscape change
src/data/         Content only, no logic beyond lookups
  generated/catalog.json  GENERATED — never hand-edit; change scripts/build-catalog.ts or the raw text
  codes-curated.ts  CURATED_CODES: ~110 codes not in the almanac, c(code, area, type, sk, en)
  catalog.ts      ALMANAC_CODES, CURATED_CODES, CODES (merged per area, almanac first), AREAS,
                  CODE_COUNTS, isCurated, getCode/hasCode/lookupCode/codesInArea
  archetypes.ts   ~66 whisper scenarios (10 almanac playbooks + curated); sig()/pat()/step() helpers
  notes-tech.ts / notes-business.ts → notes.ts   ~81 curated notes, built with note() from note.ts
  reviewed.ts     author-owned sign-off list; notes.ts derives Note.reviewed from it
  areas.ts, processes.ts, reference.ts, replacements.ts (legacy→S/4), quiz.ts   hand-transcribed
  examples.ts     WHISPER_EXAMPLES: clickable example queries {q: L10n, id} (first 4 also on Home)
src/engine/       PURE functions, no DOM, unit-tested: normalize, fuzzy, search, command, related,
                  explain, whisper, daily. Whisper tuning constants sit at the top of whisper.ts.
src/i18n/         en.ts defines the keys (MessageKey); sk.ts is Record<MessageKey,string>, so a
                  missing translation is a compile error. t(key, vars) for UI, tr(l10n) for content.
src/ui/
  dom.ts          h(tag, attrs, ...children) hyperscript. Text is always a text node — never use
                  innerHTML / insertAdjacentHTML. `on*` attrs become listeners.
  shell.ts        SAP GUI window chrome (menus, command field, toolbar, title). Views return a
                  `Screen` {title, titleCode?, transaction, code?, appToolbar?, content}.
  status.ts       status(type 'S'|'W'|'E'|'I', text) → aria-live status bar; copyText()
  components/     basics (groupBox, button, linkButton, codeLink, typeBadge, stepCodes, lead),
                  alvGrid, tree (WAI-ARIA), tabStrip, flow
  views/          One file per route, `xxxView(...args): Screen`
src/styles/       tokens.css (all colours/metrics as CSS vars) · chrome · components · views.
                  BEM-ish classes (`screen__body`). Cards below 640px; 44px touch targets.
scripts/          build-catalog.ts, review-export.ts (both run on plain Node type-stripping, so the
                  data files they import must stay JSON-free), extract-pdf.mjs, make-icons.mjs
tests/            content integrity, whisper golden queries, normalize, search/command,
                  related/explain, router/state, WCAG contrast
```

## Code conventions
- TypeScript strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes +
  noPropertyAccessFromIndexSignature + erasableSyntaxOnly (no enums/namespaces/param properties).
  Optional props are omitted, not set to `undefined` (see how parseHash builds the whisper route).
- Relative imports include the `.ts` extension; type-only imports use `import type`.
- Arrow-function exports, small modules, named exports only. Comments explain *why*.
- Prettier-like style: 2 spaces, single quotes, semicolons, trailing commas, LF.

## Recipes
- **New route:** add a variant to `Route`, a branch in parseHash() *and* href() (router.ts), a case
  in render() (main.ts), a view in src/ui/views/. Add a round-trip case to tests/router-state.test.ts.
- **New UI string:** add the key to en.ts, then to sk.ts (the compiler enforces it).
- **New whisper scenario:** add to CURATED in archetypes.ts with unique id, areas, symptoms,
  bilingual title/summary, signals (synonym groups; terms pass through normalizeTerm so
  diacritics are fine), optional regex patterns, and steps using catalog codes only. Add a
  golden query to tests/whisper.test.ts and confirm existing golden queries still pass.
- **New curated code:** add to CURATED_CODES in codes-curated.ts under its area, with an almanac type
  (R/W/A/O/L) and short SK/EN purposes; English "Create/Change/Display X" pairs siblings. Only codes
  that surely exist; never one the almanac already lists. A type L code needs a REPLACEMENTS entry.
  It stays unreviewed until the author adds it to `REVIEWED.codes`.
- **New curated note:** add to notes-tech.ts or notes-business.ts with note([sk,en], tips,
  pitfalls, s4?) — 2–4 tips, 1–3 pitfalls; it counts as unreviewed until the author lists it.
- **Content review:** `npm run review` → the author reads review/checklist.md and adds checked ids to
  `src/data/reviewed.ts`; content fixes go into src/data/ first. Unknown ids fail the script and tests.
- **Colour change:** edit tokens.css only; new text/background pairs go into tests/contrast.test.ts.

## Invariants enforced by tests/CI (don't break, don't "fix" the tests)
- Almanac (ALMANAC_CODES): 393 unique codes, 18 areas, type totals R123/W134/A89/O30/L17; the parser
  also checks per-chapter counts and the alphabetical index. CI fails if catalog.json drifts.
- Curated codes: ≥100, unique, none in the almanac, almanac area + type, upper case. Content
  transcribed from the almanac (fast start, processes, playbooks 1–10, quiz) uses almanac codes only.
- Every code referenced anywhere (trails, processes, notes, quiz, replacements, fast start = 48)
  must exist in the catalog. The only non-T-code step allowed is Fiori app `F3473`.
- REPLACEMENTS keys are legacy (type L) codes only.
- Exactly 10 almanac playbooks (playbook 1–10), ≥40 curated scenarios, unique ids.
- Every fast-start, playbook and process code has a note (except FBL3N, VA05); ≥80 notes.
- 20 quiz items. Every {sk,en} object in the content is non-empty in both languages.
- REVIEWED ids all exist (codes: curated codes only), each listed once; `NOTES[code].reviewed` is true exactly for listed codes.
- Whisper: digit-bearing tokens match exactly only (ME21N ≠ ME22N); no match → toolbox fallback.
- Every whisper example ranks its `id` first, in SK and EN, with at least medium confidence.

## Project state (as of 2026-11-05)
- Live on GitHub Pages since 2026-11-05: https://shawoll.github.io/t-coder/ (repo public).
  The workflow runs only on manual trigger (workflow_dispatch) to save Actions minutes; never add
  push/PR triggers back. A push does not update the site: run Actions › Test and deploy on main.
  The deploy job also needs the repository variable `DEPLOY_PAGES=true` (set).
- Author name is set (Richard Kollar, also in LICENSE). AUTHOR links (linkedin, repository, contact)
  in src/config.ts are still empty, so the About page hides them.
- Curated content (notes, curated scenarios, quiz model answers) still awaits author review;
  progress is in `src/data/reviewed.ts` (`npm run review`).
- Source PDF is the author's own almanac; data/raw/almanach.txt is committed so builds need no macOS.
