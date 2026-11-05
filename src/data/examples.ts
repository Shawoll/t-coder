// Example whisper queries shown as clickable chips on the whisper and home screens.
// `id` is the scenario each example must rank first in both languages; a test
// enforces it, so an example can never drift away from the scenario it advertises.

import type { L10n } from '../types.ts';

export interface WhisperExample {
  q: L10n;
  id: string;
}

/** The first four also appear on the home screen, so keep the strongest ones on top. */
export const WHISPER_EXAMPLES: readonly WhisperExample[] = [
  { q: { sk: 'IDoc má status 51', en: 'IDoc status 51' }, id: 'idoc-failed' },
  { q: { sk: 'faktúra je blokovaná', en: 'invoice is blocked for payment' }, id: 'invoice-blocked' },
  { q: { sk: 'používateľ nemá oprávnenie', en: 'user has no authorization' }, id: 'auth-missing' },
  { q: { sk: 'import transportu zlyhal', en: 'transport import failed, return code 8' }, id: 'transport-import-failed' },
  { q: { sk: 'objednávka sa nedá expedovať', en: 'sales order cannot be shipped' }, id: 'order-shipping-blocked' },
  { q: { sk: 'job je pomalý', en: 'job is slow' }, id: 'slow-performance' },
  { q: { sk: 'zásoby v ERP a EWM sa líšia', en: 'ERP and EWM stock differ' }, id: 'erp-ewm-mismatch' },
  { q: { sk: 'XD01 v S/4HANA', en: 'XD01 in S/4HANA' }, id: 'legacy-in-s4' },
];
