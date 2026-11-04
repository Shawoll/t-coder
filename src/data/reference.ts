import type { L10n, TType } from '../types.ts';

// Hand-transcribed reference pages of the almanac (pp. 2–4, 34–36, 40).

/** Legend of the type tags (p. 2). */
export const TYPE_LEGEND: Record<TType, { label: L10n; meaning: L10n }> = {
  R: {
    label: { sk: 'Zobrazenie / čítanie', en: 'Read / inspect' },
    meaning: {
      sk: 'Primárne zobrazuje údaje. Aj čítanie však môže sprístupniť citlivé údaje.',
      en: 'Primarily displays data. Even read-only screens may reveal sensitive data.',
    },
  },
  W: {
    label: { sk: 'Vytvorenie / zmena / účtovanie', en: 'Write / change / post' },
    meaning: {
      sk: 'Vytvára, mení alebo účtuje doklady či kmeňové údaje.',
      en: 'Creates, changes or posts documents or master data.',
    },
  },
  A: {
    label: { sk: 'Administrácia, nastavenia, silný dopad', en: 'Administration / elevated impact' },
    meaning: {
      sk: 'Administrácia alebo nastavenia so širokým dopadom na systém či proces.',
      en: 'Administration or settings with a broad impact on the system or process.',
    },
  },
  O: {
    label: { sk: 'Voliteľný modul alebo závislosť od verzie', en: 'Optional component / release-specific' },
    meaning: {
      sk: 'Dostupné len s konkrétnym komponentom alebo releasom (napr. EWM, BW).',
      en: 'Only available with a specific component or release (e.g. EWM, BW).',
    },
  },
  L: {
    label: { sk: 'Legacy, nahradené alebo problematické v S/4', en: 'Legacy / replaced / S/4 caveat' },
    meaning: {
      sk: 'Historický kód; v S/4HANA nahradený alebo neodporúčaný.',
      en: 'Historical code; replaced or not recommended in S/4HANA.',
    },
  },
};

/** The almanac's safety rule for tags (p. 2). */
export const SAFETY_RULE: L10n = {
  sk: 'Značka vyjadruje primárny charakter, nie záruku oprávnenia ani bezpečnosti. Aj „R“ môže sprístupniť citlivé údaje; „W“ ani „A“ nikdy nespúšťaj na produkcii bez oprávnenia, testu a schválenia.',
  en: 'Tags describe typical intent, not permissions or safety. Read-only screens may reveal sensitive data; writes and administrative changes require proper controls.',
};

export const ESSENTIAL_NOTE: L10n = {
  sk: 'Prítomnosť T-kódu sa líši podľa produktu, release, aktívnych komponentov, zákazníckej konfigurácie a oprávnení. Kód „existuje“ neznamená, že je vhodný pre cieľový postup.',
  en: 'Availability varies by product, release, component activation, customizing and authorizations. Existence does not equal recommended usage.',
};

/** Command-field cheat sheet (p. 2), extended with the forms the app understands. */
export const COMMAND_TIPS: { form: string; text: L10n }[] = [
  { form: '/n', text: { sk: 'Ukončí aktuálnu transakciu', en: 'Ends current transaction' } },
  { form: '/nST22', text: { sk: 'Otvorí ST22 v aktuálnej session', en: 'Opens ST22 in current session' } },
  { form: '/o', text: { sk: 'Otvorí novú session', en: 'Opens a new session' } },
  { form: '/oSM37', text: { sk: 'SM37 v novej session', en: 'SM37 in a new session' } },
  { form: '/n/SCWM/MON', text: { sk: 'Kódy s menným priestorom zadaj celé', en: 'Type namespaced codes in full' } },
  { form: 'F1 / F4', text: { sk: 'Pomoc k poľu / vyhľadávacia pomoc', en: 'Field help / possible entries' } },
];

export const FIORI_SEARCH_NOTE: L10n = {
  sk: 'Nezamieňaj príkazové pole SAP GUI s vyhľadávaním vo Fiori Launchpade: v novších verziách možno niektoré T-kódy/Fiori app IDs spustiť aj z vyhľadávania, ale iba ak sú sprístupnené a autorizované.',
  en: 'SAP GUI command field and Fiori Launchpad search are not identical. Supported transactions and app IDs can be launchable via Fiori search when authorized.',
};

