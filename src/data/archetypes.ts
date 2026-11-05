import type { AreaId, L10n, Step, Symptom } from '../types.ts';

/** A group of synonyms. Only the best-matching term of a signal counts. */
export interface Signal {
  terms: string[];
  w: number;
}

/** An error-message signature, tested against the folded query text. */
export interface Pattern {
  re: RegExp;
  w: number;
  label: L10n;
}

/** A recognisable problem type with an ordered trail of codes to check. */
export interface Archetype {
  id: string;
  areas: AreaId[];
  symptoms: Symptom[];
  /** "almanac" = one of the 10 playbooks of the almanac; "curated" = written for this app. */
  source: 'almanac' | 'curated';
  /** Playbook number in the almanac (pp. 31–33). */
  playbook?: number;
  title: L10n;
  summary: L10n;
  signals: Signal[];
  patterns?: Pattern[];
  steps: Step[];
  caution?: L10n;
  /** Put the S/4HANA replacement of every legacy code in the query at the start of the trail. */
  replacementTrail?: boolean;
}

const sig = (w: number, ...terms: string[]): Signal => ({ terms, w });
const pat = (re: RegExp, w: number, sk: string, en: string): Pattern => ({ re, w, label: { sk, en } });
const step = (codes: string | string[], sk: string, en: string): Step => ({
  codes: typeof codes === 'string' ? [codes] : codes,
  why: { sk, en },
});
const l = (sk: string, en: string): L10n => ({ sk, en });

const NOT_ON_PRD = l(
  'Monitor ≠ oprávnenie na zásah. Opravné kroky (reprocessing, uvoľnenie, zmena) iba so schválením a po pochopení príčiny.',
  'Monitoring is not permission to intervene. Corrective steps (reprocessing, releasing, changing) only with approval and once the root cause is understood.',
);

// ════════════════════════════════════════════════════════════════════
// The 10 almanac playbooks (pp. 31–33). Trails and summaries follow the
// almanac; the per-step "why" lines condense its text.
// ════════════════════════════════════════════════════════════════════
const ALMANAC: Archetype[] = [
  {
    id: 'idoc-failed',
    playbook: 1,
    source: 'almanac',
    areas: ['06'],
    symptoms: ['error', 'stuck'],
    title: l('IDoc ostal v chybe', 'Failed IDoc'),
    summary: l(
      'Zachyť IDoc ID, message type, sender/receiver a čas. Vo WE02/WE05 over posledný status a aplikačný error. WE20/WE21 kontroluj až pri konfigurácii partnera/portu; pri qRFC sleduj SMQ1/SMQ2 a RFC spojenie SM59. BD87 spúšťaj len po odstránení príčiny a kontrole idempotencie.',
      'Identify IDoc number, type, sender/receiver and time. Inspect status in WE02/WE05; examine WE20/WE21, SMQ1/SMQ2 and SM59 as relevant. Reprocess with BD87 only after fixing the root cause and checking idempotency.',
    ),
    signals: [
      sig(3, 'idoc', 'idocs', 'ale'),
      sig(1.5, 'chyba', 'chybny', 'error', 'failed', 'zlyhal', 'zlyhany', 'red', 'cerveny', 'status', 'stav'),
      sig(0.7, 'inbound', 'outbound', 'prichadzajuci', 'odchadzajuci', 'posting', 'zauctovanie'),
      sig(0.5, 'message type', 'mestyp', 'partner', 'segment'),
    ],
    patterns: [pat(/\bstatus\s*:?\s*(51|56|26|29|02|65|69)\b/, 3, 'IDoc status', 'IDoc status')],
    steps: [
      step('WE02', 'Posledný status a aplikačná chyba', 'Latest status and the application error'),
      step('SLG1', 'Aplikačný log spracovania', 'Application log of the posting'),
      step(['SMQ1', 'SMQ2'], 'Fronty, ak IDoc ide cez qRFC', 'Queues, if the IDoc travels via qRFC'),
      step('SM59', 'RFC spojenie k partnerovi', 'RFC connection to the partner'),
      step('BD87', 'Reprocessing iba so schválením', 'Reprocess only with approval'),
    ],
    caution: l(
      'BD87 spúšťaj len po odstránení príčiny a kontrole idempotencie; reprocessing môže duplikovať operáciu.',
      'Run BD87 only after fixing the root cause and checking idempotency; reprocessing can duplicate a business operation.',
    ),
  },
  {
    id: 'short-dump',
    playbook: 2,
    source: 'almanac',
    areas: ['02', '03'],
    symptoms: ['error'],
    title: l('ABAP program padá', 'ABAP short dump'),
    summary: l(
      'Začni ST22: exception, runtime, používateľ, program, systém a čas. Pridaj SLG1 (biznis kontext), SM37 ak job bežal na pozadí; pri výkonových incidentoch použi SAT, ST05 alebo ST12. Pred opravou reprodukuj bezpečne v neprodukčnom systéme.',
      'Start with ST22: exception, program, user, system and timestamp. Correlate with SLG1 and SM37; for performance use SAT, ST05 or ST12. Reproduce safely before changing code.',
    ),
    signals: [
      sig(3, 'dump', 'dumps', 'dumpy', 'dumpu', 'short dump', 'kratky dump', 'runtime error', 'pada', 'padol', 'spadol', 'crash', 'crashes', 'crashed', 'abort', 'aborted'),
      sig(0.8, 'abap', 'program', 'exception', 'vynimka'),
    ],
    patterns: [
      pat(
        /time_out|message_type_x|dbsql_\w+|dbif_\w+|convt_\w+|tsv_tnew\w+|getwa_not_assigned|itab_duplicate_key|uncaught_exception|raise_exception|cx_sy_\w+|syntax_error|call_function_not_found|object_not_found|dynpro_send_in_background|compute_\w+|string_offset\w*|assign_\w+|rabax/,
        3,
        'Signatúra dumpu',
        'Dump signature',
      ),
    ],
    steps: [
      step('ST22', 'Exception, program, používateľ, čas', 'Exception, program, user and time'),
      step('SLG1', 'Biznis kontext v aplikačnom logu', 'Business context in the application log'),
      step('SM37', 'Ak bežal background job', 'If a background job was running'),
      step(['SAT', 'ST05'], 'Pri výkonových incidentoch (alebo ST12)', 'For performance incidents (or ST12)'),
    ],
    caution: l(
      'Pred opravou reprodukuj problém bezpečne v neprodukčnom systéme.',
      'Reproduce the problem safely in a non-production system before changing code.',
    ),
  },
  {
    id: 'auth-missing',
    playbook: 3,
    source: 'almanac',
    areas: ['04'],
    symptoms: ['access'],
    title: l('Používateľ nemá prístup', 'Missing authorization'),
    summary: l(
      'Presne zisti rolu, klienta a okamih zlyhania. SU53 poskytne prvú indíciu, STAUTHTRACE presnejší záznam, PFCG/SUIM kontext rolí a SU24 návrhy. Nikdy nevyrieš incident plošným SAP_ALL.',
      'Capture failed activity, client and time. SU53 gives a hint; STAUTHTRACE provides deeper evidence; PFCG/SUIM and SU24 explain role design. Avoid broad SAP_ALL grants.',
    ),
    signals: [
      sig(3, 'opravnenie', 'opravnenia', 'opravneni', 'autorizacia', 'autorizacie', 'authorization', 'authorisation', 'authority', 'permission', 'permissions', 'unauthorized', 'pristup', 'access', 'prava', 'rights', 'no access'),
      sig(1, 'rola', 'role', 'roles', 'roly', 's_tcode', 'sap_all', 'su53'),
      sig(0.5, 'pouzivatel', 'pouzivatela', 'user', 'users'),
    ],
    patterns: [
      pat(
        /no authori[sz]ation|not authori[sz]ed|nemate opravneni|nema opravneni|chyba opravneni|authority.check|s_tcode|you are not allowed/,
        2,
        'Hláška o oprávnení',
        'Authorization message',
      ),
    ],
    steps: [
      step('SU53', 'Prvá indícia: posledná neúspešná kontrola', 'First hint: the last failed check'),
      step('STAUTHTRACE', 'Presný záznam všetkých kontrol', 'Precise trace of all checks'),
      step(['SUIM', 'PFCG'], 'Kontext rolí a profilov', 'Role and profile context'),
      step('SU24', 'Návrhové hodnoty pre transakciu', 'Proposal values for the transaction'),
    ],
    caution: l('Nikdy nevyrieš incident plošným SAP_ALL.', 'Never resolve the incident with a broad SAP_ALL grant.'),
  },
  {
    id: 'invoice-blocked',
    playbook: 4,
    source: 'almanac',
    areas: ['07', '08'],
    symptoms: ['blocked'],
    title: l('Nákup: faktúra neprešla', 'Blocked purchasing invoice'),
    summary: l(
      'V ME23N over PO, množstvá a ceny. MIGO/MB51 skontrolujú skutočný goods receipt. MIR4/MIRO a MRBR odhalia faktúru, rozdiely alebo blokovanie. Otázka nie je iba „ako ju odblokovať“, ale čo by to urobilo s trojstranným párovaním.',
      'Inspect purchase order in ME23N and goods receipt in MIGO/MB51. Use MIR4/MIRO and MRBR to examine invoice and blocked status. Focus on the three-way match and business impact.',
    ),
    signals: [
      sig(3, 'faktura', 'faktury', 'fakturu', 'invoice', 'invoices', 'logisticka faktura', 'logistics invoice', 'miro', 'supplier invoice', 'dodavatelska faktura'),
      sig(2, 'blokovana', 'blokovane', 'blocked', 'block', 'blokacia', 'blok', 'nepresla', 'held', 'payment block', 'platobny blok'),
      sig(1, 'rozdiel', 'difference', 'variance', 'tolerance', 'tolerancia', 'three-way', 'trojstranne', 'parovanie', 'match'),
      sig(0.7, 'cena', 'price', 'mnozstvo', 'quantity', 'nakup', 'purchasing'),
    ],
    steps: [
      step('ME23N', 'PO: množstvá, ceny, história', 'PO: quantities, prices, history'),
      step(['MIGO', 'MB51'], 'Skutočný príjem tovaru', 'The actual goods receipt'),
      step('MIR4', 'Faktúra a jej rozdiely (alebo MIRO)', 'The invoice and its variances (or MIRO)'),
      step('MRBR', 'Blokované faktúry a dôvod bloku', 'Blocked invoices and the block reason'),
    ],
    caution: l(
      'Neodblokuj bez posúdenia, čo to urobí s trojstranným párovaním (PO – príjem – faktúra).',
      'Do not release before judging what it does to the three-way match (PO – receipt – invoice).',
    ),
  },
  {
    id: 'order-shipping-blocked',
    playbook: 5,
    source: 'almanac',
    areas: ['09', '14'],
    symptoms: ['blocked'],
    title: l('Objednávka nejde expedovať', 'Sales order blocked for shipping'),
    summary: l(
      'VA03 ukáže stav zákazníckej objednávky. VL03N/VL06O pomôžu zistiť stav dodávky a picking, MMBE stav zásob, /SCWM/MON EWM úlohy. Následne rieš ATP, blokáciu, kreditný limit alebo integráciu.',
      'Check sales order status in VA03, delivery and picking in VL03N/VL06O, stock in MMBE, and EWM tasks in /SCWM/MON if active. Then examine ATP, block, credit or integration causes.',
    ),
    signals: [
      sig(3, 'expedovat', 'expedicia', 'expedovana', 'expedovane', 'shipping', 'ship', 'shipped', 'shipment', 'picking', 'vychystavanie', 'delivery block', 'blok dodavky'),
      sig(1.5, 'objednavka', 'objednavku', 'objednavky', 'sales order', 'odberatelska objednavka', 'order', 'orders', 'zakaznicka objednavka'),
      sig(1.2, 'dodavka', 'dodavku', 'delivery', 'deliver', 'dodat'),
      sig(1, 'credit', 'kredit', 'kreditny', 'atp', 'dostupnost', 'availability', 'blocked', 'blokovana'),
    ],
    steps: [
      step('VA03', 'Stav objednávky, bloky, tok dokladov', 'Order status, blocks, document flow'),
      step(['VL03N', 'VL06O'], 'Stav dodávky a picking', 'Delivery status and picking'),
      step('MMBE', 'Stav zásob', 'Stock situation'),
      step('/SCWM/MON', 'EWM úlohy, ak je EWM aktívne', 'EWM tasks, if EWM is active'),
    ],
    caution: l(
      'Následne rieš ATP, blokáciu, kreditný limit alebo integráciu – nie len samotný doklad.',
      'Then examine ATP, blocks, credit or integration causes, not just the document itself.',
    ),
  },
  {
    id: 'migration-reconciliation',
    playbook: 6,
    source: 'almanac',
    areas: ['18'],
    symptoms: ['data'],
    title: l('Dáta po migrácii nesedia', 'Post-migration reconciliation'),
    summary: l(
      'Stanov rozsah dát, business keys, časový rez a pravidlá mapovania. Pri S/4 migračnom kokpite kontroluj Fiori Migrate Your Data (F3473), prípadne LTMOM. Reconciliuj počty, súčty, statusy, referencie a hraničné prípady; oddel technickú a biznis akceptáciu.',
      'Define population, business keys, cut-off and mapping rules. Inspect Fiori Migrate Your Data (F3473), plus LTMOM where relevant. Reconcile counts, totals, statuses, references and exceptions; separate technical from business sign-off.',
    ),
    signals: [
      sig(3, 'migracia', 'migracii', 'migracie', 'migration', 'migrated', 'migrovane', 'migrovat', 'data load', 'nahravanie'),
      sig(2, 'nesedi', 'nesedia', 'mismatch', 'reconciliation', 'rekonciliacia', 'reconcile', 'rozdiel', 'rozdiely', 'differ', 'difference', 'nespravne', 'wrong', 'missing records'),
      sig(1, 'cutover', 'mock', 'mapping', 'mapovanie', 'cockpit', 'kokpit'),
      sig(0.5, 'data', 'udaje', 'dat'),
    ],
    steps: [
      { fiori: 'F3473', label: l('Migrate Your Data (Fiori F3473)', 'Migrate Your Data (Fiori F3473)'), why: l('Stav migračných objektov a správy', 'Status and messages of migration objects') },
      step('LTMOM', 'Mapovanie a pravidlá objektov', 'Object mapping and rules'),
      step(['FBL3N', 'MB52', 'VA05'], 'Procesné kontroly FI/MM/SD (príklady)', 'Process checks in FI/MM/SD (examples)'),
    ],
    caution: l(
      'Reconciliuj počty, súčty, statusy, referencie a hraničné prípady; oddel technickú a biznis akceptáciu.',
      'Reconcile counts, totals, statuses, references and exceptions; separate technical from business sign-off.',
    ),
  },
  {
    id: 'transport-import-failed',
    playbook: 7,
    source: 'almanac',
    areas: ['05'],
    symptoms: ['error'],
    title: l('Import transportu zlyhal', 'Failed transport import'),
    summary: l(
      'V STMS zisti presnú fázu a návratový kód. ST22/SM21/SLOG pomáhajú s technickým kontextom; SE09/SE10 s obsahom requestu. Over závislosti, klient, importné poradie a potrebu SPDD/SPAU počas upgrade.',
      'Inspect transport phase and return code in STMS. Correlate ST22/SM21, and request content in SE09/SE10. Check dependencies, target client, import order and upgrade adjustments.',
    ),
    signals: [
      sig(3, 'transport', 'transporty', 'transportu', 'transport request', 'tms', 'stms'),
      sig(2, 'import', 'importu', 'importovat'),
      sig(1.2, 'failed', 'zlyhal', 'chyba', 'error', 'return code', 'navratovy kod', 'rc'),
    ],
    patterns: [pat(/\b(rc|return code|navratovy kod)\s*[=:]?\s*(4|8|12|16)\b/, 2, 'Návratový kód', 'Return code')],
    steps: [
      step('STMS', 'Fáza importu a návratový kód', 'Import phase and return code'),
      step(['SE09', 'SE10'], 'Obsah requestu', 'Content of the request'),
      step(['ST22', 'SM21'], 'Technický kontext (dump, systémový log)', 'Technical context (dump, system log)'),
      step(['SPDD', 'SPAU'], 'Iba počas upgrade: úpravy', 'During upgrades only: adjustments'),
    ],
    caution: l(
      'Over závislosti, cieľový klient a poradie importu; rieš s vlastníkmi zmien.',
      'Check dependencies, target client and import order; resolve with the change owners.',
    ),
  },
  {
    id: 'production-shortage',
    playbook: 8,
    source: 'almanac',
    areas: ['12'],
    symptoms: ['missing'],
    title: l('Výroba nemá materiál', 'Production shortage'),
    summary: l(
      'Začni MD04 pre dostupnosť a časovanie, CS03 pre BOM, MM03 pre materiál a MMBE pre zásoby. CO03 zistí stav výrobného príkazu; CO11N potvrdenia. Rozlišuj nesprávne master data, fyzický nedostatok a chybu MRP.',
      'Start with MD04 for timing and requirements, CS03 for BOM, MM03 and MMBE for master and stock data. Check CO03 and CO11N for production execution. Separate data errors, genuine shortages and MRP issues.',
    ),
    signals: [
      sig(2.5, 'vyroba', 'vyrobe', 'vyrobny', 'vyrobna', 'production', 'production order', 'vyrobny prikaz', 'manufacturing', 'shop floor'),
      sig(2.5, 'shortage', 'nedostatok', 'chyba', 'chybaju', 'missing', 'unavailable', 'missing parts', 'chybajuce diely'),
      sig(1, 'material', 'materialu', 'component', 'komponent', 'komponenty', 'diel', 'diely'),
    ],
    steps: [
      step('MD04', 'Potreby, dostupnosť a časovanie', 'Requirements, availability and timing'),
      step('CS03', 'Kusovník (BOM)', 'Bill of material'),
      step('MMBE', 'Zásoby komponentov (a MM03 pre kmeň)', 'Component stock (and MM03 for master data)'),
      step('CO03', 'Stav výrobného príkazu', 'Production order status'),
      step('CO11N', 'Potvrdenia', 'Confirmations'),
    ],
    caution: l(
      'Rozlišuj nesprávne master data, fyzický nedostatok a chybu MRP.',
      'Separate master-data errors, genuine shortages and MRP issues.',
    ),
  },
  {
    id: 'slow-performance',
    playbook: 9,
    source: 'almanac',
    areas: ['02', '03'],
    symptoms: ['slow'],
    title: l('Pomalé spracovanie', 'Slow transaction or batch job'),
    summary: l(
      'Najskôr urob časový profil incidentu a rozsah dopadu. ST03N/STAD pre štatistiku; ST05 pre SQL, SAT pre ABAP a ST12 pre kombinovanú analýzu, ak je k dispozícii. Nepovažuj každú pomalosť za DB problém: môže ísť o lock, RFC, job contention alebo sieť.',
      'Profile duration and blast radius first. Use ST03N/STAD for workload, ST05 for SQL, SAT for ABAP, ST12 for combined trace. Also check locks, RFC, background-job contention and networks.',
    ),
    signals: [
      sig(3, 'slow', 'slowly', 'slower', 'pomaly', 'pomala', 'pomale', 'pomalost', 'pomalsie', 'performance', 'vykon', 'takes long', 'trva dlho', 'dlho', 'long running', 'response time', 'odozva', 'hangs', 'visi', 'zamrzne'),
      sig(0.8, 'job', 'jobs', 'transaction', 'transakcia', 'report', 'select', 'query'),
    ],
    steps: [
      step('ST03N', 'Workload: kedy a koho sa to týka', 'Workload: when and whom it affects'),
      step('STAD', 'Štatistika konkrétnej požiadavky', 'Statistics of the individual request'),
      step(['ST05', 'SAT', 'ST12'], 'SQL, ABAP alebo kombinovaný trace', 'SQL, ABAP or combined trace'),
      step(['SM12', 'SM50'], 'Zámky a pracovné procesy', 'Locks and work processes'),
    ],
    caution: l(
      'Nepovažuj každú pomalosť za DB problém: môže ísť o lock, RFC, job contention alebo sieť.',
      'Not every slowdown is a database problem: it may be locks, RFC, job contention or the network.',
    ),
  },
  {
    id: 'erp-ewm-mismatch',
    playbook: 10,
    source: 'almanac',
    areas: ['14', '08'],
    symptoms: ['data'],
    title: l('Rozdiel stavu zásob ERP a EWM', 'ERP vs EWM stock mismatch'),
    summary: l(
      'V MMBE/MB52 a /SCWM/MON porovnaj systém, závod, sklad, jednotku a stock type. Skontroluj fronty SMQ1/SMQ2, EWM delivery /SCWM/PRDI alebo /SCWM/PRDO a /SCWM/ERP_STOCKCHECK podľa povolení. Vyvaruj sa ručného „dorovnania“ bez root cause.',
      'Compare ERP and EWM quantities at aligned plant, storage location, stock type and unit. Inspect qRFC queues, EWM deliveries and stock-check tools as authorized. Avoid manual adjustments without root cause.',
    ),
    signals: [
      sig(3, 'ewm', 'scwm', 'extended warehouse'),
      sig(2, 'differ', 'differs', 'difference', 'rozdiel', 'rozdiely', 'mismatch', 'nesedi', 'nesedia', 'inconsistent', 'nekonzistentne', 'nezhoduju'),
      sig(1.5, 'erp'),
      sig(1.5, 'stock', 'zasoba', 'zasoby', 'stav', 'quantity', 'mnozstvo'),
    ],
    steps: [
      step(['MMBE', 'MB52'], 'Stav zásob v ERP', 'Stock in ERP'),
      step('/SCWM/MON', 'Stav zásob a úloh v EWM', 'Stock and tasks in EWM'),
      step(['SMQ1', 'SMQ2'], 'Fronty medzi ERP a EWM', 'Queues between ERP and EWM'),
      step('/SCWM/ERP_STOCKCHECK', 'Porovnanie ERP a EWM (podľa povolení)', 'ERP vs EWM comparison (as authorized)'),
    ],
    caution: l('Vyvaruj sa ručného „dorovnania“ bez root cause.', 'Avoid manual adjustments without a root cause.'),
  },
];

