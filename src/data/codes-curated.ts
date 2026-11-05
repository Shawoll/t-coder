// Curated T-codes: everyday codes the almanac does not list, added for T-Coder.
// They join the almanac's 18 areas and use its type legend (R/W/A/O/L), but
// the UI labels them as curated, and the author signs each one off in
// src/data/reviewed.ts (`codes`). A code goes in only if it surely exists
// under this name; purposes are short, neutral "what it is" lines.
//
// If a later almanac edition lists one of these codes, delete it here: a test
// fails on any code that is in both lists.
//
// Kept JSON-free so scripts/review-export.ts can import it on plain Node.

import type { AreaId, TCode, TType } from '../types.ts';

const c = (code: string, area: AreaId, type: TType, sk: string, en: string): TCode => ({
  code,
  area,
  type,
  purpose: { sk, en },
});

export const CURATED_CODES: readonly TCode[] = [
  // ── 01 Navigation and discovery ─────────────────────────────────
  c('SE15', '01', 'R', 'Klasický informačný systém repozitára', 'Classic repository information system'),
  c('SQVI', '01', 'R', 'QuickViewer: rýchle zostavy nad tabuľkami', 'QuickViewer: quick reports on tables'),
  c('SBWP', '01', 'W', 'Business Workplace: inbox a pracovné položky', 'Business Workplace: inbox and work items'),

  // ── 02 ABAP development ─────────────────────────────────────────
  c('SE30', '02', 'L', 'Klasická analýza behu ABAP; prednosť SAT', 'Classic ABAP runtime analysis; prefer SAT'),
  c('SO10', '02', 'W', 'Štandardné texty SAPscript', 'SAPscript standard texts'),
  c('SNRO', '02', 'A', 'Objekty číselných rozsahov', 'Number range objects'),
  c('SE63', '02', 'W', 'Prekladové prostredie', 'Translation editor'),
  c('SWDD', '02', 'W', 'Workflow Builder: návrh workflow', 'Workflow Builder'),
  c('BRFPLUS', '02', 'W', 'BRFplus: pravidlá a rozhodovacie tabuľky', 'BRFplus business rules workbench'),

  // ── 03 Operations, Basis and monitoring ─────────────────────────
  c('SM35', '03', 'A', 'Batch input relácie a ich spracovanie', 'Batch input sessions and their processing'),
  c('ST01', '03', 'R', 'Systémový trace (oprávnenia, RFC, DB)', 'System trace (authorizations, RFC, database)'),
  c('SOST', '03', 'R', 'Odoslané správy SAPconnect (e-mail)', 'SAPconnect send requests (e-mail)'),
  c('SCOT', '03', 'A', 'Administrácia SAPconnect (SMTP)', 'SAPconnect administration (SMTP)'),
  c('CG3Y', '03', 'R', 'Stiahnutie súboru z aplikačného servera', 'Download a file from the application server'),
  c('CG3Z', '03', 'A', 'Nahratie súboru na aplikačný server', 'Upload a file to the application server'),
  c('STRUST', '03', 'A', 'Trust Manager: certifikáty a PSE', 'Trust Manager: certificates and PSEs'),
  c('SWI1', '03', 'R', 'Prehľad workflow pracovných položiek', 'Workflow work item selection'),
  c('SWIA', '03', 'A', 'Pracovné položky v administrátorskom režime', 'Process work items as administrator'),
  c('SWE2', '03', 'A', 'Prepojenie udalostí a workflow', 'Event type linkage'),

  // ── 04 Authorizations and security ──────────────────────────────
  c('SU01D', '04', 'R', 'Zobrazenie používateľov', 'Display users'),
  c('SUPC', '04', 'A', 'Hromadné generovanie profilov rolí', 'Mass generation of role profiles'),
  c('PFUD', '04', 'A', 'Porovnanie používateľov s rolami', 'User master data reconciliation'),
  c('RSAU_CONFIG', '04', 'A', 'Konfigurácia Security Audit Log (novšie release)', 'Security Audit Log configuration (newer releases)'),
  c('RSAU_READ_LOG', '04', 'R', 'Vyhodnotenie Security Audit Log (novšie release)', 'Security Audit Log evaluation (newer releases)'),

  // ── 05 Transports, customizing and upgrades ─────────────────────
  c('SCMP', '05', 'R', 'Porovnanie obsahu tabuliek medzi systémami', 'Compare table contents across systems'),
  c('SCU0', '05', 'R', 'Porovnanie customizingu medzi systémami', 'Cross-system customizing comparison'),

  // ── 06 Integration, RFC, IDoc and services ──────────────────────
  c('BD10', '06', 'A', 'Odoslanie materiálu cez ALE', 'Send material master via ALE'),
  c('BD21', '06', 'A', 'Tvorba IDoc zo zmenových ukazovateľov', 'Create IDocs from change pointers'),
  c('BD61', '06', 'A', 'Globálna aktivácia zmenových ukazovateľov', 'Activate change pointers globally'),
  c('SALE', '06', 'A', 'Nastavenie ALE (IMG)', 'ALE customizing (IMG)'),
  c('/IWFND/GW_CLIENT', '06', 'A', 'Gateway Client: test OData požiadaviek', 'SAP Gateway Client for OData requests'),
  c('/IWFND/CACHE_CLEANUP', '06', 'A', 'Vyčistenie cache metadát vo frontende', 'Clean up the frontend metadata cache'),
  c('/IWBEP/CACHE_CLEANUP', '06', 'A', 'Vyčistenie cache metadát v backende', 'Clean up the backend metadata cache'),
  c('/UI2/FLP', '06', 'R', 'Spustenie Fiori launchpadu', 'Start the Fiori launchpad'),
  c('/UI2/FLPD_CUST', '06', 'A', 'Fiori Launchpad Designer (pre všetkých klientov)', 'Fiori launchpad designer (cross-client)'),

  // ── 07 MM: materials and purchasing ─────────────────────────────
  c('ME28', '07', 'W', 'Hromadné uvoľnenie nákupných objednávok', 'Collective release of purchase orders'),
  c('ME29N', '07', 'W', 'Uvoľnenie nákupnej objednávky', 'Release purchase order'),
  c('ME55', '07', 'W', 'Hromadné uvoľnenie nákupných požiadaviek', 'Collective release of purchase requisitions'),
  c('ME80FN', '07', 'R', 'Všeobecná analýza nákupných dokladov', 'General analysis of purchasing documents'),
  c('ME9F', '07', 'W', 'Výstup správ nákupných objednávok', 'Message output for purchase orders'),
  c('MM06', '07', 'W', 'Označenie materiálu na vymazanie', 'Flag material for deletion'),
  c('MMPV', '07', 'A', 'Uzavretie MM obdobia (posun na ďalšie)', 'Close the MM period (move to the next one)'),
  c('MMRV', '07', 'A', 'Aktuálne MM obdobie a účtovanie do predošlého', 'Current MM period; allow posting to the previous one'),

  // ── 08 Inventory movements and invoice verification ─────────────
  c('MB25', '08', 'R', 'Rezervácie podľa priradenia účtu', 'Reservations by account assignment'),
  c('MRRL', '08', 'A', 'Vyúčtovanie podľa príjmu (ERS)', 'Evaluated receipt settlement (ERS)'),
  c('MR11', '08', 'A', 'Údržba účtu WE/RE (GR/IR)', 'GR/IR clearing account maintenance'),
  c('MR21', '08', 'A', 'Zmena ceny materiálu', 'Material price change'),
  c('MBST', '08', 'L', 'Historické storno materiálového dokladu; prednosť MIGO', 'Legacy material document cancellation; prefer MIGO'),

  // ── 09 SD: sales and distribution ───────────────────────────────
  c('VL10A', '09', 'W', 'Tvorba dodávok z odberateľských objednávok', 'Create deliveries from sales orders'),
  c('VL09', '09', 'A', 'Storno výdaja tovaru z dodávky', 'Reverse goods issue for a delivery'),
  c('VFX3', '09', 'A', 'Uvoľnenie faktúr do účtovníctva', 'Release billing documents for accounting'),
  c('V.23', '09', 'R', 'Objednávky blokované na fakturáciu', 'Sales orders blocked for billing'),
  c('V.02', '09', 'R', 'Neúplné odberateľské objednávky', 'Incomplete sales orders'),
  c('VA14L', '09', 'R', 'Predajné doklady blokované na dodanie', 'Sales documents blocked for delivery'),
  c('VKM1', '09', 'W', 'Blokované SD doklady (kontrola úveru)', 'Blocked SD documents (credit check)'),
  c('VF31', '09', 'W', 'Výstup správ z fakturačných dokladov', 'Output from billing documents'),
  c('VTFL', '09', 'A', 'Kopírovacie riadenie z dodávky do fakturácie', 'Copy control: delivery to billing'),

  // ── 10 FI: financial accounting and assets ──────────────────────
  c('FB05', '10', 'W', 'Účtovanie s vyrovnaním', 'Post with clearing'),
  c('FB65', '10', 'W', 'Dobropis od dodávateľa vo FI', 'Enter supplier credit memo in FI'),
  c('FB75', '10', 'W', 'Dobropis odberateľovi vo FI', 'Enter customer credit memo in FI'),
  c('FBV0', '10', 'W', 'Zaúčtovanie predbežne uloženého dokladu', 'Post parked document'),
  c('FAGLB03', '10', 'R', 'Zostatky účtov hlavnej knihy (New G/L)', 'G/L account balances (New G/L)'),
  c('FK10N', '10', 'R', 'Zostatky dodávateľa', 'Supplier balance display'),
  c('FD10N', '10', 'R', 'Zostatky odberateľa', 'Customer balance display'),
  c('FAGL_FCV', '10', 'A', 'Precenenie cudzej meny', 'Foreign currency valuation'),
  c('FEBAN', '10', 'W', 'Dodatočné spracovanie elektronického výpisu', 'Post-process electronic bank statements'),
  c('F150', '10', 'A', 'Upomienkový beh', 'Dunning run'),
  c('FBZP', '10', 'A', 'Nastavenie platobného programu', 'Payment program configuration'),
  c('FTXP', '10', 'A', 'Údržba daňových kódov', 'Maintain tax codes'),
  c('AJAB', '10', 'A', 'Ročná uzávierka v účtovníctve majetku', 'Asset accounting year-end closing'),

  // ── 11 CO: controlling and costing ──────────────────────────────
  // English purposes start with Create/Display so siblings() pairs KA01/KA03 and KE51/KE53.
  c('KA01', '11', 'L', 'Založenie primárneho nákladového druhu (legacy)', 'Create cost element (primary, legacy)'),
  c('KA03', '11', 'L', 'Zobrazenie nákladového druhu (legacy)', 'Display cost element (legacy)'),
  c('KE51', '11', 'W', 'Založenie ziskového strediska', 'Create profit center'),
  c('KE53', '11', 'R', 'Zobrazenie ziskového strediska', 'Display profit center'),
  c('KB15N', '11', 'W', 'Manuálna alokácia primárnych nákladov', 'Manual primary cost allocation'),
  c('CJ20N', '11', 'W', 'Project Builder: projekty a PSP prvky', 'Project Builder: projects and WBS elements'),
  c('CJI3', '11', 'R', 'Skutočné náklady projektu po položkách', 'Project actual cost line items'),
  c('CJ88', '11', 'A', 'Vysporiadanie projektov a sietí', 'Settle projects and networks'),

  // ── 12 PP: production, MRP and BOMs ─────────────────────────────
  c('COGI', '12', 'A', 'Chybné automatické skladové pohyby', 'Postprocess failed automatic goods movements'),
  c('CO15', '12', 'W', 'Potvrdenie výrobného príkazu (hlavička)', 'Confirm production order (header level)'),
  c('CO13', '12', 'A', 'Storno potvrdenia výrobného príkazu', 'Cancel production order confirmation'),
  c('CO24', '12', 'R', 'Informačný systém chýbajúcich dielov', 'Missing parts information system'),
  c('C223', '12', 'W', 'Údržba výrobných verzií', 'Production version maintenance'),
  c('CS12', '12', 'R', 'Viacúrovňový rozpad kusovníka', 'Multi-level BOM explosion'),
  c('CS15', '12', 'R', 'Použitie materiálu v kusovníkoch', 'BOM where-used list for a material'),

  // ── 13 Warehouse: classic LE-WM ─────────────────────────────────
  c('LT06', '13', 'W', 'Transfer order k materiálovému dokladu', 'Create transfer order for a material document'),
  c('LT22', '13', 'R', 'Transfer ordery podľa typu skladu', 'Transfer orders by storage type'),
  c('LX03', '13', 'R', 'Stav skladových pozícií', 'Bin status report'),

  // ── 14 Warehouse: Extended Warehouse Management ─────────────────
  c('/SCWM/MAT1', '14', 'O', 'Údržba skladového produktu', 'Maintain warehouse product'),
  c('/SCWM/LS03', '14', 'O', 'Zobrazenie skladovej pozície EWM', 'Display EWM storage bin'),
  c('/SCWM/PI_PROCESS', '14', 'O', 'Spracovanie inventúrneho dokladu EWM', 'Process EWM physical inventory documents'),
  c('/SCWM/PACK', '14', 'O', 'Balenie na pracovisku EWM', 'Packing at an EWM work center'),
  c('/SCWM/WAVE', '14', 'O', 'Údržba vĺn (waves)', 'Maintain waves'),

  // ── 15 QM: quality management ───────────────────────────────────
  c('QA03', '15', 'R', 'Zobrazenie kontrolnej dávky', 'Display inspection lot'),
  c('QM10', '15', 'W', 'Zoznam a spracovanie hlásení kvality', 'Change quality notifications in list'),
  c('QM11', '15', 'R', 'Zoznam hlásení kvality - zobrazenie', 'Display quality notification list'),

  // ── 16 PM: plant maintenance ────────────────────────────────────
  c('IW28', '16', 'W', 'Zoznam a spracovanie hlásení údržby', 'Change maintenance notifications in list'),
  c('IW29', '16', 'R', 'Zoznam hlásení údržby - zobrazenie', 'Display maintenance notification list'),
  c('IW41', '16', 'W', 'Potvrdenie príkazu údržby', 'Confirm maintenance order'),
  c('IW37N', '16', 'R', 'Zoznam príkazov a operácií údržby', 'Maintenance order and operation list'),
  c('IP01', '16', 'W', 'Založenie plánu údržby', 'Create maintenance plan'),
  c('IP02', '16', 'W', 'Zmena plánu údržby', 'Change maintenance plan'),
  c('IP03', '16', 'R', 'Zobrazenie plánu údržby', 'Display maintenance plan'),
  c('IP30', '16', 'A', 'Hromadné sledovanie termínov plánov údržby', 'Deadline monitoring for maintenance plans'),

  // ── 17 BW, extraction and data flows ────────────────────────────
  c('SBIW', '17', 'A', 'Nastavenie prenosu dát do BW (IMG)', 'Data transfer to BW customizing (IMG)'),
  c('LBWE', '17', 'A', 'Logistický extrakčný kokpit (LO Cockpit)', 'Logistics extraction cockpit (LO cockpit)'),
  c('LBWQ', '17', 'R', 'Extrakčné fronty logistiky (MCEX)', 'Logistics extraction queues (MCEX)'),
  c('LBWG', '17', 'A', 'Vymazanie setup tabuliek', 'Delete setup tables'),

  // ── 18 S/4HANA conversion and migration ─────────────────────────
  c('SYCM', '18', 'O', 'Simplification Database pre analýzu vlastného kódu', 'Simplification database for custom code analysis'),
  c('MDS_PPO2', '18', 'O', 'Chyby synchronizácie BP (Post Processing Office)', 'BP synchronization errors (Post Processing Office)'),
];
