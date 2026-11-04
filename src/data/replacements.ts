import type { L10n, Step } from '../types.ts';

export interface Replacement {
  /** What to use instead in S/4HANA, in order. */
  steps: Step[];
  note: L10n;
}

const toMigo: Replacement = {
  steps: [
    {
      codes: ['MIGO'],
      why: { sk: 'Moderný vstup pre skladové pohyby', en: 'Modern entry point for goods movements' },
    },
  ],
  note: {
    sk: 'MB01/MB1A/MB1B/MB1C sú legacy; MIGO a Fiori sú preferované moderné vstupy.',
    en: 'Use MIGO/Fiori instead of legacy MB* transactions.',
  },
};

const toBp: Replacement = {
  steps: [
    {
      codes: ['BP'],
      why: {
        sk: 'Strategický vstup pre kmeňové údaje odberateľov a dodávateľov',
        en: 'Strategic entry point for customer and supplier master data',
      },
    },
  ],
  note: {
    sk: 'ECC master-data transakcie XD01/XK01/FD01/FK01 → primárne BP v S/4HANA. Niektoré staré kódy sú nedostupné alebo nevhodné; záleží na konkrétnom release.',
    en: 'Use BP as the strategic entry point for customer/supplier master data.',
  },
};

const toMigrationCockpit = (note: L10n): Replacement => ({
  steps: [
    {
      fiori: 'F3473',
      label: { sk: 'Migrate Your Data (Fiori F3473)', en: 'Migrate Your Data (Fiori F3473)' },
      why: { sk: 'Migračný kokpit S/4HANA', en: 'The S/4HANA migration cockpit' },
    },
    {
      codes: ['LTMOM'],
      why: { sk: 'Úprava migračných objektov podľa potreby', en: 'Adjust migration objects where needed' },
    },
  ],
  note,
});

/**
 * Legacy codes (type L) that have a modern replacement in the almanac.
 * SHDB and SCAT are legacy too, but the almanac names no direct successor.
 */
export const REPLACEMENTS: Readonly<Record<string, Replacement>> = {
  MB1A: toMigo,
  MB1B: toMigo,
  MB1C: toMigo,
  MB01: toMigo,
  XD01: toBp,
  XD02: toBp,
  XD03: toBp,
  XK01: toBp,
  XK02: toBp,
  XK03: toBp,
  FD01: toBp,
  FK01: toBp,
  LTMC: toMigrationCockpit({
    sk: 'LTMC je deprecated. Používaj Migrate Your Data – Migration Cockpit, Fiori app ID F3473, a podľa potreby LTMOM.',
    en: 'LTMC is deprecated; use the Fiori migration cockpit (F3473), plus LTMOM where needed.',
  }),
  LSMW: toMigrationCockpit({
    sk: 'LSMW poznaj kvôli ECC a historickým projektom. Na nové migrácie do S/4HANA ho SAP neodporúča.',
    en: 'LSMW is not the recommended S/4HANA migration approach.',
  }),
  RSA7: {
    steps: [
      {
        codes: ['ODQMON'],
        why: { sk: 'Monitor Operational Delta Queue (ODP)', en: 'Operational Delta Queue monitor (ODP)' },
      },
    ],
    note: {
      sk: 'Pri extrakcii cez ODP sleduj delty v ODQMON namiesto klasickej delta queue RSA7.',
      en: 'With ODP-based extraction, deltas are monitored in ODQMON rather than the classic RSA7 delta queue.',
    },
  },
};

export const getReplacement = (code: string): Replacement | undefined => REPLACEMENTS[code];