/** "Verify in your system" (p. 3). */
export const VERIFY_STEPS: L10n[] = [
  { sk: 'V SE93 vyhľadaj definíciu a balík.', en: 'Look up the definition and package in SE93.' },
  {
    sk: 'V SE16N/SE16H vieš autorizovane prezrieť TSTC/TSTCT.',
    en: 'With authorization, browse TSTC/TSTCT in SE16N/SE16H.',
  },
  {
    sk: 'Skontroluj, či má používateľ S_TCODE, súvisiace procesné oprávnenia a Fiori role.',
    en: 'Check that the user has S_TCODE, the related process authorizations and Fiori roles.',
  },
  {
    sk: 'Potvrď vhodnosť pre konkrétny release v SAP Help, Simplification List a Fiori Apps Reference Library.',
    en: 'Confirm it suits your release in SAP Help, the Simplification List and the Fiori Apps Reference Library.',
  },
];

/** Five operating rules (p. 3). */
export const OPERATING_RULES: L10n[] = [
  {
    sk: 'Zisti systém, klienta, release a prostredie skôr než čokoľvek spustíš.',
    en: 'Identify product, client, release and landscape first.',
  },
  {
    sk: 'Začni diagnostikou a presným dokladom, nie náhodným preklikávaním.',
    en: 'Start with a document ID and observable evidence.',
  },
  {
    sk: 'Odliš problém dát, procesu, konfigurácie, kódu a oprávnenia.',
    en: 'Separate data, process, customizing, code and authorization issues.',
  },
  {
    sk: 'Pri dávkových opravách ošetri duplicity, rollback a idempotenciu.',
    en: 'For bulk recovery, consider duplicates, reversibility and idempotency.',
  },
  {
    sk: 'Po oprave urob technické aj biznis overenie s vlastníkom procesu.',
    en: 'Perform technical and business validation with the process owner.',
  },
];

/** Which world are you working in? (p. 3) */
export const LANDSCAPES: { id: 'ecc' | 's4' | 's4pc' | 'btp'; name: string; text: L10n }[] = [
  {
    id: 'ecc',
    name: 'SAP ERP ECC',
    text: {
      sk: 'Klasické SAP GUI transakcie sú bežné; historické moduly a dátové modely.',
      en: 'Classic GUI T-codes and traditional data models.',
    },
  },
  {
    id: 's4',
    name: 'S/4HANA on-prem / Private Cloud',
    text: {
      sk: 'Klasické kódy a Fiori môžu koexistovať. Dôležité zmeny: BP, ACDOCA, moderné API a migračné nástroje.',
      en: 'GUI and Fiori may coexist; check simplifications and released objects.',
    },
  },
  {
    id: 's4pc',
    name: 'S/4HANA Public Cloud',
    text: {
      sk: 'Fiori a roly/katalógy sú primárne. Niektoré SAP GUI for HTML appky alebo technické ID môžu existovať – nikdy nepredpokladaj ECC paritu.',
      en: 'Fiori-first, but some GUI-based apps/IDs exist; no ECC parity assumption.',
    },
  },
  {
    id: 'btp',
    name: 'SAP BTP ABAP Environment',
    text: {
      sk: 'Bez SAP GUI; vývoj cez Eclipse ADT, ABAP Cloud, released APIs, CDS a RAP. Táto príručka je tu najmä procesný kontext.',
      en: 'No SAP GUI; develop in Eclipse ADT using ABAP Cloud.',
    },
  },
];

/** Fast start: 48 essential codes, in the almanac's four groups (p. 4). */
export const FAST_START: { title: L10n; codes: string[] }[] = [
  {
    title: { sk: 'ABAP / Technické', en: 'ABAP / Technical' },
    codes: ['SE93', 'SE11', 'SE16N', 'SE38', 'SE80', 'ATC', 'ST05', 'SAT', 'ST22', 'SLG1', 'SM37', 'SM59'],
  },
  {
    title: { sk: 'Nákup, sklad, predaj', en: 'Purchasing, warehouse, sales' },
    codes: ['MM03', 'ME23N', 'ME2N', 'MIGO', 'MMBE', 'MB51', 'MIRO', 'VA03', 'VL03N', 'VF03', 'BP', '/SCWM/MON'],
  },
  {
    title: { sk: 'Basis, integrácie, security', en: 'Basis, integration, security' },
    codes: ['SM12', 'SM21', 'SM50', 'ST03N', 'STAD', 'SM58', 'SMQ1', 'SMQ2', 'WE02', 'BD87', 'SU53', 'PFCG'],
  },
  {
    title: { sk: 'Finance, migrácie, zmeny', en: 'Finance, migration, changes' },
    codes: ['FB03', 'FB60', 'FBL1N', 'FBL5N', 'FS00', 'OB52', 'SE09', 'STMS', 'SPDD', 'SPAU', 'LTMOM', 'CVI_COCKPIT'],
  },
];
export const FAST_START_CODES: ReadonlySet<string> = new Set(FAST_START.flatMap((g) => g.codes));

