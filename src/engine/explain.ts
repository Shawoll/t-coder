// Generated context for every catalog code, built only from almanac facts:
// type legend, safety rule, chapter, legacy replacement and verification steps.

import { getArea, getCode } from '../data/catalog.ts';
import { FAST_START_CODES, TYPE_LEGEND, VERIFY_STEPS } from '../data/reference.ts';
import { getReplacement, type Replacement } from '../data/replacements.ts';
import type { L10n, TCode, TType } from '../types.ts';

export interface Explanation {
  code: TCode;
  /** One generated paragraph that ties the facts together. */
  summary: L10n;
  typeLabel: L10n;
  typeMeaning: L10n;
  /** The almanac's safety rule, phrased for this type. */
  safety: L10n;
  /** Command-field forms: /nCODE (same session) and /oCODE (new session). */
  forms: string[];
  namespace?: L10n;
  replacement?: Replacement;
  fastStart: boolean;
  verify: readonly L10n[];
}

const SAFETY: Record<TType, L10n> = {
  R: {
    sk: 'Len na čítanie neznamená neškodné: aj „R“ môže sprístupniť citlivé údaje.',
    en: 'Read-only is not harmless: even an "R" screen may reveal sensitive data.',
  },
  W: {
    sk: '„W“ nikdy nespúšťaj na produkcii bez oprávnenia, testu a schválenia.',
    en: 'Never run a "W" code on production without authorization, testing and approval.',
  },
  A: {
    sk: '„A“ nikdy nespúšťaj na produkcii bez oprávnenia, testu a schválenia; dopad môže byť celosystémový.',
    en: 'Never run an "A" code on production without authorization, testing and approval; the impact can be system-wide.',
  },
  O: {
    sk: 'Voliteľný komponent: over, či je v tvojom systéme a release aktívny.',
    en: 'Optional component: check that it is active in your system and release.',
  },
  L: {
    sk: 'Legacy: v S/4HANA je nahradený alebo neodporúčaný. Over Simplification List.',
    en: 'Legacy: replaced or not recommended in S/4HANA. Check the Simplification List.',
  },
};

const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

export const explain = (codeId: string): Explanation | undefined => {
  const code = getCode(codeId);
  if (!code) return undefined;
  const area = getArea(code.area);
  const legend = TYPE_LEGEND[code.type];
  const replacement = getReplacement(code.code);
  const fastStart = FAST_START_CODES.has(code.code);
  const namespaced = code.code.startsWith('/');

  const areaSk = area ? `kapitoly ${area.id} – ${area.title.sk}` : 'almanachu';
  const areaEn = area ? `chapter ${area.id}, ${area.title.en}` : 'the almanac';
  const replacementCodes = replacement?.steps
    .map((s) => ('fiori' in s ? `Fiori ${s.fiori}` : s.codes.join('/')))
    .join(' + ');

  const summary: L10n = {
    sk:
      `${code.code} patrí do ${areaSk}. Účel: ${lower(code.purpose.sk)}. ` +
      `Značka ${code.type} – ${lower(legend.label.sk)}.` +
      (replacementCodes ? ` V S/4HANA použi ${replacementCodes}.` : '') +
      (fastStart ? ' Patrí medzi 48 kódov rýchleho štartu.' : ''),
    en:
      `${code.code} belongs to ${areaEn}. Purpose: ${lower(code.purpose.en)}. ` +
      `Tagged ${code.type}: ${lower(legend.label.en)}.` +
      (replacementCodes ? ` In S/4HANA use ${replacementCodes} instead.` : '') +
      (fastStart ? ' It is one of the 48 fast-start codes.' : ''),
  };

  const explanation: Explanation = {
    code,
    summary,
    typeLabel: legend.label,
    typeMeaning: legend.meaning,
    safety: SAFETY[code.type],
    forms: [`/n${code.code}`, `/o${code.code}`],
    fastStart,
    verify: VERIFY_STEPS,
  };
  if (namespaced) {
    explanation.namespace = {
      sk: `Transakcia s menným priestorom: v príkazovom poli ju zadaj s prefixom, napr. /n${code.code}.`,
      en: `Namespaced transaction: in the command field, type it with a prefix, e.g. /n${code.code}.`,
    };
  }
  if (replacement) explanation.replacement = replacement;
  return explanation;
};
