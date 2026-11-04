import type { FioriId, L10n } from '../types.ts';

/** One chevron in a process flow: a label plus the codes (or Fiori app) to use there. */
export interface Touchpoint {
  label: L10n;
  codes: string[];
  fiori?: FioriId;
  hint?: L10n;
}

export interface Process {
  id: string;
  short: string;
  title: L10n;
  /** The almanac's stage line, verbatim. */
  stages: L10n;
  touchpoints: Touchpoint[];
  note?: L10n;
}

/** End-to-end business process maps (almanac p. 33). */
export const PROCESSES: readonly Process[] = [
  {
    id: 'p2p',
    short: 'P2P',
    title: { sk: 'Procure-to-pay', en: 'Procure-to-pay' },
    stages: {
      sk: 'Dodávateľ a materiál → Purchase requisition → PO → Goods receipt → Invoice verification → Payment',
      en: 'Supplier/material → PR → PO → goods receipt → invoice verification → payment',
    },
    touchpoints: [
      { label: { sk: 'Dodávateľ a materiál', en: 'Supplier & material' }, codes: ['BP', 'MM03'] },
      { label: { sk: 'Požiadavka na nákup', en: 'Purchase requisition' }, codes: ['ME51N'] },
      { label: { sk: 'Nákupná objednávka', en: 'Purchase order' }, codes: ['ME21N'] },
      { label: { sk: 'Príjem tovaru', en: 'Goods receipt' }, codes: ['MIGO'] },
      { label: { sk: 'Overenie faktúry', en: 'Invoice verification' }, codes: ['MIRO'] },
      { label: { sk: 'Platba', en: 'Payment' }, codes: ['F110'] },
    ],
  },
  {
    id: 'o2c',
    short: 'O2C',
    title: { sk: 'Order-to-cash', en: 'Order-to-cash' },
    stages: {
      sk: 'Business Partner → Sales order → Delivery → Goods issue → Billing → Incoming payment',
      en: 'BP → sales order → delivery → goods issue → billing → incoming payment',
    },
    touchpoints: [
      { label: { sk: 'Business Partner', en: 'Business Partner' }, codes: ['BP'] },
      { label: { sk: 'Odberateľská objednávka', en: 'Sales order' }, codes: ['VA01'] },
      { label: { sk: 'Dodávka', en: 'Delivery' }, codes: ['VL01N', 'VL02N'] },
      {
        label: { sk: 'Výdaj tovaru (PGI)', en: 'Goods issue (PGI)' },
        codes: ['VL02N', 'MIGO'],
        hint: { sk: 'Typicky PGI v dodávke (VL02N)', en: 'Usually PGI from the delivery (VL02N)' },
      },
      { label: { sk: 'Fakturácia', en: 'Billing' }, codes: ['VF01'] },
      { label: { sk: 'Prijatá platba', en: 'Incoming payment' }, codes: ['F-28'] },
    ],
    note: {
      sk: 'Pri O2C sa goods issue typicky účtuje z dodávky cez VL02N; MIGO nie je univerzálna alternatíva PGI.',
      en: 'In O2C, posting goods issue is commonly executed from delivery processing (VL02N); MIGO is not a universal replacement.',
    },
  },
  {
    id: 'plan2produce',
    short: 'Plan-to-produce',
    title: { sk: 'Plan-to-produce', en: 'Plan-to-produce' },
    stages: {
      sk: 'Materiál a BOM → PIR/MRP → Planned order → Production order → Confirmation → Goods movement',
      en: 'Material/BOM → demand/MRP → planned order → production order → confirmation → stock posting',
    },
    touchpoints: [
      { label: { sk: 'Materiál a kusovník', en: 'Material & BOM' }, codes: ['MM03', 'CS03'] },
      { label: { sk: 'Potreby a MRP', en: 'Demand & MRP' }, codes: ['MD61', 'MD01N', 'MD04'] },
      { label: { sk: 'Plánovaná objednávka', en: 'Planned order' }, codes: ['MD11'] },
      { label: { sk: 'Výrobný príkaz', en: 'Production order' }, codes: ['CO01'] },
      { label: { sk: 'Potvrdenie', en: 'Confirmation' }, codes: ['CO11N'] },
      { label: { sk: 'Skladový pohyb', en: 'Stock posting' }, codes: ['MIGO'] },
    ],
  },
  {
    id: 'r2r',
    short: 'R2R',
    title: { sk: 'Record-to-report', en: 'Record-to-report' },
    stages: {
      sk: 'Hlavná kniha → Podklady FI/CO → Uzávierka → Reconciliation → Reportovanie',
      en: 'G/L and subledgers → close → reconciliation → reporting',
    },
    touchpoints: [
      { label: { sk: 'Hlavná kniha', en: 'G/L' }, codes: ['FS00', 'FB03'] },
      {
        label: { sk: 'Vedľajšie knihy a reconciliation', en: 'Subledgers & reconciliation' },
        codes: ['FBL1N', 'FBL5N', 'FAGLL03'],
      },
      {
        label: { sk: 'Reportovanie', en: 'Reporting' },
        codes: ['F.01'],
        hint: { sk: 'alebo Fiori reporty', en: 'or Fiori reports' },
      },
    ],
  },
  {
    id: 'migration',
    short: 'Migration',
    title: { sk: 'Pripravenosť na migráciu', en: 'Migration readiness' },
    stages: {
      sk: 'Scope a data quality → Mapping → Mock migration → Reconciliation → Cutover → Hypercare',
      en: 'Scope/data quality → mapping → mock load → reconciliation → cutover → hypercare',
    },
    touchpoints: [
      { label: { sk: 'Príprava CVI (ECC)', en: 'CVI preparation (ECC)' }, codes: ['CVI_COCKPIT'] },
      { label: { sk: 'Migrate Your Data', en: 'Migrate Your Data' }, codes: [], fiori: 'F3473' },
      { label: { sk: 'Migračné objekty', en: 'Migration objects' }, codes: ['LTMOM'] },
      {
        label: { sk: 'Procesné validácie', en: 'Process validation' },
        codes: [],
        hint: {
          sk: 'Reconciliation počtov, súčtov a statusov s vlastníkmi procesov',
          en: 'Reconcile counts, totals and statuses with process owners',
        },
      },
    ],
    note: {
      sk: 'Pri migračnom prístupe odliš greenfield migráciu od system conversion alebo selective data transition.',
      en: 'Distinguish greenfield migration, system conversion and selective data transition.',
    },
  },
];

export const getProcess = (id: string): Process | undefined => PROCESSES.find((p) => p.id === id);