/** The first-response toolbox (p. 4): the whisper's fallback trail. */
export const TOOLBOX: { codes: string[]; why: L10n }[] = [
  { codes: ['ST22'], why: { sk: 'ABAP dump', en: 'ABAP dump' } },
  { codes: ['SM37'], why: { sk: 'Background job', en: 'Background job' } },
  { codes: ['SLG1'], why: { sk: 'Biznis / aplikačný log', en: 'Business / application log' } },
  { codes: ['WE02'], why: { sk: 'IDoc', en: 'IDoc' } },
  { codes: ['SU53'], why: { sk: 'Oprávnenie', en: 'Authorization' } },
  { codes: ['SMQ1', 'SMQ2'], why: { sk: 'Fronty qRFC', en: 'qRFC queues' } },
  { codes: ['ST05', 'SAT'], why: { sk: 'Výkon', en: 'Performance' } },
];

/** Useful fields, keys and tables (pp. 34–35). */
export const DATA_KEYS: { key: string; sk: string; en: string }[] = [
  { key: 'BUKRS', sk: 'Účtovný okruh', en: 'Company code' },
  { key: 'WERKS', sk: 'Závod', en: 'Plant' },
  { key: 'LGORT', sk: 'Skladové miesto', en: 'Storage location' },
  { key: 'MATNR', sk: 'Materiál', en: 'Material number' },
  { key: 'EBELN', sk: 'Nákupná objednávka', en: 'Purchasing document / PO' },
  { key: 'EBELP', sk: 'Položka nákupnej objednávky', en: 'Purchase order item' },
  { key: 'VBELN', sk: 'Predajný/dodávkový doklad v SD', en: 'SD document number' },
  { key: 'KUNNR', sk: 'Odberateľ (klasický identifikátor)', en: 'Customer number (classic)' },
  { key: 'LIFNR', sk: 'Dodávateľ (klasický identifikátor)', en: 'Vendor number (classic)' },
  { key: 'BELNR', sk: 'Číslo účtovného dokladu', en: 'Accounting document number' },
  { key: 'GJAHR', sk: 'Fiškálny rok', en: 'Fiscal year' },
  { key: 'BUDAT', sk: 'Dátum účtovania', en: 'Posting date' },
  { key: 'BWART', sk: 'Druh skladového pohybu', en: 'Movement type' },
  { key: 'AUFNR', sk: 'Číslo príkazu', en: 'Order number' },
  { key: 'KOSTL', sk: 'Nákladové stredisko', en: 'Cost center' },
  { key: 'CHARG', sk: 'Šarža', en: 'Batch' },
  { key: 'TSTC', sk: 'Tabuľka T-kódov', en: 'Transaction code table' },
  { key: 'TSTCT', sk: 'Tabuľka popisov T-kódov', en: 'Transaction text table' },
  { key: 'MARA/MARC', sk: 'Kmeňové údaje materiálu', en: 'Material master/general and plant data' },
  { key: 'EKKO/EKPO', sk: 'Hlavička a položky PO', en: 'PO header and items' },
  { key: 'VBAK/VBAP', sk: 'Hlavička a položky SD objednávky', en: 'Sales order header and items' },
  { key: 'BKPF/BSEG', sk: 'FI hlavička a pohľad položiek', en: 'FI document header and entry-view items' },
  { key: 'ACDOCA', sk: 'Univerzálny denník v S/4HANA', en: 'S/4HANA Universal Journal line items' },
  { key: 'MATDOC', sk: 'Dôležitý základ dát pohybov zásob v S/4HANA', en: 'Core inventory-document data in S/4HANA' },
];

export const DATA_KEYS_NOTE: L10n = {
  sk: 'Pri incidentoch a migráciách maj najprv identifikátory. Tabuľky uvedené nižšie sú orientačné dátové koncepty; v S/4HANA sa model a kompatibilita mení a pre integrácie preferuj released CDS views a API.',
  en: 'Use business identifiers first. These table names are conceptual references; S/4HANA data models differ, so prefer released CDS views and APIs for integration.',
};

