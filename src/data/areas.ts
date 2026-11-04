import type { AreaId, L10n } from '../types.ts';

export interface AreaInfo {
  /** Short label for chips and tree nodes. */
  short: L10n;
  /** The chapter introduction, transcribed from the almanac. */
  intro: L10n;
  /**
   * Normalised keywords (no diacritics) that hint at this area in a whisper
   * query. They earn a small bonus for archetypes of the area.
   */
  keywords: string[];
}

/** Hand-transcribed chapter intros (almanac pp. 6–30), keyed by chapter number. */
export const AREA_INFO: Record<AreaId, AreaInfo> = {
  '01': {
    short: { sk: 'Navigácia', en: 'Navigation' },
    intro: {
      sk: 'Najprv zisti, či ide o kód SAP GUI, Fiori aplikáciu alebo Z/Y zákaznícku transakciu. SE93 opisuje transakciu; TSTC obsahuje technické kódy a TSTCT ich popisy.',
      en: 'Start by confirming whether you are dealing with a SAP GUI transaction, Fiori app, or Z/Y customer transaction. SE93 defines transactions; TSTC and TSTCT store codes and descriptions.',
    },
    keywords: ['menu', 'tabulka', 'table', 'navigacia', 'navigation'],
  },
  '02': {
    short: { sk: 'ABAP', en: 'ABAP' },
    intro: {
      sk: 'V klasickom ABAP-e sú tieto nástroje bežné. Pri ABAP Cloud preferuj Eclipse ADT, released APIs, CDS a RAP; starý Workbench nemusí byť povolený.',
      en: 'These are common in classic ABAP. For ABAP Cloud, prefer Eclipse ADT, released APIs, CDS and RAP; classic Workbench tools may be unavailable.',
    },
    keywords: ['abap', 'program', 'report', 'code', 'kod', 'badi', 'enhancement', 'class', 'trieda'],
  },
  '03': {
    short: { sk: 'Basis', en: 'Basis' },
    intro: {
      sk: 'Monitor ≠ oprávnenie na zásah. Uvoľňovanie zámkov, jobov alebo výmena parametrov v produkcii vyžaduje schválený postup.',
      en: 'Monitoring does not imply permission to intervene. Releasing locks, changing jobs or parameters in production requires an approved procedure.',
    },
    keywords: ['basis', 'system', 'server', 'job', 'dump', 'log', 'spool'],
  },
  '04': {
    short: { sk: 'Bezpečnosť', en: 'Security' },
    intro: {
      sk: 'SU53 zachytáva poslednú neúspešnú kontrolu, nie kompletnú pravdu o role. Na širšiu diagnostiku použi STAUTHTRACE a analýzu konkrétnych objektov.',
      en: 'SU53 shows the last failed check, not the full story. Use STAUTHTRACE and role/object analysis for deeper diagnosis.',
    },
    keywords: ['security', 'bezpecnost', 'rola', 'role', 'opravnenie', 'authorization', 'user', 'pouzivatel'],
  },
  '05': {
    short: { sk: 'Transporty', en: 'Transports' },
    intro: {
      sk: 'Transport nie je iba prenos súboru. Over závislosti, poradie importu, plán nasadenia, kontrolné body, testy a rollback/forward-fix.',
      en: 'A transport is not just file movement. Check dependencies, import order, release plan, validation gates and rollback/forward-fix.',
    },
    keywords: ['transport', 'request', 'upgrade', 'customizing', 'tms'],
  },
  '06': {
    short: { sk: 'Integrácie', en: 'Integration' },
    intro: {
      sk: 'Pri integráciách vyhľadaj identifikátor správy, čas, systém odosielateľa/príjemcu, status a prvú skutočnú príčinu. Reprocessing môže duplikovať operáciu.',
      en: 'For integrations, trace message ID, timestamp, sender/receiver, status and first root cause. Reprocessing can duplicate business operations.',
    },
    keywords: ['idoc', 'rfc', 'qrfc', 'trfc', 'interface', 'rozhranie', 'integracia', 'integration', 'odata', 'soap', 'ale'],
  },
  '07': {
    short: { sk: 'MM nákup', en: 'MM purchasing' },
    intro: {
      sk: 'Nákupný proces nie je len ME21N. Master data, schvaľovanie, objednávka, GR, invoice verification a platba tvoria jeden end-to-end tok.',
      en: 'Procurement is not just ME21N. Master data, approvals, PO, goods receipt, invoice verification and payment form one end-to-end flow.',
    },
    keywords: ['mm', 'nakup', 'purchasing', 'purchase', 'po', 'objednavka', 'supplier', 'dodavatel'],
  },
  '08': {
    short: { sk: 'Zásoby a faktúry', en: 'Inventory & invoices' },
    intro: {
      sk: 'Oddel fyzický stav zásoby, pohybový doklad a účtovný dopad. Druhy pohybov (101, 201, 261...) nie sú T-kódy. Klasické MB1* postupy nahraď MIGO/Fiori.',
      en: 'Separate physical stock, material document and accounting impact. Movement types (101, 201, 261...) are not T-codes. Prefer MIGO/Fiori to legacy MB1* flows.',
    },
    keywords: ['mm', 'stock', 'zasoba', 'zasoby', 'inventory', 'inventura', 'invoice', 'faktura', 'goods'],
  },
  '09': {
    short: { sk: 'SD predaj', en: 'SD sales' },
    intro: {
      sk: 'Order-to-cash sleduj cez objednávku, dodávku, goods issue, fakturáciu a FI doklady. Vo väčšine incidentov rieš prepojenia, nie izolovaný doklad.',
      en: 'Trace order-to-cash from sales order through delivery, goods issue, billing and FI documents. Most incidents involve document flow, not isolated records.',
    },
    keywords: ['sd', 'sales', 'predaj', 'delivery', 'dodavka', 'billing', 'fakturacia', 'customer', 'odberatel'],
  },
  '10': {
    short: { sk: 'FI účtovníctvo', en: 'FI accounting' },
    intro: {
      sk: 'V S/4HANA zohľadni Universal Journal (ACDOCA), Fiori aplikácie a rozdiely oproti starému New G/L. Obchodné pravidlá a autorizácie sú rozhodujúce.',
      en: 'In S/4HANA account for Universal Journal (ACDOCA), Fiori apps and differences from classic New G/L. Business rules and authorizations matter.',
    },
    keywords: ['fi', 'gl', 'g/l', 'ucet', 'account', 'posting', 'uctovanie', 'asset', 'majetok', 'payment', 'platba'],
  },
  '11': {
    short: { sk: 'CO controlling', en: 'CO controlling' },
    intro: {
      sk: 'Controlling pracuje s nákladovými objektmi, alokáciami a kalkuláciami. KSU5, KO88 či CK24 môžu mať veľký finančný dopad.',
      en: 'Controlling revolves around cost objects, allocations and cost estimates. KSU5, KO88 and CK24 may have major financial impact.',
    },
    keywords: ['co', 'controlling', 'cost', 'naklad', 'naklady', 'kalkulacia', 'settlement'],
  },
  '12': {
    short: { sk: 'PP výroba', en: 'PP production' },
    intro: {
      sk: 'Kusovník + routing + work center + MRP + výrobné potvrdenia tvoria integrovaný proces. MD04 je častý prvý diagnostický bod.',
      en: 'BOM + routing + work center + MRP + confirmations form one integrated process. MD04 is often the first diagnostic stop.',
    },
    keywords: ['pp', 'vyroba', 'production', 'mrp', 'bom', 'kusovnik', 'routing'],
  },
  '13': {
    short: { sk: 'LE-WM sklad', en: 'LE-WM warehouse' },
    intro: {
      sk: 'LE-WM je klasické skladové riešenie. Dostupnosť a budúcnosť závisia od cieľového release a migrácie na EWM alebo iný skladový model.',
      en: 'LE-WM is a classic warehousing solution. Availability and lifecycle depend on target release and migration to EWM or other warehouse models.',
    },
    keywords: ['wm', 'warehouse', 'sklad', 'bin', 'transfer'],
  },
  '14': {
    short: { sk: 'EWM', en: 'EWM' },
    intro: {
      sk: 'EWM je samostatný funkčný svet s warehouse task, warehouse order, bin, HU a svojimi frontami. Nie každý S/4 systém ho má aktívny.',
      en: 'EWM is a separate operational model: warehouse task, warehouse order, bin, HU and queues. Not every S/4 system has it active.',
    },
    keywords: ['ewm', 'scwm', 'warehouse', 'sklad', 'task', 'hu'],
  },
  '15': {
    short: { sk: 'QM kvalita', en: 'QM quality' },
    intro: {
      sk: 'QM prepája kontrolné plány, kontrolné dávky, výsledky a rozhodnutia. Usage decision môže vytvoriť ďalšie logistické kroky.',
      en: 'QM links inspection plans, lots, results and usage decisions. A usage decision may trigger downstream logistics.',
    },
    keywords: ['qm', 'quality', 'kvalita', 'inspection', 'kontrola'],
  },
  '16': {
    short: { sk: 'PM údržba', en: 'PM maintenance' },
    intro: {
      sk: 'PM zahŕňa zariadenie, funkčné miesto, hlásenie, údržbový príkaz a preventívny plán. Sleduj prepojenie na MM/CO.',
      en: 'PM involves equipment, functional location, notification, maintenance order and preventive plan. Trace links to MM/CO.',
    },
    keywords: ['pm', 'maintenance', 'udrzba', 'equipment', 'zariadenie'],
  },
  '17': {
    short: { sk: 'BW', en: 'BW' },
    intro: {
      sk: 'V BW rozlišuj klasické extraktory/queuy od moderných ODP, BW/4HANA či Datasphere. Nie všetky T-kódy patria do každého dátového stacku.',
      en: 'Differentiate classic BW extractors and queues from ODP, BW/4HANA and Datasphere. These codes are product-dependent.',
    },
    keywords: ['bw', 'extraction', 'extrakcia', 'datasource', 'delta', 'odp', 'query'],
  },
  '18': {
    short: { sk: 'Migrácia S/4', en: 'S/4 migration' },
    intro: {
      sk: 'Pri migráciách treba odlíšiť ECC zdroj, S/4 cieľ a zvolený spôsob prechodu. BP je moderný master-data vstup; LTMC je deprecated a LSMW nie je odporúčaný nástroj na S/4 migráciu.',
      en: 'Distinguish ECC source, S/4 target and transition approach. BP is the modern master-data entry; LTMC is deprecated and LSMW is not the recommended S/4 migration tool.',
    },
    keywords: ['migration', 'migracia', 'migracii', 'conversion', 'konverzia', 's/4', 's4', 'cutover', 'ecc'],
  },
};