// ════════════════════════════════════════════════════════════════════
// Curated archetypes, written for this app. Conservative by design:
// they point to where to look, never to production interventions.
// ════════════════════════════════════════════════════════════════════
const CURATED: Archetype[] = [
  // ── ABAP / technical ────────────────────────────────────────────
  {
    id: 'job-failed',
    source: 'curated',
    areas: ['03'],
    symptoms: ['error'],
    title: l('Background job zlyhal', 'Failed background job'),
    summary: l(
      'Job skončil v stave Canceled alebo nedobehol. Log jobu ukáže prvú chybu; dump a aplikačný log často povedia prečo.',
      'A job ended as Canceled or never finished. The job log shows the first error; the dump and application log often say why.',
    ),
    signals: [
      sig(3, 'job', 'jobs', 'joby', 'background job', 'batch job', 'davka', 'davkovy', 'pozadie'),
      sig(2, 'failed', 'cancelled', 'canceled', 'zruseny', 'zlyhal', 'aborted', 'padol', 'chyba', 'error', 'nedobehol', 'didnt run', 'nespustil'),
    ],
    patterns: [pat(/job .*(cancel|abort|fail)|job .*(zrusen|zlyhal|padol)/, 1.5, 'Stav jobu', 'Job status')],
    steps: [
      step('SM37', 'Stav a log jobu', 'Job status and log'),
      step('ST22', 'Dump v čase behu jobu', 'Dump at the time of the job'),
      step('SLG1', 'Aplikačný log programu', 'Application log of the program'),
      step('SM21', 'Systémový log okolo času zlyhania', 'System log around the failure'),
    ],
    caution: l('Job opätovne naplánuj (SM36) až po pochopení príčiny a dopadu dvojitého behu.', 'Reschedule (SM36) only after understanding the cause and the impact of a double run.'),
  },
  {
    id: 'lock-entries',
    source: 'curated',
    areas: ['03'],
    symptoms: ['blocked'],
    title: l('Záznam je zamknutý (enqueue)', 'Lock entries (record locked)'),
    summary: l(
      'Hláška „locked by user …“ znamená SAP enqueue zámok. Zisti, kto ho drží a či jeho session alebo proces ešte beží.',
      '"Locked by user …" means an SAP enqueue lock. Find who holds it and whether their session or process is still running.',
    ),
    signals: [
      sig(3, 'lock', 'locks', 'locked', 'zamok', 'zamky', 'zamknuty', 'zamknute', 'zamknuta', 'enqueue', 'uzamknuty'),
      sig(0.8, 'record', 'zaznam', 'document', 'doklad', 'editing', 'spracovava'),
    ],
    patterns: [
      pat(
        /locked by|zamknut\w* (pouzivatel|uzivatel)|blokovan\w* (pouzivatel|uzivatel)|is (currently )?being processed by|prave spracovava|enqueue/,
        3,
        'Hláška o zámku',
        'Lock message',
      ),
    ],
    steps: [
      step('SM12', 'Kto drží zámok a od kedy', 'Who holds the lock and since when'),
      step(['SM04', 'AL08'], 'Je vlastník ešte prihlásený?', 'Is the owner still logged on?'),
      step('SM50', 'Beží ešte proces, ktorý zámok drží?', 'Is the process holding it still running?'),
      step('SM13', 'Čaká update, ktorý zámok uvoľní?', 'Is an update pending that will release it?'),
    ],
    caution: l(
      'Mazanie zámkov v SM12 môže poškodiť dáta; iba podľa schváleného postupu a po overení, že proces nebeží.',
      'Deleting locks in SM12 can corrupt data; only per an approved procedure and after confirming the process is gone.',
    ),
  },
  {
    id: 'update-termination',
    source: 'curated',
    areas: ['03'],
    symptoms: ['error'],
    title: l('Update termination', 'Update termination'),
    summary: l(
      'Doklad sa „uložil“, ale potom prišiel express dokument o zrušenom update. Údaje sa nemuseli zapísať.',
      'The document seemed saved, then an express document reported a terminated update. The data may not have been written.',
    ),
    signals: [
      sig(3, 'update termination', 'update terminated', 'update task', 'express document', 'expresny dokument', 'vb'),
      sig(1.5, 'update', 'terminated', 'termination', 'zruseny'),
    ],
    patterns: [pat(/update (was )?terminated|express (document|message)|vbmod|vbhdr|vberror/, 3, 'Update hláška', 'Update message')],
    steps: [
      step('SM13', 'Neúspešné update záznamy', 'Failed update records'),
      step('ST22', 'Dump v update procese', 'Dump in the update task'),
      step('SM21', 'Systémový log', 'System log'),
      step('SLG1', 'Aplikačný log', 'Application log'),
    ],
    caution: l('Opakovanie update záznamov v SM13 iba so schválením; hrozí duplicitný zápis.', 'Repeating update records in SM13 only with approval; it may write twice.'),
  },
  {
    id: 'find-table',
    source: 'curated',
    areas: ['01', '02'],
    symptoms: ['data'],
    title: l('Aká tabuľka/program je za obrazovkou?', 'Which table or program is behind this?'),
    summary: l(
      'Chceš vedieť, kde sú dáta uložené alebo aký program transakcia spúšťa. F1 → technické info je prvý krok; potom DDIC a SQL trace.',
      'You want to know where data is stored or which program a transaction runs. F1 → technical info first, then the Dictionary and an SQL trace.',
    ),
    signals: [
      sig(3, 'table', 'tables', 'tabulka', 'tabulky', 'tabulku', 'which table', 'ktora tabulka', 'technical name', 'technicky nazov', 'stored', 'ulozene'),
      sig(1.5, 'field', 'pole', 'program', 'behind', 'screen', 'obrazovka', 'dynpro', 'f1'),
    ],
    patterns: [pat(/which (table|program)|ktor\w* (tabul|program)|where (is|are) .* stored|kde (je|su) .* ulozen/, 3, 'Otázka na objekt', 'Object question')],
    steps: [
      step('SE93', 'Transakcia → program', 'Transaction → program'),
      step('SE11', 'Definícia tabuľky a polí', 'Table and field definitions'),
      step(['SE16N', 'SE16H'], 'Prezri dáta (s oprávnením)', 'Browse the data (when authorized)'),
      step('ST05', 'SQL trace: aké tabuľky sa čítajú', 'SQL trace: which tables are read'),
      step('SE84', 'Vyhľadanie v repozitári', 'Repository search'),
    ],
  },
  {
    id: 'find-badi',
    source: 'curated',
    areas: ['02'],
    symptoms: ['missing'],
    title: l('Nájdi BAdI / enhancement', 'Find a BAdI or enhancement'),
    summary: l(
      'Hľadáš miesto, kde štandard rozšíriť bez modifikácie. Začni definíciami BAdI a enhancement spotov v balíku aplikácie.',
      'You are looking for a place to extend the standard without a modification. Start with BAdI and enhancement-spot definitions in the application package.',
    ),
    signals: [
      sig(3, 'badi', 'badis', 'enhancement', 'enhancements', 'enhancement spot', 'user exit', 'customer exit', 'exit', 'rozsirenie', 'rozsirenia'),
      sig(1, 'extend', 'rozsirit', 'modify', 'modifikacia', 'hook', 'implementation', 'implementacia'),
    ],
    steps: [
      step('SE18', 'Definície BAdI a enhancement spotov', 'BAdI and enhancement-spot definitions'),
      step('SE19', 'Existujúce implementácie', 'Existing implementations'),
      step('SE84', 'Hľadanie v repozitári podľa balíka', 'Repository search by package'),
      step('SE80', 'Balík aplikácie a jeho spoty', 'The application package and its spots'),
    ],
    caution: l('V ABAP Cloud používaj iba released rozšírenia (ADT).', 'In ABAP Cloud, use released extension points only (ADT).'),
  },
  {
    id: 'code-quality',
    source: 'curated',
    areas: ['02'],
    symptoms: ['error'],
    title: l('ATC / kvalita kódu', 'ATC and code quality'),
    summary: l(
      'Nálezy statickej kontroly blokujú release alebo transport. ATC je štandard; SCI a SLIN sú klasické nástroje pod ním.',
      'Static-check findings block a release or transport. ATC is the standard; SCI and SLIN are the classic tools underneath.',
    ),
    signals: [
      sig(3, 'atc', 'code inspector', 'code quality', 'kvalita kodu', 'static check', 'staticka analyza', 'findings', 'nalezy', 'test cockpit', 'clean code', 'priority'),
      sig(1, 'syntax check', 'kontrola', 'check', 'warning', 'varovanie'),
    ],
    steps: [
      step('ATC', 'Nálezy a ich priorita', 'Findings and their priority'),
      step('SCI', 'Variant kontroly a pravidlá', 'Check variant and rules'),
      step('SLIN', 'Rozšírená syntaxová kontrola', 'Extended program check'),
    ],
  },
  {
    id: 'app-server-file',
    source: 'curated',
    areas: ['01', '03'],
    symptoms: ['missing'],
    title: l('Súbor na aplikačnom serveri', 'Application-server file'),
    summary: l(
      'Rozhranie číta alebo zapisuje súbor a ten chýba alebo je zlý. Over adresár, logickú cestu a job, ktorý ho spracúva.',
      'An interface reads or writes a file that is missing or wrong. Check the directory, the logical path and the job that processes it.',
    ),
    signals: [
      sig(3, 'file', 'files', 'subor', 'subory', 'suboru', 'directory', 'adresar', 'logical file', 'logicka cesta', 'path', 'cesta', 'csv'),
      sig(1.5, 'application server', 'app server', 'aplikacny server', 'upload', 'download', 'al11'),
    ],
    steps: [
      step('AL11', 'Adresáre a súbory na serveri', 'Directories and files on the server'),
      step('FILE', 'Logické cesty a mená súborov', 'Logical paths and file names'),
      step('SM37', 'Job, ktorý súbor spracúva', 'The job that processes the file'),
      step('SM21', 'Systémový log (oprávnenia OS, disk)', 'System log (OS permissions, disk)'),
    ],
  },
  {
    id: 'spool-print',
    source: 'curated',
    areas: ['03'],
    symptoms: ['stuck', 'missing'],
    title: l('Tlač / spool nevychádza', 'Spool or print not coming out'),
    summary: l(
      'Výstup sa netlačí alebo visí v spool fronte. Pozri stav spool requestu, výstupné zariadenie a job, ktorý ho vytvoril.',
      'Output does not print or waits in the spool queue. Check the spool request status, the output device and the job that created it.',
    ),
    signals: [
      sig(3, 'print', 'printer', 'printing', 'tlac', 'tlaciaren', 'tlacit', 'netlaci', 'spool', 'output device', 'vystupne zariadenie'),
      sig(1, 'output', 'vystup', 'pdf', 'form', 'formular'),
    ],
    steps: [
      step('SP01', 'Stav spool requestu', 'Spool request status'),
      step('SPAD', 'Výstupné zariadenie', 'Output device'),
      step('SM37', 'Job, ktorý výstup vytvoril', 'The job that created the output'),
      step('SM21', 'Systémový log', 'System log'),
    ],
  },
  // ── Basis ───────────────────────────────────────────────────────
  {
    id: 'system-health',
    source: 'curated',
    areas: ['03'],
    symptoms: ['slow', 'error'],
    title: l('Zdravie systému', 'System health check'),
    summary: l(
      'Celý systém je pomalý alebo nestabilný. Prejdi servery, pracovné procesy, systémový log, OS a buffery.',
      'The whole system is slow or unstable. Walk through servers, work processes, the system log, the OS and buffers.',
    ),
    signals: [
      sig(3, 'system down', 'system health', 'zdravie systemu', 'nestabilny', 'unstable', 'overload', 'pretazeny', 'work process', 'pracovny proces', 'pracovne procesy', 'cpu', 'memory', 'pamat'),
      sig(1.5, 'system', 'server', 'servers', 'monitoring', 'all users', 'vsetci pouzivatelia'),
    ],
    steps: [
      step('SM51', 'Bežiace aplikačné servery', 'Running application servers'),
      step('SM66', 'Globálny prehľad pracovných procesov', 'Global work-process overview'),
      step('SM21', 'Systémový log', 'System log'),
      step(['ST06', 'ST02'], 'OS metriky a buffery', 'OS metrics and buffers'),
      step('RZ20', 'CCMS alarmy', 'CCMS alerts'),
    ],
  },
  {
    id: 'db-space',
    source: 'curated',
    areas: ['03'],
    symptoms: ['error'],
    title: l('Databáza: miesto a výkon', 'Database space and health'),
    summary: l(
      'Chyby pri zápise, plný tablespace alebo pomalé DB volania. Monitor závisí od databázy.',
      'Write errors, a full tablespace or slow database calls. The monitor depends on the database platform.',
    ),
    signals: [
      sig(3, 'database', 'databaza', 'databazy', 'tablespace', 'db space', 'disk full', 'plny disk', 'storage', 'backup', 'zaloha'),
      sig(1.5, 'space', 'miesto', 'full', 'plne', 'growth', 'rast', 'db'),
    ],
    steps: [
      step('DB02', 'Kapacita a priestor', 'Storage and space'),
      step('ST04', 'Výkon databázy', 'Database performance'),
      step('DBACOCKPIT', 'Administrácia DB', 'Database administration'),
      step('DB12', 'Zálohy', 'Backups'),
    ],
  },
  {
    id: 'logon-groups',
    source: 'curated',
    areas: ['03'],
    symptoms: ['access', 'slow'],
    title: l('Prihlásenie a logon groups', 'Logon and logon groups'),
    summary: l(
      'Používatelia sa nevedia prihlásiť cez skupinu alebo sú nerovnomerne rozložení na serveroch.',
      'Users cannot log on through a group, or they are unevenly spread across servers.',
    ),
    signals: [
      sig(3, 'logon group', 'logon groups', 'load balancing', 'rozlozenie zataze', 'message server', 'smlg'),
      sig(1.5, 'logon', 'login', 'prihlasenie', 'prihlasit', 'sessions', 'prihlaseni'),
    ],
    steps: [
      step('SMLG', 'Skupiny serverov pre prihlásenie', 'Logon groups'),
      step('SM51', 'Dostupné servery', 'Available servers'),
      step(['AL08', 'SM04'], 'Kto je kde prihlásený', 'Who is logged on where'),
    ],
  },
  {
    id: 'icm-http',
    source: 'curated',
    areas: ['03', '06'],
    symptoms: ['error'],
    title: l('ICM / HTTP chyba', 'ICM or HTTP error'),
    summary: l(
      'HTTP volanie do alebo zo SAP padá (4xx/5xx, SSL). Over ICM, aktívne ICF služby a developer trace.',
      'An HTTP call into or out of SAP fails (4xx/5xx, SSL). Check the ICM, active ICF services and the developer traces.',
    ),
    signals: [
      sig(3, 'icm', 'http', 'https', 'ssl', 'tls', 'certificate', 'certifikat', 'sicf', 'icf'),
      sig(1, 'url', 'browser', 'prehliadac', 'port', 'web'),
    ],
    patterns: [pat(/\bhttp\s*(error|chyba)?\s*(4\d\d|5\d\d)\b|\b(403|404|500|502|503)\b/, 2, 'HTTP status', 'HTTP status')],
    steps: [
      step('SMICM', 'ICM stav a trace', 'ICM status and trace'),
      step('SICF', 'Je služba aktívna?', 'Is the service active?'),
      step('ST11', 'Developer trace súbory', 'Developer trace files'),
      step('SM21', 'Systémový log', 'System log'),
    ],
  },
  {
    id: 'workflow-stuck',
    source: 'curated',
    areas: ['03'],
    symptoms: ['stuck', 'error'],
    title: l('Workflow visí alebo zlyhal', 'Workflow stuck or failed'),
    summary: l(
      'Pracovná položka nedošla schvaľovateľovi, workflow stojí v chybe alebo sa vôbec nespustil. Zisti stav položky, jej agenta a či udalosť workflow naštartovala.',
      'A work item never reached the approver, the workflow is in error, or it never started. Check the work item status, its agent and whether the event started the workflow.',
    ),
    signals: [
      sig(3, 'workflow', 'workflowy', 'work item', 'workitem', 'pracovna polozka', 'schvalovanie', 'approval', 'schvalovatel', 'approver', 'swi1', 'sbwp'),
      sig(1.5, 'stuck', 'visi', 'zaseknuty', 'zaseknuta', 'error', 'chyba', 'failed', 'zlyhal', 'not started', 'nespustil', 'inbox', 'agent'),
    ],
    steps: [
      step('SWI1', 'Stav pracovnej položky a log workflow', 'Work item status and the workflow log'),
      step('SBWP', 'Inbox agenta: dostal položku?', "The agent's inbox: did the item arrive?"),
      step('SWE2', 'Spustila udalosť workflow? (prepojenie udalostí)', 'Did the event start the workflow? (event linkage)'),
      step('SWIA', 'Administrátorské zásahy do položky', 'Administrator actions on the work item'),
    ],
    caution: NOT_ON_PRD,
  },
  {
    id: 'batch-input-errors',
    source: 'curated',
    areas: ['03'],
    symptoms: ['error'],
    title: l('Batch input relácia má chyby', 'Batch input session errors'),
    summary: l(
      'Relácia v SM35 skončila s chybami alebo ostala nespracovaná. Log relácie ukáže, ktorá transakcia a obrazovka zlyhala.',
      'A session in SM35 ended with errors or was never processed. The session log shows which transaction and screen failed.',
    ),
    signals: [
      sig(3, 'batch input', 'batch-input', 'bdc', 'batch input session', 'relacia', 'relacie', 'sm35', 'recording', 'nahravka'),
      sig(1.5, 'error', 'errors', 'chyba', 'chyby', 'failed', 'zlyhala', 'not processed', 'nespracovana', 'incorrect', 'chybna'),
      sig(0.7, 'session', 'sessions', 'job', 'pozadie', 'background'),
    ],
    steps: [
      step('SM35', 'Log relácie: ktorá transakcia a obrazovka', 'Session log: which transaction and screen'),
      step('SM37', 'Job, ktorý reláciu vytvoril alebo spustil', 'The job that created or ran the session'),
      step('SHDB', 'Nahrávka, z ktorej relácia vznikla', 'The recording behind the session'),
    ],
    caution: l(
      'Reláciu nespúšťaj znova naslepo: opakované spracovanie môže zaúčtovať doklady dvakrát.',
      'Do not reprocess a session blindly: running it again can post documents twice.',
    ),
  },
  {
    id: 'email-not-sent',
    source: 'curated',
    areas: ['03'],
    symptoms: ['missing'],
    title: l('E-mail zo SAP neodišiel', 'E-mail from SAP not sent'),
    summary: l(
      'Faktúra, objednávka alebo upozornenie mali odísť e-mailom, ale príjemca nič nedostal. SOST ukáže stav odoslania, SCOT nastavenie SMTP a SM37 job odosielania.',
      'An invoice, order or alert should have gone out by e-mail, but the recipient got nothing. SOST shows the send status, SCOT the SMTP setup and SM37 the send job.',
    ),
    signals: [
      sig(3, 'email', 'e-mail', 'emaily', 'e-maily', 'mail', 'maily', 'sapconnect', 'smtp', 'sost', 'scot'),
      sig(1.5, 'not sent', 'neodisiel', 'neodosiel', 'neodoslany', 'neodoslal', 'neodoslala', 'nedostal', 'nedosiel', 'didnt receive', 'not received', 'missing', 'waiting', 'caka'),
    ],
    steps: [
      step('SOST', 'Stav odoslania a chybová hláška', 'Send status and the error message'),
      step('SCOT', 'SMTP uzol a nastavenie (iba čítať)', 'SMTP node and settings (read only)'),
      step('SM37', 'Job odosielania SAPconnect', 'The SAPconnect send job'),
    ],
    caution: l(
      'Opätovné odoslanie zo SOST pošle e-mail znova skutočnému príjemcovi.',
      'Resending from SOST sends the e-mail again to the real recipient.',
    ),
  },
  // ── Security ────────────────────────────────────────────────────
  {
    id: 'user-locked',
    source: 'curated',
    areas: ['04'],
    symptoms: ['access', 'blocked'],
    title: l('Používateľ je zamknutý', 'Locked user account'),
    summary: l(
      'Používateľ sa nevie prihlásiť: zamknutý účet, zlé heslo alebo vypršaná platnosť.',
      'The user cannot log on: a locked account, a wrong password or an expired validity date.',
    ),
    signals: [
      sig(3, 'user locked', 'locked user', 'account locked', 'pouzivatel zamknuty', 'zamknuty pouzivatel', 'zamknuty ucet', 'ucet zamknuty', 'uzamknuty ucet'),
      sig(2, 'password', 'heslo', 'hesla', 'incorrect password', 'nespravne heslo', 'logon', 'login', 'prihlasenie', 'prihlasit'),
      sig(1, 'expired', 'vyprsal', 'vyprsala', 'validity', 'platnost'),
    ],
    patterns: [
      pat(
        /user (is )?locked|account (is )?locked|pouzivatel (je )?(zamknut|uzamknut)|too many failed|incorrect logon|password .*(expired|no longer)/,
        3,
        'Hláška o prihlásení',
        'Logon message',
      ),
    ],
    steps: [
      step('SU01', 'Stav zámku a platnosť účtu', 'Lock status and validity of the account'),
      step('SUIM', 'Zoznam podľa stavu zámku a posledného prihlásenia', 'Users by lock status and last logon'),
      step('SM20', 'Neúspešné prihlásenia v audit logu', 'Failed logons in the audit log'),
    ],
    caution: l('Odomknutie iba podľa identity a schváleného postupu (help-desk proces).', 'Unlock only after verifying identity, per the approved help-desk process.'),
  },
  {
    id: 'role-analysis',
    source: 'curated',
    areas: ['04'],
    symptoms: ['access'],
    title: l('Analýza rolí: kto môže čo', 'Role analysis: who can do what'),
    summary: l(
      'Potrebuješ zistiť, ktorá rola dáva prístup, kto má kritické oprávnenie, alebo navrhnúť rolu.',
      'You need to find which role grants access, who holds a critical authorization, or how to design a role.',
    ),
    signals: [
      sig(3, 'which role', 'ktora rola', 'who can', 'kto moze', 'authorization object', 'autorizacny objekt', 'sod', 'segregation of duties', 'critical access', 'kriticke opravnenie'),
      sig(2, 'role', 'roles', 'rola', 'roly', 'profile', 'profil', 'profily', 'pfcg'),
    ],
    steps: [
      step('SUIM', 'Kto má rolu / objekt / transakciu', 'Who has a role, object or transaction'),
      step('PFCG', 'Obsah a menu roly', 'Role content and menu'),
      step('SU24', 'Návrhové hodnoty transakcií', 'Transaction proposal values'),
      step('SU21', 'Autorizačné objekty a polia', 'Authorization objects and fields'),
    ],
  },
  {
    id: 'audit-log',
    source: 'curated',
    areas: ['04'],
    symptoms: ['data'],
    title: l('Security audit: kto čo urobil', 'Security audit: who did what'),
    summary: l(
      'Potrebuješ dôkaz o prihláseniach, spustených transakciách alebo zmenách používateľov.',
      'You need evidence of logons, started transactions or user changes.',
    ),
    signals: [
      sig(3, 'audit', 'audit log', 'security audit', 'security log', 'forensic', 'bezpecnostny log'),
      sig(1.5, 'who changed', 'kto zmenil', 'who did', 'kto spustil', 'evidence', 'dokaz'),
    ],
    steps: [
      step(['SM20', 'RSAU_READ_LOG'], 'Vyhodnotenie Security Audit Log (novšie release: RSAU_READ_LOG)', 'Security Audit Log analysis (newer releases: RSAU_READ_LOG)'),
      step(['SM19', 'RSAU_CONFIG'], 'Čo sa vôbec zaznamenáva (novšie release: RSAU_CONFIG)', 'What is being recorded at all (newer releases: RSAU_CONFIG)'),
      step('SUIM', 'Zmenové doklady používateľov a rolí', 'Change documents for users and roles'),
    ],
  },
  // ── Transports and upgrades ─────────────────────────────────────
  {
    id: 'transport-missing',
    source: 'curated',
    areas: ['05'],
    symptoms: ['missing'],
    title: l('Zmena nie je v ďalšom systéme', 'Change missing downstream'),
    summary: l(
      'Objekt funguje v DEV, ale v QAS/PRD chýba. Bol request uvoľnený, obsahoval objekt a bol importovaný?',
      'An object works in DEV but is missing in QAS/PRD. Was the request released, did it contain the object, was it imported?',
    ),
    signals: [
      sig(2.5, 'transport', 'transporty', 'request', 'transport request', 'requestu'),
      sig(2, 'missing', 'chyba', 'not arrived', 'nedorazil', 'neprisiel', 'not imported', 'neimportovany', 'downstream'),
      sig(1.5, 'qas', 'prd', 'quality', 'produkcia', 'production', 'test system', 'testovaci system'),
    ],
    patterns: [pat(/not (yet )?(imported|in (qas|prd|production|quality))|nie je v (qas|prd|produkcii|teste)/, 2, 'Chýba v systéme', 'Missing in system')],
    steps: [
      step('STMS_IMPORT', 'Importná fronta a história', 'Import queue and history'),
      step(['SE09', 'SE10'], 'Uvoľnený? Obsahuje objekt?', 'Released? Does it contain the object?'),
      step('SE03', 'Hľadanie objektu v requestoch', 'Find the object in requests'),
    ],
  },
  {
    id: 'upgrade-adjustment',
    source: 'curated',
    areas: ['05'],
    symptoms: ['error'],
    title: l('Upgrade: SPDD / SPAU / SAP Notes', 'Upgrade adjustments (SPDD/SPAU/Notes)'),
    summary: l(
      'Po upgrade alebo support packu treba zladiť modifikácie a SAP Notes. SPDD rieši DDIC, SPAU repozitár.',
      'After an upgrade or support package, modifications and SAP Notes must be adjusted. SPDD handles the Dictionary, SPAU the repository.',
    ),
    signals: [
      sig(3, 'upgrade', 'upgradu', 'support package', 'support pack', 'sap note', 'sap notes', 'oss note', 'spdd', 'spau', 'snote'),
      sig(1.5, 'modification', 'modifikacia', 'modifikacie', 'adjustment', 'uprava', 'upravy', 'note', 'notes'),
    ],
    steps: [
      step('SPDD', 'Úpravy DDIC objektov', 'Dictionary adjustments'),
      step('SPAU', 'Úpravy modifikácií repozitára', 'Repository modification adjustments'),
      step('SNOTE', 'Stav SAP Notes', 'SAP Notes status'),
      step(['SPAM', 'SAINT'], 'Support packy a doplnky', 'Support packages and add-ons'),
    ],
  },
  {
    id: 'client-copy',
    source: 'curated',
    areas: ['05'],
    symptoms: ['data'],
    title: l('Kópia klienta a nastavenia klienta', 'Client copy and client settings'),
    summary: l(
      'Kópia klienta beží, zlyhala, alebo klient nepovoľuje zmeny. Logy a nastavenia klienta povedia viac.',
      'A client copy is running or failed, or the client does not allow changes. Logs and client settings tell more.',
    ),
    signals: [
      sig(3, 'client copy', 'kopia klienta', 'mandant', 'klient', 'client', 'refresh', 'cross-client', 'medziklientsky'),
      sig(1.5, 'not modifiable', 'nezmenitelny', 'client settings', 'nastavenia klienta', 'copy', 'kopia'),
    ],
    steps: [
      step('SCC4', 'Nastavenia a ochrana klienta', 'Client settings and protection'),
      step('SCC3', 'Logy kópií', 'Copy logs'),
      step(['SCCL', 'SCC9'], 'Lokálna / vzdialená kópia', 'Local / remote copy'),
      step('SCC1', 'Kopírovanie z transportu medzi klientmi', 'Copy transport objects between clients'),
    ],
    caution: l('Kópia klienta prepisuje dáta; iba v naplánovanom okne so schválením.', 'A client copy overwrites data; only in a planned window with approval.'),
  },
  // ── Integration ─────────────────────────────────────────────────
  {
    id: 'idoc-not-sent',
    source: 'curated',
    areas: ['06'],
    symptoms: ['missing'],
    title: l('IDoc sa nevytvoril / neodišiel', 'IDoc not created or not sent'),
    summary: l(
      'Partner nič nedostal. Zisti, či IDoc vôbec vznikol; ak nie, rieš partnerský profil, port a distribučný model.',
      'The partner received nothing. Find out whether an IDoc was created at all; if not, check the partner profile, port and distribution model.',
    ),
    signals: [
      sig(2, 'idoc', 'idocs'),
      sig(2, 'not sent', 'not created', 'neodoslany', 'neodisiel', 'nevytvoril', 'nevznikol', 'no idoc', 'ziadny idoc', 'missing', 'nedostal', 'didnt receive'),
      sig(1.5, 'partner', 'partner profile', 'partnersky profil', 'port', 'distribution model', 'distribucny model', 'logical system', 'logicky system', 'message type'),
      sig(1.5, 'change pointer', 'change pointers', 'zmenovy ukazovatel', 'zmenove ukazovatele', 'master data', 'kmenove data'),
    ],
    patterns: [pat(/idoc (was |is )?not (sent|created|generated)|nevznik|neodosl|no idoc|ziadny idoc/, 2, 'IDoc chýba', 'IDoc missing')],
    steps: [
      step('WE05', 'Vznikol IDoc vôbec?', 'Was an IDoc created at all?'),
      step('WE20', 'Partnerský profil a message type', 'Partner profile and message type'),
      step('WE21', 'Port', 'Port'),
      step('BD64', 'ALE distribučný model', 'ALE distribution model'),
      step(['BD61', 'BD21'], 'Kmeňové dáta: zmenové ukazovatele aktívne a spracované?', 'Master data: change pointers active and processed?'),
      step('SM59', 'RFC destinácia portu', 'RFC destination of the port'),
    ],
    caution: NOT_ON_PRD,
  },
  {
    id: 'queue-stuck',
    source: 'curated',
    areas: ['06'],
    symptoms: ['stuck'],
    title: l('qRFC/tRFC fronta stojí', 'Stuck qRFC or tRFC'),
    summary: l(
      'Správy visia vo fronte (SYSFAIL, CPICERR) alebo tRFC zlyháva. Prvá chyba vo fronte blokuje všetky za ňou.',
      'Messages hang in a queue (SYSFAIL, CPICERR) or tRFC fails. The first error in a queue blocks everything behind it.',
    ),
    signals: [
      sig(3, 'queue', 'queues', 'fronta', 'fronty', 'fronte', 'qrfc', 'trfc', 'sysfail', 'cpicerr'),
      sig(1.5, 'stuck', 'zaseknuta', 'zaseknuty', 'hanging', 'visi', 'waiting', 'caka', 'blocked', 'stojí', 'stoji'),
    ],
    patterns: [pat(/sysfail|cpicerr|status (ready|running|stop)/, 2, 'Stav fronty', 'Queue status')],
    steps: [
      step(['SMQ1', 'SMQ2'], 'Stav front a prvá chyba', 'Queue status and the first error'),
      step('SM58', 'Chybné tRFC volania', 'Failed tRFC calls'),
      step('SM59', 'Test RFC destinácie', 'Test the RFC destination'),
      step(['SMQS', 'SMQR'], 'Registrácia plánovačov front', 'Queue scheduler registration'),
    ],
    caution: NOT_ON_PRD,
  },
  {
    id: 'rfc-destination',
    source: 'curated',
    areas: ['06'],
    symptoms: ['error'],
    title: l('RFC spojenie zlyháva', 'RFC destination failing'),
    summary: l(
      'Volanie do iného systému končí communication failure alebo chybou prihlásenia RFC používateľa.',
      'A call into another system ends in a communication failure or an RFC user logon error.',
    ),
    signals: [
      sig(3, 'rfc', 'destination', 'destinacia', 'connection', 'spojenie', 'connectivity', 'gateway', 'rfc user'),
      sig(1, 'remote', 'vzdialeny', 'partner system', 'cieľový system', 'target system', 'cielovy system'),
    ],
    patterns: [
      pat(/communication_failure|communication failure|system_failure|partner .* not reached|connection (refused|closed|timed out)|cpic|name or password is incorrect/, 3, 'RFC chyba', 'RFC error'),
    ],
    steps: [
      step('SM59', 'Test spojenia a prihlásenia', 'Connection and logon test'),
      step('SMGW', 'RFC Gateway', 'RFC gateway'),
      step('ST11', 'Developer trace', 'Developer traces'),
      step('SU53', 'Oprávnenie RFC používateľa', 'Authorization of the RFC user'),
    ],
  },
  {
    id: 'odata-fiori',
    source: 'curated',
    areas: ['06'],
    symptoms: ['error'],
    title: l('Fiori / OData chyba', 'Fiori or OData error'),
    summary: l(
      'Fiori aplikácia hlási chybu alebo sa nenačíta. Gateway error logy (frontend aj backend) ukážu skutočnú príčinu.',
      'A Fiori app shows an error or does not load. The Gateway error logs (frontend and backend) show the real cause.',
    ),
    signals: [
      sig(3, 'odata', 'fiori', 'gateway', 'launchpad', 'flp', 'ui5', 'segw', 'metadata'),
      sig(1, 'app', 'aplikacia', 'tile', 'dlazdica', 'service', 'sluzba', 'frontend', 'backend'),
    ],
    steps: [
      step('/IWFND/ERROR_LOG', 'Chyby Gateway vo frontende', 'Gateway errors in the frontend'),
      step('/IWBEP/ERROR_LOG', 'Chyby OData v backende', 'OData errors in the backend'),
      step('/IWFND/MAINT_SERVICE', 'Je služba aktivovaná?', 'Is the service activated?'),
      step('/IWFND/GW_CLIENT', 'Zopakuj požiadavku a prečítaj odpoveď', 'Replay the request and read the response'),
      step(['SU53', 'STAUTHTRACE'], 'Oprávnenia (aj na službu)', 'Authorizations (including the service)'),
      step('ST22', 'Dump v backende', 'Dump in the backend'),
      step(['/IWFND/CACHE_CLEANUP', '/IWBEP/CACHE_CLEANUP'], 'Zastaraná cache metadát po zmene služby', 'Stale metadata cache after a service change'),
    ],
    caution: l(
      'Gateway Client vie posielať aj zápisy (POST, PUT, DELETE) a čistenie cache ovplyvní všetkých používateľov: na produkcii iba so schválením.',
      'The Gateway Client can send writes too (POST, PUT, DELETE), and a cache cleanup affects every user: in production only with approval.',
    ),
  },
  {
    id: 'soap-error',
    source: 'curated',
    areas: ['06'],
    symptoms: ['error'],
    title: l('SOAP web service chyba', 'SOAP web service error'),
    summary: l(
      'SOAP správa zlyhala alebo sa nedoručila. Monitor správ, logy a konfigurácia logického portu.',
      'A SOAP message failed or was not delivered. Check the message monitor, the logs and the logical-port configuration.',
    ),
    signals: [
      sig(3, 'soap', 'web service', 'webservice', 'wsdl', 'proxy', 'soamanager', 'logical port', 'logicky port', 'endpoint'),
      sig(1, 'xml', 'message', 'sprava', 'consumer', 'provider'),
    ],
    steps: [
      step('SRT_MONI', 'Monitor SOAP správ', 'SOAP message monitor'),
      step('SRT_UTIL', 'Error log a trace', 'Error log and traces'),
      step('SOAMANAGER', 'Logický port a endpoint', 'Logical port and endpoint'),
      step('SPROXY', 'Definícia proxy', 'Proxy definition'),
    ],
  },
  {
    id: 'pi-message',
    source: 'curated',
    areas: ['06'],
    symptoms: ['error', 'stuck'],
    title: l('PI/XI správa v chybe', 'PI/XI message error'),
    summary: l(
      'Správa cez klasické PI/PO uviazla alebo zlyhala v integration engine na strane ABAP.',
      'A message through classic PI/PO is stuck or failed in the ABAP-side integration engine.',
    ),
    signals: [
      sig(3, 'pi', 'xi', 'process integration', 'process orchestration', 'sxmb', 'sxmb_moni', 'integration engine', 'xml message'),
      sig(1, 'mapping', 'mapovanie', 'message', 'sprava', 'interface', 'rozhranie'),
    ],
    steps: [
      step('SXMB_MONI', 'Monitor XI/PI správ', 'XI/PI message monitor'),
      step(['SMQ1', 'SMQ2'], 'qRFC fronty správ', 'qRFC queues of the messages'),
      step('SM58', 'tRFC chyby', 'tRFC errors'),
      step('SM59', 'Spojenie na PI', 'Connection to PI'),
    ],
  },
  {
    id: 'fiori-tile-missing',
    source: 'curated',
    areas: ['06', '04'],
    symptoms: ['missing', 'access'],
    title: l('Fiori dlaždica chýba', 'Fiori tile missing'),
    summary: l(
      'Používateľ v launchpade nevidí aplikáciu alebo dlaždicu. Najčastejšie jeho role chýba katalóg (a skupina alebo stránka) alebo oprávnenie na OData službu.',
      'A user cannot see an app or tile in the launchpad. Most often the role lacks the catalog (and the group or page), or the authorization for the OData service.',
    ),
    signals: [
      sig(3, 'tile', 'tiles', 'dlazdica', 'dlazdice', 'dlazdicu', 'catalog', 'katalog', 'launchpad'),
      sig(2, 'missing', 'chyba', 'chybaju', 'not visible', 'nevidi', 'neviditelna', 'cannot see', 'disappeared', 'zmizla', 'empty', 'prazdny'),
      sig(1, 'fiori', 'flp', 'app', 'aplikacia', 'role', 'rola', 'user', 'pouzivatel'),
    ],
    steps: [
      step('/UI2/FLP', 'Čo launchpad naozaj ponúka', 'What the launchpad actually offers'),
      step('/UI2/FLPD_CUST', 'Je dlaždica v katalógu? (iba čítať)', 'Is the tile in the catalog? (read only)'),
      step('PFCG', 'Katalóg a skupina alebo stránka v role', 'Catalog and group or page in the role'),
      step('SU53', 'Chýbajúce oprávnenie (aj na OData službu)', 'Missing authorization (including the OData service)'),
    ],
    caution: l(
      'Katalógy a roly sa menia vo vývoji a idú transportom, nie priamo na produkcii.',
      'Catalogs and roles are changed in development and transported, not edited directly in production.',
    ),
  },
  // ── MM ──────────────────────────────────────────────────────────
  {
    id: 'stock-mismatch',
    source: 'curated',
    areas: ['08'],
    symptoms: ['data'],
    title: l('Zásoba nesedí', 'Stock does not add up'),
    summary: l(
      'Množstvo alebo hodnota zásoby nie je, akú očakávaš. Oddel fyzický stav, materiálové doklady a účtovnú hodnotu.',
      'The stock quantity or value is not what you expect. Separate the physical stock, the material documents and the accounting value.',
    ),
    signals: [
      sig(2.5, 'stock', 'zasoba', 'zasoby', 'zasob', 'stav zasob', 'inventory', 'on hand', 'na sklade', 'sklad'),
      sig(1.5, 'wrong', 'nespravna', 'nespravne', 'nesedi', 'nesedia', 'mismatch', 'differ', 'rozdiel', 'negative', 'zaporna', 'value', 'hodnota'),
    ],
    steps: [
      step('MMBE', 'Prehľad zásob podľa lokality', 'Stock overview by location'),
      step('MB52', 'Zásoby v závode a na skladoch', 'Warehouse stocks on hand'),
      step('MB51', 'Materiálové doklady (pohyby)', 'Material documents (movements)'),
      step('MB5B', 'Zásoba k dátumu', 'Stock at a posting date'),
      step('MB5L', 'Porovnanie so zostatkom G/L', 'Comparison with the G/L balance'),
    ],
  },
  {
    id: 'goods-movement-error',
    source: 'curated',
    areas: ['08'],
    symptoms: ['error'],
    title: l('Skladový pohyb hlási chybu', 'Goods movement error'),
    summary: l(
      'MIGO odmieta príjem, výdaj alebo prevod (napr. deficit zásoby, chýbajúci pohľad materiálu, zatvorené obdobie).',
      'MIGO rejects a receipt, issue or transfer (e.g. stock deficit, missing material view, closed period).',
    ),
    signals: [
      sig(3, 'goods movement', 'skladovy pohyb', 'goods receipt', 'goods issue', 'prijem', 'vydaj', 'prijemka', 'vydajka', 'migo', 'movement type', 'druh pohybu', 'bwart'),
      sig(1.5, 'error', 'chyba', 'deficit', 'nedostatok', 'not possible', 'nie je mozne', 'rejected', 'odmieta'),
    ],
    patterns: [pat(/deficit of|nedostatok (zasob|mnozstva)|\bm7\s*\d{3}\b|movement type \d{3}|druh pohybu \d{3}/, 2, 'MM hláška', 'MM message')],
    steps: [
      step('MIGO', 'Detail hlášky pri pohybe', 'Message details of the movement'),
      step('MMBE', 'Je dostupná zásoba?', 'Is stock available?'),
      step('MM03', 'Pohľady materiálu pre závod/sklad', 'Material views for plant/storage location'),
      step('MB51', 'Podobné úspešné pohyby', 'Similar successful movements'),
      step('COGI', 'Automatické pohyby (spätné vykazovanie), ktoré zlyhali', 'Automatic movements (backflush) that failed'),
      step('OMJJ', 'Nastavenie druhu pohybu (iba čítať)', 'Movement-type settings (read only)'),
    ],
  },
  {
    id: 'material-not-extended',
    source: 'curated',
    areas: ['07'],
    symptoms: ['missing'],
    title: l('Materiál nie je rozšírený', 'Material not extended'),
    summary: l(
      'Materiál „neexistuje“ pre závod, sklad alebo predajnú organizáciu – chýba mu príslušný pohľad.',
      'The material "does not exist" for a plant, storage location or sales org: the matching view is missing.',
    ),
    signals: [
      sig(2, 'material', 'materialu', 'material master', 'kmen materialu', 'materialovy kmen'),
      sig(2, 'view', 'views', 'pohlad', 'pohlady', 'not extended', 'nerozsireny', 'extend', 'rozsirit', 'not maintained', 'neudrzany', 'nezalozeny'),
      sig(1, 'plant', 'zavod', 'storage location', 'skladove miesto', 'sales org', 'predajna organizacia'),
    ],
    patterns: [pat(/(not|nie je) (created|maintained|extended|zalozen\w*|rozsiren\w*) (for|in|pre|v) /, 2, 'Chýba pohľad', 'Missing view')],
    steps: [
      step('MM03', 'Ktoré pohľady existujú?', 'Which views exist?'),
      step('MM50', 'Pohľady na rozšírenie', 'Views to extend'),
      step('MM60', 'Zoznam materiálov podľa závodu', 'Materials by plant'),
    ],
  },
  {
    id: 'inventory-differences',
    source: 'curated',
    areas: ['08', '13'],
    symptoms: ['data'],
    title: l('Inventúrne rozdiely', 'Physical inventory differences'),
    summary: l(
      'Spočítané množstvo sa líši od systému. Pozri inventúrny doklad, zápis počtu a rozdiely pred zaúčtovaním.',
      'The counted quantity differs from the system. Check the count document, the count entry and the differences before posting.',
    ),
    signals: [
      sig(3, 'inventura', 'inventury', 'inventure', 'physical inventory', 'fyzicka inventura', 'cycle count', 'stock count', 'count', 'pocitanie', 'spocitane', 'inventurny'),
      sig(1.5, 'difference', 'differences', 'rozdiel', 'rozdiely'),
    ],
    steps: [
      step('MI20', 'Zoznam rozdielov', 'List of differences'),
      step('MI03', 'Inventúrny doklad', 'Count document'),
      step(['MI04', 'MI05'], 'Zápis / zmena počtu', 'Enter / change the count'),
      step('MI07', 'Zaúčtovanie rozdielov (schválenie)', 'Post differences (with approval)'),
    ],
  },
  // ── SD ──────────────────────────────────────────────────────────
  {
    id: 'billing-not-created',
    source: 'curated',
    areas: ['09'],
    symptoms: ['missing'],
    title: l('Fakturácia sa nevytvorila', 'Billing document not created'),
    summary: l(
      'Dodávka alebo objednávka nie je vyfakturovaná. Billing due list a tok dokladov povedia, čo chýba.',
      'A delivery or order has not been billed. The billing due list and the document flow show what is missing.',
    ),
    signals: [
      sig(3, 'billing', 'fakturacia', 'fakturacny', 'fakturacny doklad', 'billing document', 'vyfakturovat', 'nevyfakturovane', 'billing due', 'vf01'),
      sig(2, 'not created', 'nevytvoril', 'nevytvorena', 'nevznikla', 'missing', 'chyba', 'not billed', 'nevyfakturovana'),
    ],
    steps: [
      step('VF04', 'Billing due list: prečo nie', 'Billing due list: why not'),
      step('V.23', 'Má objednávka blok fakturácie?', 'Does the order have a billing block?'),
      step('VA03', 'Tok dokladov a neúplnosť', 'Document flow and incompletion'),
      step('VL03N', 'Je zaúčtovaný výdaj tovaru?', 'Is goods issue posted?'),
      step(['VF03', 'VF05'], 'Existujúce faktúry', 'Existing billing documents'),
    ],
  },
  {
    id: 'pricing-wrong',
    source: 'curated',
    areas: ['09'],
    symptoms: ['data'],
    title: l('Nesprávna cena v SD', 'Wrong price in sales'),
    summary: l(
      'Cena alebo zľava na objednávke nesedí. Analýza cenotvorby ukáže, ktorá podmienka sa našla a prečo.',
      'A price or discount on the order is wrong. The pricing analysis shows which condition was found and why.',
    ),
    signals: [
      sig(3, 'price', 'prices', 'pricing', 'cena', 'ceny', 'cenu', 'cenotvorba', 'condition', 'podmienka', 'podmienky', 'discount', 'zlava', 'surcharge', 'prirazka'),
      sig(1, 'wrong', 'nespravna', 'zla', 'incorrect', 'chybna', 'sales', 'predaj'),
    ],
    steps: [
      step('VA03', 'Podmienky položky a analýza', 'Item conditions and pricing analysis'),
      step('VK13', 'Cenové podmienky (záznamy)', 'Condition records'),
      step('VOV8', 'Typ dokladu (iba čítať)', 'Document type (read only)'),
    ],
  },
  {
    id: 'goods-issue-problem',
    source: 'curated',
    areas: ['09', '08'],
    symptoms: ['error', 'blocked'],
    title: l('Výdaj tovaru (PGI) nejde', 'Goods issue (PGI) fails'),
    summary: l(
      'Post goods issue z dodávky zlyháva. Pozri log dodávky, picking, zásobu a tok dokladov.',
      'Post goods issue from the delivery fails. Check the delivery log, picking, stock and the document flow.',
    ),
    signals: [
      sig(3, 'goods issue', 'pgi', 'post goods issue', 'vydaj tovaru', 'vyskladnenie'),
      sig(1.5, 'delivery', 'dodavka', 'dodavky', 'dodavku', 'vl02n'),
      sig(1, 'error', 'chyba', 'not possible', 'nie je mozny', 'blocked'),
    ],
    steps: [
      step('VL02N', 'PGI a jeho chybový log', 'PGI and its error log'),
      step('VL06O', 'Monitor dodávok', 'Delivery monitor'),
      step('MMBE', 'Zásoba na výdaj', 'Stock available to issue'),
      step('VL03N', 'Tok dokladov dodávky', 'Document flow of the delivery'),
    ],
    caution: l('Pri O2C sa výdaj účtuje typicky z dodávky (VL02N); MIGO nie je univerzálna alternatíva PGI.', 'In O2C, goods issue is normally posted from the delivery (VL02N); MIGO is not a universal replacement for PGI.'),
  },
  {
    id: 'credit-block',
    source: 'curated',
    areas: ['09'],
    symptoms: ['blocked'],
    title: l('Objednávka blokovaná kontrolou úveru', 'Sales order on credit block'),
    summary: l(
      'Kontrola úveru zablokovala objednávku alebo dodávku. Zisti, prečo kontrola neprešla; uvoľnenie nechaj na kreditný manažment.',
      'The credit check blocked an order or delivery. Find out why the check failed; leave the release to credit management.',
    ),
    signals: [
      sig(3, 'credit', 'credit block', 'credit limit', 'credit check', 'kredit', 'kreditny', 'kreditny limit', 'kreditny blok', 'uver', 'uverovy', 'uverovy blok', 'vkm1'),
      sig(1.5, 'blocked', 'block', 'blok', 'blokovana', 'blokovany', 'release', 'uvolnit', 'uvolnenie', 'exceeded', 'prekroceny'),
      sig(1, 'sales order', 'objednavka', 'objednavku', 'order', 'delivery', 'dodavka', 'customer', 'odberatel'),
    ],
    steps: [
      step('VKM1', 'Blokované doklady a dôvod bloku', 'Blocked documents and the block reason'),
      step('VA03', 'Stav úveru v objednávke a tok dokladov', 'Credit status in the order and the document flow'),
      step('VA14L', 'Ďalšie doklady blokované na dodanie', 'Other documents blocked for delivery'),
    ],
    caution: l(
      'Uvoľnenie je obchodné rozhodnutie kreditného manažmentu, nie IT. V S/4HANA sa limity spravujú v SAP Credit Management.',
      'Releasing is a business decision for credit management, not IT. In S/4HANA, limits live in SAP Credit Management.',
    ),
  },
  // ── FI / CO ─────────────────────────────────────────────────────
  {
    id: 'posting-period',
    source: 'curated',
    areas: ['10'],
    symptoms: ['blocked', 'error'],
    title: l('Účtovné obdobie nie je otvorené', 'Posting period not open'),
    summary: l(
      'Účtovanie padá na „period … is not open“. Obdobia otvára FI podľa uzávierkového kalendára.',
      'Posting fails with "period … is not open". FI opens periods according to the closing calendar.',
    ),
    signals: [
      sig(3, 'posting period', 'uctovne obdobie', 'obdobie', 'obdobia', 'period', 'periods', 'fiscal year', 'fiskalny rok'),
      sig(1.5, 'open', 'otvorene', 'otvorit', 'closed', 'uzavrete', 'zatvorene'),
    ],
    patterns: [pat(/not open|nie je otvoren|neni otvoren|\bf5\s*201\b|\bm7\s*053\b/, 3, 'Hláška o období', 'Period message')],
    steps: [
      step('OB52', 'Otvorené obdobia pre typ účtu', 'Open periods per account type'),
      step(['MMRV', 'MMPV'], 'MM obdobie pri hláške M7 053 (MMPV ho posúva)', 'MM period for message M7 053 (MMPV moves it)'),
      step('SU53', 'Autorizačná skupina obdobia', 'Authorization group for the period'),
      step('FB03', 'Porovnaj dátum účtovania podobného dokladu', 'Compare the posting date of a similar document'),
    ],
    caution: l(
      'Obdobia (FI aj MM) sa menia iba podľa uzávierkového kalendára a so súhlasom FI, nie IT na požiadanie.',
      'Periods (FI and MM) change only per the closing calendar and with FI approval, not by IT on request.',
    ),
  },
  {
    id: 'payment-run',
    source: 'curated',
    areas: ['10'],
    symptoms: ['error', 'missing'],
    title: l('Platobný beh nezaplatil', 'Payment run did not pay'),
    summary: l(
      'F110 položku vynechal alebo skončil s výnimkami. Log návrhu povie dôvod (blok, banka, platobná metóda).',
      'F110 skipped an item or ended with exceptions. The proposal log says why (block, bank, payment method).',
    ),
    signals: [
      sig(3, 'payment run', 'platobny beh', 'f110', 'automatic payment', 'payment proposal', 'navrh platby', 'payment', 'platba', 'platby'),
      sig(1.5, 'bank', 'banka', 'payment method', 'platobna metoda', 'not paid', 'nezaplatene', 'exceptions', 'vynimky'),
    ],
    steps: [
      step('F110', 'Log návrhu a výnimky', 'Proposal log and exceptions'),
      step('FBL1N', 'Otvorené položky a bloky', 'Open items and blocks'),
      step('BP', 'Bankové údaje a platobné metódy', 'Bank details and payment methods'),
      step('FB03', 'Doklad faktúry', 'The invoice document'),
      step('FBZP', 'Nastavenie platobného programu (iba čítať)', 'Payment program configuration (read only)'),
    ],
  },
  {
    id: 'reversal',
    source: 'curated',
    areas: ['10', '08'],
    symptoms: ['error'],
    title: l('Storno dokladu', 'Reversing a document'),
    summary: l(
      'Doklad treba stornovať, ale systém to nedovolí (vyrovnaný, následné doklady). Každý typ dokladu má svoje storno.',
      'A document must be reversed but the system refuses (cleared, follow-on documents). Every document type has its own reversal.',
    ),
    signals: [
      sig(3, 'reverse', 'reversal', 'storno', 'stornovat', 'stornovanie', 'cancel', 'cancellation', 'zrusit', 'undo', 'reset clearing'),
      sig(1, 'document', 'doklad', 'cleared', 'vyrovnany', 'vyrovnanie'),
    ],
    patterns: [pat(/cannot be reversed|nie je mozne stornovat|cleared item|vyrovnan/, 2, 'Hláška o storne', 'Reversal message')],
    steps: [
      step('FB03', 'Doklad a následné doklady', 'Document and follow-on documents'),
      step('FBRA', 'Najprv reset vyrovnania', 'Reset clearing first'),
      step('FB08', 'Storno FI dokladu (schválenie)', 'Reverse the FI document (with approval)'),
      step(['MR8M', 'VF11', 'MIGO'], 'Storno faktúry, fakturácie, pohybu', 'Cancel invoice, billing or goods movement'),
    ],
    caution: l('Storno má účtovný dopad; posúď následné doklady a obdobie.', 'A reversal has accounting impact; check follow-on documents and the period.'),
  },
  {
    id: 'co-assignment-missing',
    source: 'curated',
    areas: ['11', '10'],
    symptoms: ['error', 'missing'],
    title: l('Chýba CO priradenie', 'Missing CO account assignment'),
    summary: l(
      'Účtovanie na nákladový účet žiada nákladové stredisko alebo príkaz. Over predvolené priradenie a stav objektu.',
      'Posting to a cost element asks for a cost center or order. Check the default assignment and the status of the object.',
    ),
    signals: [
      sig(3, 'account assignment', 'priradenie uctu', 'co object', 'co objekt', 'cost object', 'nakladovy objekt', 'kostl', 'okb9'),
      sig(2, 'cost center', 'nakladove stredisko', 'internal order', 'interny prikaz'),
      sig(1, 'missing', 'chyba', 'required', 'povinne', 'mandatory'),
    ],
    patterns: [pat(/account assignment (is )?(mandatory|required|missing)|\bki\s*235\b|no true account assignment|priradeni\w* .*povinn/, 3, 'CO hláška', 'CO message')],
    steps: [
      step('OKB9', 'Predvolené CO priradenie', 'Default account assignment'),
      step('KS03', 'Je stredisko platné a nezamknuté?', 'Is the cost center valid and unlocked?'),
      step('FS00', 'Nastavenie G/L účtu', 'G/L account settings'),
      step('KSB1', 'Kam náklady odišli', 'Where the costs went'),
    ],
  },
  {
    id: 'settlement-allocation',
    source: 'curated',
    areas: ['11'],
    symptoms: ['error'],
    title: l('Vysporiadanie / alokácia zlyhala', 'Settlement or allocation failed'),
    summary: l(
      'Mesačná uzávierka: vysporiadanie príkazu alebo assessment/distribution cyklus skončil s chybou.',
      'Month-end: an order settlement or an assessment/distribution cycle ended with errors.',
    ),
    signals: [
      sig(3, 'settlement', 'vysporiadanie', 'vysporiadat', 'allocation', 'alokacia', 'assessment', 'distribution cycle', 'cycle', 'cyklus'),
      sig(1, 'month end', 'mesacna uzavierka', 'uzavierka', 'period end', 'closing'),
    ],
    steps: [
      step('KO88', 'Vysporiadanie (najprv test)', 'Settlement (test run first)'),
      step('KO03', 'Pravidlo vysporiadania', 'Settlement rule'),
      step(['KSU5', 'KSV5'], 'Cykly (najprv test)', 'Cycles (test run first)'),
      step(['KOB1', 'KSB1'], 'Položky na objekte', 'Line items on the object'),
    ],
    caution: l('KSU5, KO88 či CK24 môžu mať veľký finančný dopad; ostré behy iba podľa uzávierkového plánu.', 'KSU5, KO88 and CK24 can have major financial impact; live runs only per the closing plan.'),
  },
  {
    id: 'exchange-rate',
    source: 'curated',
    areas: ['10'],
    symptoms: ['data', 'error'],
    title: l('Výmenný kurz chýba alebo nesedí', 'Exchange rate missing or wrong'),
    summary: l(
      'Doklad v cudzej mene hlási chýbajúci kurz alebo prepočet nesedí. Over typ kurzu a dátum platnosti.',
      'A foreign-currency document reports a missing rate, or the translation looks wrong. Check the rate type and validity date.',
    ),
    signals: [
      sig(3, 'exchange rate', 'vymenny kurz', 'kurz', 'kurzy', 'kurzu', 'fx', 'rate type', 'typ kurzu', 'translation', 'prepocet'),
      sig(1, 'currency', 'mena', 'meny', 'foreign currency', 'cudzia mena'),
      sig(1, 'valuation', 'revaluation', 'precenenie', 'precenovanie'),
    ],
    patterns: [pat(/exchange rate .*(not|missing|maintained)|no exchange rate|kurz .*(nie je|chyba)/, 2, 'Hláška o kurze', 'Rate message')],
    steps: [
      step('OB08', 'Kurzy pre typ a dátum', 'Rates for type and date'),
      step('FB03', 'Kurz použitý v doklade', 'Rate used in the document'),
      step('SM37', 'Job, ktorý kurzy nahráva', 'The job that loads rates'),
      step('FAGL_FCV', 'Precenenie cudzej meny pri uzávierke', 'Foreign currency valuation at closing'),
    ],
  },
  {
    id: 'asset-values',
    source: 'curated',
    areas: ['10'],
    symptoms: ['data'],
    title: l('Hodnoty majetku / odpisy nesedia', 'Asset values or depreciation look wrong'),
    summary: l(
      'Odpisy alebo hodnota majetku nie sú, aké by mali byť. Asset Explorer porovná plán so zaúčtovaným.',
      'Depreciation or asset values are off. The Asset Explorer compares planned and posted values.',
    ),
    signals: [
      sig(3, 'asset', 'assets', 'majetok', 'majetku', 'fixed asset', 'depreciation', 'odpis', 'odpisy', 'odpisov', 'afab'),
      sig(1, 'value', 'hodnota', 'wrong', 'nesedi', 'nespravne'),
    ],
    steps: [
      step('AW01N', 'Plán vs. zaúčtované hodnoty', 'Planned vs posted values'),
      step('AS03', 'Kmeň majetku, odpisové kľúče', 'Asset master, depreciation keys'),
      step('AFAB', 'Log odpisového behu', 'Depreciation run log'),
    ],
    caution: l('Opakované odpisové behy iba podľa uzávierkového plánu.', 'Repeat depreciation runs only per the closing plan.'),
  },
  {
    id: 'standard-price',
    source: 'curated',
    areas: ['11'],
    symptoms: ['data'],
    title: l('Štandardná cena materiálu', 'Standard price of a material'),
    summary: l(
      'Štandardná cena je zlá alebo sa neuvoľnila. Kalkulácia, jej uvoľnenie a kalkulačný beh tvoria jeden tok.',
      'The standard price is wrong or was not released. The cost estimate, its release and the costing run are one flow.',
    ),
    signals: [
      sig(3, 'standard price', 'standardna cena', 'standard cost', 'cost estimate', 'kalkulacia', 'kalkulacie', 'costing', 'costing run', 'price release', 'uvolnenie ceny', 'ck24'),
      sig(1, 'material price', 'cena materialu', 'valuation', 'ocenenie'),
    ],
    steps: [
      step('MM03', 'Účtovné a kalkulačné pohľady', 'Accounting and costing views'),
      step('CK13N', 'Existujúca kalkulácia', 'Existing cost estimate'),
      step('CK40N', 'Kalkulačný beh', 'Costing run'),
      step('CK24', 'Označenie a uvoľnenie (schválenie)', 'Mark and release (with approval)'),
    ],
    caution: l('Uvoľnenie ceny (CK24) preceňuje zásoby; iba podľa plánu controllingu.', 'Releasing a price (CK24) revalues stock; only per the controlling plan.'),
  },
  // ── PP ──────────────────────────────────────────────────────────
  {
    id: 'mrp-no-proposals',
    source: 'curated',
    areas: ['12'],
    symptoms: ['missing'],
    title: l('MRP nevytvára návrhy', 'MRP creates no proposals'),
    summary: l(
      'MRP beh nevytvoril plánované objednávky ani požiadavky. Pozri potreby, MRP nastavenie materiálu a výsledok behu.',
      'The MRP run created no planned orders or requisitions. Check the requirements, the material’s MRP settings and the run result.',
    ),
    signals: [
      sig(2.5, 'mrp', 'mrp run', 'beh mrp', 'planovanie', 'planning', 'mrp live'),
      sig(2, 'no proposals', 'ziadne navrhy', 'proposal', 'proposals', 'navrh', 'navrhy', 'planned order', 'planovana objednavka', 'not planned', 'nenaplanoval'),
    ],
    patterns: [pat(/no (planned orders|proposals|requisitions)|ziadn\w* (navrh|planovan)|nevytvoril\w* (navrh|planovan)/, 2, 'Chýbajú návrhy', 'No proposals')],
    steps: [
      step('MD04', 'Aktuálne potreby a zásoby', 'Current requirements and stock'),
      step('MM03', 'MRP pohľady (typ MRP, dávka)', 'MRP views (MRP type, lot size)'),
      step('MD05', 'Výsledok posledného behu', 'Result of the last run'),
      step('MD63', 'Existujú plánované potreby?', 'Do planned requirements exist?'),
      step('MD03', 'Jednopoložkové MRP (test)', 'Single-item MRP (test)'),
    ],
  },
  {
    id: 'confirmation-error',
    source: 'curated',
    areas: ['12'],
    symptoms: ['error'],
    title: l('Potvrdenie výroby zlyhalo', 'Production confirmation error'),
    summary: l(
      'Potvrdenie operácie hlási chybu alebo vznikli chybné skladové pohyby (backflush).',
      'Confirming an operation fails, or the confirmation created failed goods movements (backflush).',
    ),
    signals: [
      sig(3, 'confirmation', 'potvrdenie', 'potvrdit', 'confirm', 'co11n', 'backflush', 'spatne vykazovanie', 'failed goods movements', 'cogi'),
      sig(1, 'production', 'vyroba', 'vyrobny prikaz', 'production order', 'operation', 'operacia'),
    ],
    steps: [
      step('CO11N', 'Hlášky potvrdenia', 'Confirmation messages'),
      step('COGI', 'Chybné skladové pohyby z potvrdenia', 'Failed goods movements from the confirmation'),
      step('CO03', 'Stav príkazu (uvoľnený? TECO?)', 'Order status (released? TECO?)'),
      step('COOIS', 'Chýbajúce diely a prehľad príkazov', 'Missing parts and order overview'),
      step('MMBE', 'Zásoba komponentov', 'Component stock'),
    ],
  },
  // ── Warehouse ───────────────────────────────────────────────────
  {
    id: 'wm-transfer-order',
    source: 'curated',
    areas: ['13'],
    symptoms: ['stuck', 'error'],
    title: l('WM transfer order visí', 'WM transfer order stuck'),
    summary: l(
      'Transfer order v klasickom LE-WM nie je potvrdený alebo sa nedá vytvoriť. Pozri TO, pozície a zásobu.',
      'A transfer order in classic LE-WM is unconfirmed or cannot be created. Check the TO, the bins and the stock.',
    ),
    signals: [
      sig(3, 'transfer order', 'prevodny prikaz', 'storage bin', 'skladova pozicia', 'le-wm', 'wm', 'putaway', 'zaskladnenie'),
      sig(1, 'bin', 'pozicia', 'not confirmed', 'nepotvrdeny', 'stuck', 'open', 'otvoreny'),
    ],
    steps: [
      step('LT21', 'Detail transfer order', 'Transfer order details'),
      step(['LX02', 'LS24'], 'Zásoba na pozíciách', 'Stock in bins'),
      step('LS03N', 'Stav pozície (blokovaná?)', 'Bin status (blocked?)'),
      step('LT12', 'Potvrdenie (iba so schválením)', 'Confirm (only with approval)'),
    ],
  },
  {
    id: 'ewm-task-stuck',
    source: 'curated',
    areas: ['14'],
    symptoms: ['stuck'],
    title: l('EWM úloha visí', 'EWM warehouse task stuck'),
    summary: l(
      'Warehouse task alebo order v EWM zostal otvorený, RF ho nevidí, alebo neprišla aktualizácia do ERP.',
      'A warehouse task or order in EWM stays open, RF cannot see it, or the update never reached ERP.',
    ),
    signals: [
      sig(2, 'ewm', 'scwm'),
      sig(2, 'warehouse task', 'skladova uloha', 'warehouse order', 'task', 'uloha', 'rf', 'handheld', 'skener', 'scanner'),
      sig(1.5, 'stuck', 'open', 'otvorena', 'zaseknuta', 'not confirmed', 'nepotvrdena', 'visi'),
    ],
    steps: [
      step('/SCWM/MON', 'Otvorené úlohy, objednávky, alerty', 'Open tasks, orders and alerts'),
      step('/SCWM/TO_DISP', 'Detail úlohy', 'Task details'),
      step('/SCWM/RFUI', 'Pohľad RF používateľa', 'The RF user’s view'),
      step(['SMQ1', 'SMQ2'], 'Fronty ERP ↔ EWM', 'ERP ↔ EWM queues'),
      step('/SCWM/PRDO', 'Odchádzajúca dodávka v EWM', 'Outbound delivery in EWM'),
    ],
  },
  // ── QM / PM ─────────────────────────────────────────────────────
  {
    id: 'inspection-lot-blocks',
    source: 'curated',
    areas: ['15'],
    symptoms: ['blocked'],
    title: l('Kontrolná dávka blokuje zásobu', 'Inspection lot blocks stock'),
    summary: l(
      'Materiál je v zásobe kontroly kvality a nedá sa použiť, kým nie je zapísané rozhodnutie o použití.',
      'The material sits in quality-inspection stock and cannot be used until a usage decision is recorded.',
    ),
    signals: [
      sig(3, 'inspection lot', 'kontrolna davka', 'quality inspection', 'kontrola kvality', 'quality stock', 'usage decision', 'rozhodnutie o pouziti', 'qm'),
      sig(1.5, 'blocked', 'blokovana', 'nedostupna', 'cannot use', 'release', 'uvolnit'),
    ],
    steps: [
      step('QA32', 'Pracovný zoznam dávok', 'Inspection lot worklist'),
      step('QE51N', 'Sú zapísané výsledky?', 'Are results recorded?'),
      step('QA11', 'Rozhodnutie o použití (QM používateľ)', 'Usage decision (QM user)'),
      step('MMBE', 'Zásoba v kontrole kvality', 'Stock in quality inspection'),
    ],
  },
  {
    id: 'maintenance-order',
    source: 'curated',
    areas: ['16'],
    symptoms: ['error', 'stuck'],
    title: l('Príkaz údržby', 'Maintenance order problem'),
    summary: l(
      'Príkaz údržby sa nedá uvoľniť, potvrdiť alebo uzavrieť. Pozri jeho stav, hlásenie a technický objekt.',
      'A maintenance order cannot be released, confirmed or closed. Check its status, the notification and the technical object.',
    ),
    signals: [
      sig(3, 'maintenance order', 'prikaz udrzby', 'udrzbovy prikaz', 'maintenance', 'udrzba', 'udrzby', 'pm', 'maintenance plan', 'plan udrzby'),
      sig(1, 'notification', 'hlasenie', 'equipment', 'zariadenie', 'functional location', 'funkcne miesto'),
    ],
    steps: [
      step('IW33', 'Stav a operácie príkazu', 'Order status and operations'),
      step('IW39', 'Zoznam príkazov', 'Order list'),
      step('IW23', 'Hlásenie údržby', 'Maintenance notification'),
      step(['IE03', 'IL03'], 'Zariadenie / funkčné miesto', 'Equipment / functional location'),
    ],
  },
  // ── BW ──────────────────────────────────────────────────────────
  {
    id: 'bw-delta-missing',
    source: 'curated',
    areas: ['17'],
    symptoms: ['missing', 'data'],
    title: l('Extrakcia / delta chýba', 'Extraction or delta missing'),
    summary: l(
      'Do BW alebo Datasphere neprišli nové záznamy. Over delta queue (ODQMON), extraktor a joby extrakcie.',
      'New records did not reach BW or Datasphere. Check the delta queue (ODQMON), the extractor and the extraction jobs.',
    ),
    signals: [
      sig(3, 'delta', 'extraction', 'extrakcia', 'extraktor', 'extractor', 'datasource', 'data source', 'odp', 'odq', 'delta queue', 'delta init', 'odqmon', 'rsa7'),
      sig(1, 'bw', 'datasphere', 'missing', 'chyba', 'no data', 'ziadne data'),
      sig(3, 'lo cockpit', 'logistics extraction', 'logisticka extrakcia', 'mcex', 'lbwe', 'lbwq'),
      sig(1.5, 'setup table', 'setup tables', 'setup tabulky'),
    ],
    steps: [
      step('ODQMON', 'ODP delta queue', 'ODP delta queue'),
      step('RSA3', 'Test extraktora', 'Extractor test'),
      step('RSA6', 'Je DataSource aktívny?', 'Is the DataSource active?'),
      step(['LBWQ', 'LBWE'], 'Logistika: extrakčné fronty MCEX a LO Cockpit', 'Logistics: MCEX extraction queues and the LO cockpit'),
      step('SM37', 'Joby extrakcie', 'Extraction jobs'),
      step('RSA7', 'Klasická delta queue (legacy)', 'Classic delta queue (legacy)'),
    ],
  },
  {
    id: 'process-chain-failed',
    source: 'curated',
    areas: ['17'],
    symptoms: ['error'],
    title: l('Procesný reťazec BW zlyhal', 'BW process chain failed'),
    summary: l(
      'Nočné nahrávanie v BW skončilo červenou. Monitor reťazca ukáže krok; job a dump povedia príčinu.',
      'The nightly BW load ended red. The chain monitor shows the step; the job and dump tell you why.',
    ),
    signals: [
      sig(3, 'process chain', 'procesny retazec', 'retazec', 'chain', 'rspc', 'rspcm', 'dtp', 'infopackage', 'bw load', 'load failed'),
      sig(1, 'bw', 'red', 'cervena', 'failed', 'zlyhal'),
    ],
    steps: [
      step('RSPCM', 'Monitor reťazcov', 'Chain monitor'),
      step('RSPC', 'Log kroku reťazca', 'Log of the chain step'),
      step('SM37', 'Job kroku', 'The step’s job'),
      step('ST22', 'Dump', 'Dump'),
    ],
  },
  {
    id: 'bw-query-wrong',
    source: 'curated',
    areas: ['17'],
    symptoms: ['data'],
    title: l('BW query ukazuje zlé čísla', 'BW query shows wrong numbers'),
    summary: l(
      'Report z BW nesedí so zdrojom. Over query, surové dáta providera, konzistenciu a analytické oprávnenia.',
      'A BW report does not match the source. Check the query, raw provider data, consistency and analysis authorizations.',
    ),
    signals: [
      sig(3, 'bw query', 'wrong numbers', 'nespravne cisla', 'key figure', 'ukazovatel', 'infoprovider', 'rsrt', 'listcube'),
      sig(1.5, 'query', 'report', 'reporting', 'numbers', 'cisla', 'totals', 'sucty', 'kpi'),
      sig(0.8, 'wrong', 'nespravne', 'nesedi', 'differ'),
    ],
    steps: [
      step('RSRT', 'Spusti a analyzuj query', 'Run and analyse the query'),
      step('LISTCUBE', 'Surové dáta v provideri', 'Raw data in the provider'),
      step('RSRV', 'Konzistenčné kontroly', 'Consistency checks'),
      step('RSECADMIN', 'Analytické oprávnenia (skryté dáta?)', 'Analysis authorizations (hidden data?)'),
    ],
  },
  // ── Migration ───────────────────────────────────────────────────
  {
    id: 'bp-cvi-sync',
    source: 'curated',
    areas: ['18'],
    symptoms: ['error', 'data'],
    title: l('BP / CVI synchronizácia', 'BP and CVI synchronization'),
    summary: l(
      'Business Partner a odberateľ/dodávateľ nie sú zladení. CVI je podmienkou konverzie na S/4HANA.',
      'Business Partner and customer/supplier are out of sync. CVI is a prerequisite for an S/4HANA conversion.',
    ),
    signals: [
      sig(3, 'business partner', 'obchodny partner', 'cvi', 'customer vendor integration', 'mds', 'mds_load_cockpit', 'bp role', 'rola bp', 'bp'),
      sig(1.5, 'synchronization', 'synchronizacia', 'sync', 'customer', 'odberatel', 'vendor', 'supplier', 'dodavatel'),
    ],
    steps: [
      step('CVI_COCKPIT', 'Príprava CVI (ECC)', 'CVI preparation (ECC)'),
      step('MDS_LOAD_COCKPIT', 'Synchronizácia BP ↔ odberateľ/dodávateľ', 'BP ↔ customer/supplier sync'),
      step('BP', 'Roly a údaje partnera', 'Partner roles and data'),
      step('SLG1', 'Logy synchronizácie', 'Synchronization logs'),
    ],
  },
  {
    id: 'legacy-in-s4',
    source: 'curated',
    areas: ['18'],
    symptoms: ['missing', 'error'],
    title: l('Legacy kód v S/4HANA', 'Legacy code in S/4HANA'),
    summary: l(
      'Starý ECC kód v S/4HANA chýba alebo sa nemá používať. Almanach uvádza moderný ekvivalent.',
      'An old ECC code is missing in S/4HANA or should not be used. The almanac names the modern equivalent.',
    ),
    replacementTrail: true,
    signals: [
      sig(2, 'legacy', 'zastarany', 'obsolete', 'deprecated', 'replaced', 'nahradeny', 'nahrada', 'replacement', 'successor', 'nastupca', 'simplification', 'not available', 'nedostupny', 'no longer'),
      sig(1.5, 's4', 'hana', 'ecc'),
    ],
    steps: [step('SE93', 'Over, či kód v tvojom release existuje', 'Check whether the code exists in your release')],
  },
  {
    id: 'slt-replication',
    source: 'curated',
    areas: ['17', '18'],
    symptoms: ['stuck', 'data'],
    title: l('SLT replikácia stojí', 'SLT replication stalled'),
    summary: l(
      'Replikácia cez SAP Landscape Transformation zaostáva alebo zlyháva. Cockpit, joby a spojenie na zdroj.',
      'Replication via SAP Landscape Transformation lags or fails. Check the cockpit, the jobs and the source connection.',
    ),
    signals: [
      sig(3, 'slt', 'replication', 'replikacia', 'replikacie', 'landscape transformation', 'ltrc', 'trigger', 'triggers', 'logging table'),
      sig(1, 'lag', 'oneskorenie', 'stalled', 'stoji', 'real-time', 'realny cas'),
    ],
    steps: [
      step('LTRC', 'SLT cockpit: stav tabuliek', 'SLT cockpit: table status'),
      step('SM37', 'Replikačné joby', 'Replication jobs'),
      step('SM59', 'Spojenie na zdrojový systém', 'Connection to the source system'),
      step('SLG1', 'Aplikačné logy', 'Application logs'),
    ],
  },
];

export const ARCHETYPES: readonly Archetype[] = [...ALMANAC, ...CURATED];

export const getArchetype = (id: string): Archetype | undefined => ARCHETYPES.find((a) => a.id === id);