/** Movement types are not transaction codes (p. 35). */
export const MOVEMENT_TYPES: { bwart: string; sk: string; en: string }[] = [
  { bwart: '101', sk: 'Príjem materiálu k nákupnej objednávke', en: 'Goods receipt for purchase order' },
  { bwart: '102', sk: 'Storno pohybu 101', en: 'Reversal of 101' },
  { bwart: '201', sk: 'Výdaj materiálu na nákladové stredisko', en: 'Goods issue to cost center' },
  { bwart: '261', sk: 'Výdaj materiálu na príkaz', en: 'Goods issue for an order' },
  { bwart: '311', sk: 'Prevod medzi skladovými miestami v závode', en: 'Transfer between storage locations' },
  { bwart: '601', sk: 'Výdaj k výstupnej dodávke', en: 'Goods issue for outbound delivery' },
  { bwart: '602', sk: 'Storno výdaja 601', en: 'Reversal of 601' },
];

export const MOVEMENT_TYPES_INTRO: L10n = {
  sk: 'BWART (movement type) určuje obchodný význam materiálového pohybu; MIGO/VL02N sú nástroje, ktorými sa pohyby môžu vytvárať. Nižšie uvedené príklady sú časté, ale ich spracovanie závisí od konfigurácie.',
  en: 'BWART determines movement semantics, whereas MIGO and delivery processing are transaction entry points. Always check customizing.',
};

export const MOVEMENT_TYPES_NOTE: L10n = {
  sk: 'Typy 101, 102, 201, 261, 311, 601 a 602 nie sú univerzálne povolené pre každý proces. Pri storne vždy posúď následné doklady a účtovný dopad.',
  en: 'These movement types are common examples, not blanket permission for a process. Reversal requires checking follow-on documents and financial consequences.',
};

export const DOCUMENT_FLOW: L10n = {
  sk: 'Pozri doklad, jeho referenciu, typ, stav, organizačné údaje a následný doklad. Napr. PO (EBELN) ↔ materiálový doklad (MIGO/MB51) ↔ logistická faktúra (MIRO) ↔ FI doklad (FB03). Nedávaj dokopy identifikátory z rôznych klientov alebo časových rezov.',
  en: 'Trace the original document, reference, type, state, organization and follow-on record. For example PO → material document → logistics invoice → FI posting. Do not combine IDs across clients or cut-off windows.',
};

/** What changes in S/4HANA (p. 36). */
export const S4_CHANGES: { topic: string; text: L10n; codes: string[] }[] = [
  {
    topic: 'Business Partner',
    text: {
      sk: 'ECC master-data transakcie XD01/XK01/FD01/FK01 → primárne BP v S/4HANA. Niektoré staré kódy sú nedostupné alebo nevhodné; záleží na konkrétnom release.',
      en: 'Use BP as the strategic entry point for customer/supplier master data.',
    },
    codes: ['XD01', 'XK01', 'FD01', 'FK01', 'BP'],
  },
  {
    topic: 'Inventory movement',
    text: {
      sk: 'MB01/MB1A/MB1B/MB1C sú legacy; MIGO a Fiori sú preferované moderné vstupy.',
      en: 'Use MIGO/Fiori instead of legacy MB* transactions.',
    },
    codes: ['MB01', 'MB1A', 'MB1B', 'MB1C', 'MIGO'],
  },
  {
    topic: 'Migration',
    text: {
      sk: 'LTMC je deprecated. Používaj Migrate Your Data – Migration Cockpit, Fiori app ID F3473, a podľa potreby LTMOM.',
      en: 'LTMC is deprecated; use the Fiori migration cockpit (app F3473) and LTMOM where needed.',
    },
    codes: ['LTMC', 'LTMOM'],
  },
  {
    topic: 'LSMW',
    text: {
      sk: 'LSMW poznaj kvôli ECC a historickým projektom. Na nové migrácie do S/4HANA ho SAP neodporúča.',
      en: 'LSMW is not the recommended S/4HANA migration approach.',
    },
    codes: ['LSMW'],
  },
  {
    topic: 'Data model',
    text: {
      sk: 'ACDOCA zjednocuje veľkú časť FI/CO údajov. Pri sklade je dôležité MATDOC; priamy prístup do starých tabuliek môže viesť k chybným predpokladom.',
      en: 'Prefer released CDS/API contracts over hard-coded legacy table assumptions.',
    },
    codes: [],
  },
  {
    topic: 'ABAP Cloud',
    text: {
      sk: 'SAP BTP ABAP Environment nepodporuje SAP GUI. Vývoj v ADT (Eclipse); relevantné sú RAP, CDS a released API.',
      en: 'ADT replaces the classic SAP GUI development entry points.',
    },
    codes: [],
  },
];

