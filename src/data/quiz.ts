import type { L10n } from '../types.ts';

export interface QuizItem {
  /** The almanac's question (pp. 37–38). */
  question: L10n;
  /** Codes the model answer relies on. */
  codes: string[];
  /** Curated model answer, written for T-Coder. */
  answer: L10n;
}

const q = (question: [string, string], codes: string[], answer: [string, string]): QuizItem => ({
  question: { sk: question[0], en: question[1] },
  codes,
  answer: { sk: answer[0], en: answer[1] },
});

/** The 20 self-test questions of the almanac with curated model answers. */
export const QUIZ: readonly QuizItem[] = [
  q(
    ['Na čo slúži SE93 a ako zistíš, či transakcia existuje?', 'What does SE93 do and how do you verify a transaction?'],
    ['SE93', 'SE16N'],
    [
      'SE93 zobrazuje a udržiava definície transakcií: aký program alebo dynpro spúšťajú a do akého balíka patria. Existenciu overíš v SE93 alebo v tabuľke TSTC (popisy v TSTCT) cez SE16N. Či ju používateľ smie spustiť, rozhoduje S_TCODE a ďalšie oprávnenia; či je v release odporúčaná, povie Simplification List.',
      'SE93 displays and maintains transaction definitions: which program or screen they start and which package owns them. Check existence in SE93 or in table TSTC (texts in TSTCT) via SE16N. Whether a user may start it depends on S_TCODE and further authorizations; whether it is recommended in the release, the Simplification List tells.',
    ],
  ),
  q(
    ['Ako rozlíšiš zlyhaný job od ABAP dumpu?', 'How do you distinguish a failed job from a dump?'],
    ['SM37', 'ST22'],
    [
      'Zlyhaný job vidíš v SM37 v stave Canceled; jeho log ukáže prvú chybu. Dump je runtime chyba programu v ST22. Job často padne práve kvôli dumpu – preto porovnaj čas a program. Job však môže skončiť chybou aj bez dumpu, napríklad aplikačnou hláškou typu E.',
      'A failed job shows as Canceled in SM37; its log shows the first error. A dump is a program runtime error in ST22. A job often fails because of a dump, so compare time and program. But a job can also fail without a dump, for example on an application error message of type E.',
    ],
  ),
  q(
    ['Kedy použiješ ST05, SAT a ST12?', 'When do you use ST05, SAT and ST12?'],
    ['ST05', 'SAT', 'ST12'],
    [
      'ST05, keď máš podozrenie na databázu: zlé alebo opakované SELECTy, chýbajúce indexy. SAT, keď čas žerie ABAP logika. ST12, keď chceš oboje naraz a je v systéme dostupná. Začni štatistikou v ST03N/STAD, aby si vedel, ktorú stopu zvoliť.',
      'ST05 when you suspect the database: bad or repeated SELECTs, missing indexes. SAT when ABAP logic eats the time. ST12 when you want both together and it is available. Start with statistics in ST03N/STAD to know which trace to choose.',
    ],
  ),
  q(
    ['Čo znamená S_TCODE a prečo nestačí samotný T-kód?', 'What is S_TCODE and why is T-code access insufficient?'],
    ['SU53', 'PFCG', 'SU24'],
    [
      'S_TCODE je autorizačný objekt, ktorý povolí spustenie transakcie. Program však vo vnútri kontroluje ďalšie objekty (napr. účtovný okruh, druh dokladu, aktivita). Bez nich používateľ transakciu otvorí, ale nič neurobí. Návrhy dodáva SU24, roly sa skladajú v PFCG a chýbajúcu kontrolu ukáže SU53.',
      'S_TCODE is the authorization object that allows starting a transaction. Inside, the program checks further objects (company code, document type, activity). Without them a user opens the transaction but cannot do anything. SU24 supplies the proposals, roles are built in PFCG, and SU53 shows the missing check.',
    ],
  ),
  q(
    ['Ktorá postupnosť tvorí procure-to-pay?', 'What is the end-to-end procure-to-pay flow?'],
    ['ME51N', 'ME21N', 'MIGO', 'MIRO', 'F110'],
    [
      'Dodávateľ a materiál (BP, MM03) → požiadavka na nákup (ME51N) → objednávka (ME21N) → príjem tovaru (MIGO) → overenie faktúry (MIRO) → platba (F110). Medzi krokmi je trojstranné párovanie: objednávka, príjem a faktúra musia sedieť.',
      'Supplier and material (BP, MM03) → purchase requisition (ME51N) → purchase order (ME21N) → goods receipt (MIGO) → invoice verification (MIRO) → payment (F110). The three-way match ties it together: order, receipt and invoice must agree.',
    ],
  ),
  q(
    ['Aký je rozdiel MIGO vs MIRO?', 'What is the difference between MIGO and MIRO?'],
    ['MIGO', 'MIRO'],
    [
      'MIGO účtuje skladový pohyb: fyzický príjem, výdaj alebo prevod tovaru (materiálový doklad, obvykle aj účtovný). MIRO účtuje dodávateľskú faktúru k objednávke (logistické overenie faktúr). Jedno je tovar, druhé peniaze; spája ich objednávka.',
      'MIGO posts a goods movement: physical receipt, issue or transfer (a material document, usually with an accounting document). MIRO posts the supplier invoice against the purchase order (logistics invoice verification). One is goods, the other money; the purchase order links them.',
    ],
  ),
  q(
    ['Aké sú hlavné stavy SD order-to-cash?', 'What are the main order-to-cash stages?'],
    ['VA01', 'VL01N', 'VL02N', 'VF01', 'F-28'],
    [
      'Odberateľská objednávka (VA01) → dodávka (VL01N) → picking a výdaj tovaru z dodávky (VL02N) → fakturácia (VF01) → prijatá platba (F-28). Tok dokladov vo VA03 ukáže, kde doklad stojí.',
      'Sales order (VA01) → delivery (VL01N) → picking and goods issue from the delivery (VL02N) → billing (VF01) → incoming payment (F-28). The document flow in VA03 shows where a document stands.',
    ],
  ),
  q(
    ['Prečo sa po migrácii z ECC preferuje BP?', 'Why is BP preferred after moving from ECC?'],
    ['BP', 'CVI_COCKPIT', 'XD01', 'XK01'],
    [
      'V S/4HANA je Business Partner jediný vstup pre odberateľov aj dodávateľov; staré XD01/XK01/FD01/FK01 sú legacy. Jeden partner môže mať viac rolí, čo odstraňuje duplicity. Pred konverziou treba v ECC pripraviť CVI synchronizáciu.',
      'In S/4HANA, Business Partner is the single entry point for customers and suppliers; the old XD01/XK01/FD01/FK01 are legacy. One partner can hold several roles, which removes duplicates. Before a conversion, CVI synchronization must be prepared in ECC.',
    ],
  ),
  q(
    ['Čo je nástupcom LTMC?', 'What replaced LTMC?'],
    ['LTMC', 'LTMOM'],
    [
      'Fiori aplikácia Migrate Your Data – Migration Cockpit (app ID F3473); úpravy objektov robí LTMOM. LTMC je deprecated a LSMW sa na nové migrácie do S/4HANA neodporúča.',
      'The Fiori app Migrate Your Data – Migration Cockpit (app ID F3473), with LTMOM for object adjustments. LTMC is deprecated, and LSMW is not recommended for new S/4HANA migrations.',
    ],
  ),
  q(
    ['Ako by si diagnostikoval zaseknutý IDoc?', 'How would you troubleshoot a stuck IDoc?'],
    ['WE02', 'SLG1', 'SMQ1', 'SMQ2', 'SM59', 'BD87'],
    [
      'Zisti číslo IDocu, message type, partnera a čas. Vo WE02 pozri posledný status a chybu; v SLG1 aplikačný log. Ak ide cez qRFC, skontroluj SMQ1/SMQ2 a spojenie v SM59. Až po odstránení príčiny a kontrole duplicity spracuj znova cez BD87.',
      'Get the IDoc number, message type, partner and time. In WE02 read the latest status and error; in SLG1 the application log. If it travels via qRFC, check SMQ1/SMQ2 and the connection in SM59. Only after fixing the cause and checking for duplicates, reprocess with BD87.',
    ],
  ),
  q(
    ['Aký je rozdiel medzi SM58, SMQ1 a SMQ2?', 'How do SM58, SMQ1 and SMQ2 differ?'],
    ['SM58', 'SMQ1', 'SMQ2'],
    [
      'SM58 ukazuje chybné tRFC volania (bez poradia). SMQ1 sú odchádzajúce a SMQ2 prichádzajúce qRFC fronty, kde záleží na poradí: prvá chyba blokuje všetko za ňou.',
      'SM58 shows failed tRFC calls (no ordering). SMQ1 holds outbound and SMQ2 inbound qRFC queues, where order matters: the first error blocks everything behind it.',
    ],
  ),
  q(
    ['Na čo slúžia SPDD a SPAU pri upgrade?', 'What are SPDD and SPAU used for during upgrades?'],
    ['SPDD', 'SPAU', 'SNOTE'],
    [
      'SPDD zladí modifikované DDIC objekty počas upgrade, aby sa nestratili dáta. SPAU po upgrade zladí modifikácie repozitára a SAP Notes (SNOTE) so štandardom. Rozhodnutia sa zachytia do transportu pre ďalšie systémy.',
      'SPDD adjusts modified Dictionary objects during the upgrade so no data is lost. SPAU, after the upgrade, adjusts repository modifications and SAP Notes (SNOTE) to the new standard. Decisions are captured in a transport for the following systems.',
    ],
  ),
  q(
    ['Prečo je transport do PRD proces zmenového riadenia?', 'Why is production transport part of change control?'],
    ['STMS', 'SE09', 'SE10'],
    [
      'Transport mení produkčný systém: kód, customizing aj dáta. Potrebuje test, schválenie, správne poradie a závislosti, plán nasadenia a plán návratu alebo forward-fixu. STMS ukáže, čo a kedy sa importovalo, SE09/SE10 obsah.',
      'A transport changes the production system: code, customizing and sometimes data. It needs testing, approval, correct order and dependencies, a deployment plan and a rollback or forward-fix plan. STMS shows what was imported and when, SE09/SE10 the contents.',
    ],
  ),
  q(
    ['Aké dáta potrebuješ na reconciliation po migrácii?', 'What information is required for post-migration reconciliation?'],
    ['LTMOM', 'FBL3N', 'MB52'],
    [
      'Rozsah dát, business kľúče, časový rez (cut-off) a pravidlá mapovania. Porovnávaj počty, súčty, statusy, referencie a hraničné prípady zdroja a cieľa. Technickú akceptáciu oddel od biznis akceptácie vlastníkmi procesov.',
      'The data scope, business keys, cut-off and mapping rules. Compare counts, totals, statuses, references and edge cases between source and target. Separate technical acceptance from business sign-off by the process owners.',
    ],
  ),
  q(
    ['Aká je úloha ACDOCA pri S/4HANA?', 'What role does ACDOCA play in S/4HANA?'],
    ['FAGLL03', 'FB03'],
    [
      'ACDOCA je Universal Journal: jedna tabuľka položiek pre veľkú časť FI a CO (hlavná kniha, majetok, controlling, materiálové ocenenie). Zjednodušuje reconciliáciu a reporting. Pre integrácie preferuj released CDS pohľady a API, nie priamy prístup.',
      'ACDOCA is the Universal Journal: one line-item table for most of FI and CO (general ledger, assets, controlling, material valuation). It simplifies reconciliation and reporting. For integration, prefer released CDS views and APIs over direct access.',
    ],
  ),
  q(
    ['Čo použiješ namiesto T-kódov v SAP BTP ABAP?', 'What replaces classic T-codes in SAP BTP ABAP?'],
    [],
    [
      'SAP BTP ABAP Environment nemá SAP GUI. Vývoj ide v Eclipse ADT s ABAP Cloud: CDS, RAP, released API a Fiori aplikácie na správu. Klasické T-kódy sa tam nepoužívajú.',
      'SAP BTP ABAP Environment has no SAP GUI. Development happens in Eclipse ADT with ABAP Cloud: CDS, RAP, released APIs, and Fiori apps for administration. Classic T-codes are not used there.',
    ],
  ),
  q(
    ['Aký je rozdiel medzi LT01 a /SCWM/TO_CONF?', 'How do classic WM transfer orders differ from EWM warehouse tasks?'],
    ['LT01', '/SCWM/TO_CONF'],
    [
      'LT01 zakladá transfer order v klasickom LE-WM, ktoré je súčasťou ERP. /SCWM/TO_CONF potvrdzuje warehouse task v EWM, samostatnom skladovom modeli s vlastnými objektmi (warehouse order, HU, fronty) a integráciou cez qRFC.',
      'LT01 creates a transfer order in classic LE-WM, which is part of ERP. /SCWM/TO_CONF confirms a warehouse task in EWM, a separate warehouse model with its own objects (warehouse orders, HUs, queues) and qRFC integration.',
    ],
  ),
  q(
    ['Aké riziká má opätovné spracovanie integrovanej správy?', 'What are the risks of reprocessing an integration message?'],
    ['BD87', 'SMQ2'],
    [
      'Duplicitný doklad, zlé poradie zmien, prepísanie novších dát starými a dopad na nadväzujúce systémy. Preto najprv odstráň príčinu, over idempotenciu a stav cieľa a spracuj najprv jednu správu.',
      'A duplicate document, changes applied in the wrong order, newer data overwritten by older data, and knock-on effects in downstream systems. So fix the cause first, check idempotency and the target state, and reprocess one message first.',
    ],
  ),
  q(
    ['Ako by si prezentoval regresné testy pred cutover?', 'How would you present regression-test readiness before cutover?'],
    [],
    [
      'Rozsah testov podľa kritických procesov, výsledky (prešlo/zlyhalo/blokované), otvorené chyby s dopadom a vlastníkom, rozhodnutia o akceptovanom riziku a jasné go/no-go kritériá podpísané vlastníkmi procesov.',
      'Test scope by critical process, results (passed / failed / blocked), open defects with impact and owner, decisions on accepted risk, and clear go/no-go criteria signed off by the process owners.',
    ],
  ),
  q(
    ['Ako overíš dostupnosť kódu v konkrétnom release?', 'How would you verify a T-code in a specific release?'],
    ['SE93', 'SE16N'],
    [
      'V systéme: SE93 a tabuľka TSTC. Mimo systému: SAP Help pre daný release, Simplification List a Fiori Apps Reference Library. Over aj oprávnenia (S_TCODE) a či nie je k dispozícii modernejšia Fiori aplikácia.',
      'In the system: SE93 and table TSTC. Outside: SAP Help for the release, the Simplification List and the Fiori Apps Reference Library. Also check authorizations (S_TCODE) and whether a more modern Fiori app is available.',
    ],
  ),
];