/** Pre-project checklist (p. 36). */
export const PRE_PROJECT_CHECKLIST: L10n[] = [
  {
    sk: 'Presne definovať zdrojové a cieľové systémy, release, moduly a zákaznícke rozšírenia.',
    en: 'Define source and target systems, release, modules and custom extensions precisely.',
  },
  {
    sk: 'Rozlíšiť greenfield, brownfield system conversion a selective data transition.',
    en: 'Distinguish greenfield, brownfield system conversion and selective data transition.',
  },
  {
    sk: 'Určiť master-data ownership, kritické business procesy, interface inventory a cutover okno.',
    en: 'Settle master-data ownership, critical business processes, interface inventory and the cutover window.',
  },
  {
    sk: 'Zmapovať historické T-kódy na budúci Fiori/API proces a zabezpečiť autorizačný koncept.',
    en: 'Map historical T-codes to the future Fiori/API process and secure the authorization concept.',
  },
  {
    sk: 'Odmerať completeness, correctness, reconciliation a následný procesný testing.',
    en: 'Measure completeness, correctness, reconciliation and the follow-up process testing.',
  },
];

/** Sources (p. 40). */
export const SOURCES: { id: string; title: string }[] = [
  { id: 'S01', title: 'SAP Help – ABAP Transaction Codes' },
  { id: 'S02', title: 'SAP Help – Transaction start and authorization S_TCODE' },
  { id: 'S03', title: 'SAP Help – Getting started in SAP BTP ABAP Environment' },
  { id: 'S04', title: 'SAP Help – ABAP Cloud model and ADT' },
  { id: 'S05', title: 'SAP Help – LTMC deprecated (S/4HANA)' },
  { id: 'S06', title: 'SAP Help – Migrate Your Data, Fiori app F3473' },
  { id: 'S07', title: 'SAP Help – LTMOM Migration Object Modeler' },
  { id: 'S08', title: 'SAP Help – BP and customer/vendor master restrictions' },
  { id: 'S09', title: 'SAP Help – Classic SD / MM document transactions' },
  { id: 'S10', title: 'SAP Help – IDoc / RFC / qRFC transaction codes' },
  { id: 'S11', title: 'SAP Help – EWM transactions' },
  { id: 'S12', title: 'SAP Help – ABAP performance monitors' },
  { id: 'S13', title: 'SAP Help – SPDD / SPAU during upgrade' },
  { id: 'S14', title: 'SAP Help – Fiori Launchpad search / transaction navigation' },
  { id: 'S15', title: 'SAP Help – SAP S/4HANA migration process' },
  { id: 'S16', title: 'SAP Help – TSTC, transaction and table authorization' },
  { id: 'S17', title: 'SAP Help – SAP S/4HANA Simplification List (LSMW, MB1A)' },
  { id: 'S18', title: 'SAP Help – User and role management (SU01, PFCG)' },
  { id: 'S19', title: 'SAP Help – CVI Cockpit' },
  { id: 'S20', title: 'SAP Help – Business process and SD purchase transactions' },
];

export const SCOPE_NOTE: L10n = {
  sk: 'Vysvetlivky sú stručné a zámerne neobsahujú krokové návody na zásahy do produkcie. Každý kód musíš overiť podľa systému, role, edície, komponentu a schváleného change procesu. „O“ označuje voliteľnú závislosť; mnohé iné transakcie môžu byť tiež nedostupné. Dátové modely a dostupnosť appiek sa priebežne menia.',
  en: 'Descriptions are intentionally concise and are not production-change procedures. Always check edition, product component, authorization and governance. Optional labels are indicative; other codes may also be unavailable in your deployment.',
};

export const PLAYBOOK_INTRO: L10n = {
  sk: 'Nasledujúce sekvencie sú typické štartovacie body, nie povinný ani univerzálny technický runbook. Každý incident potrebuje vlastníka procesu, systémový kontext a kontrolu následkov.',
  en: 'These flows are entry points, not universal operational runbooks. Validate ownership, system and side effects before action.',
};
