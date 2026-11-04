// Curated notes: ABAP, Basis, integration, security and transports.
// Written for T-Coder (not part of the almanac). Conservative by design:
// where to look and what to watch out for, never production procedures.

import { note, type Note } from './note.ts';

export const TECH_NOTES: Record<string, Note> = {
  SE93: note(
    ['Keď potrebuješ zistiť, čo transakcia spúšťa (program, dynpro, parameter) a do akého balíka patrí.', 'When you need to know what a transaction starts (program, screen, parameters) and which package owns it.'],
    [
      ['Zobrazenie stačí; zmena definície je vývojárska úloha s transportom.', 'Display is enough; changing a definition is a developer task with a transport.'],
      ['Parametrické transakcie často volajú SM30 alebo inú transakciu s preddefinovanými hodnotami.', 'Parameter transactions often call SM30 or another transaction with preset values.'],
      ['Z/Y kódy sú zákaznícke; ich význam over u vlastníka.', 'Z/Y codes are customer-defined; confirm their meaning with the owner.'],
    ],
    [['Existencia v SE93 neznamená, že kód je v tvojom release odporúčaný.', 'Existing in SE93 does not mean the code is recommended in your release.']],
    ['V S/4HANA mnohé staré kódy existujú, ale presmerujú alebo ohlásia, že nie sú podporované.', 'In S/4HANA many old codes still exist but redirect or report that they are not supported.'],
  ),
  SE11: note(
    ['Na pochopenie štruktúry tabuliek, pohľadov, dátových elementov a domén.', 'To understand the structure of tables, views, data elements and domains.'],
    [
      ['Záložka Fields a „Where-used“ rýchlo ukáže, kde sa pole používa.', 'The Fields tab and where-used list show quickly where a field is used.'],
      ['Technical settings povedia o bufferovaní a veľkostnej kategórii.', 'Technical settings reveal buffering and size category.'],
    ],
    [['Zmena DDIC objektu v produkcii nie je cesta; ide cez vývoj a transport.', 'Changing a Dictionary object in production is not the way; it goes through development and a transport.']],
    ['V S/4HANA preferuj CDS pohľady a released API; niektoré staré tabuľky sú už len kompatibilné pohľady.', 'In S/4HANA prefer CDS views and released APIs; some old tables are only compatibility views now.'],
  ),
  SE16N: note(
    ['Na rýchle, autorizované prezretie obsahu tabuľky s filtrami.', 'For a quick, authorized look at table contents with filters.'],
    [
      ['Najprv obmedz výber kľúčmi (BUKRS, WERKS, dátum), inak čakáš na milióny riadkov.', 'Restrict by keys first (BUKRS, WERKS, date) or you wait for millions of rows.'],
      ['Technické názvy polí zapni v nastaveniach používateľa.', 'Switch on technical field names in the user settings.'],
      ['Výsledok vieš exportovať, ale rešpektuj ochranu údajov.', 'You can export results, but respect data protection.'],
    ],
    [
      ['Aj čítanie môže sprístupniť citlivé údaje (mzdy, banky); prístup sa loguje a audituje.', 'Even reading can expose sensitive data (payroll, banks); access is logged and audited.'],
      ['Editačný režim je v mnohých systémoch zakázaný z dobrého dôvodu.', 'Edit mode is disabled in many systems for good reason.'],
    ],
    ['Na HANA je SE16H silnejší na agregácie a joiny.', 'On HANA, SE16H is stronger for aggregations and joins.'],
  ),
  SE38: note(
    ['Na zobrazenie, spustenie a (vo vývoji) úpravu ABAP reportov.', 'To display, run and (in development) edit ABAP reports.'],
    [
      ['Na čisté spustenie reportu stačí SA38, ktorý nedovolí editáciu.', 'For running a report only, SA38 is enough and does not allow editing.'],
      ['Varianty ulož pre opakované behy a joby.', 'Save variants for repeated runs and jobs.'],
    ],
    [['Report môže meniť dáta; pred spustením v produkcii zisti, čo robí.', 'A report can change data; find out what it does before running it in production.']],
    ['V ABAP Cloud sa nové vývoje robia v ADT, nie v SE38.', 'In ABAP Cloud, new development happens in ADT, not SE38.'],
  ),
  SE80: note(
    ['Na prehľad balíka: programy, triedy, funkcie a ich súvislosti na jednom mieste.', 'For a package overview: programs, classes, function groups and how they relate, in one place.'],
    [
      ['Strom balíka rýchlo ukáže, čo všetko k aplikácii patrí.', 'The package tree quickly shows everything that belongs to an application.'],
      ['Pre nové vývoje je Eclipse ADT pohodlnejší a v cloude jediný.', 'For new development, Eclipse ADT is more convenient and the only option in the cloud.'],
    ],
    [['Zmeny zachytené v otvorenom requeste môžu nechtiac odísť s cudzím transportom.', 'Changes captured in an open request may leave with someone else’s transport.']],
  ),
  ATC: note(
    ['Pred uvoľnením transportu alebo pri code review; aj pri príprave na S/4 (custom code readiness).', 'Before releasing a transport or in code review; also when preparing for S/4 (custom code readiness).'],
    [
      ['Priority 1 a 2 rieš, priority 3 posúď; výnimky žiadaj s odôvodnením.', 'Fix priority 1 and 2, assess priority 3; request exemptions with a reason.'],
      ['Centrálny ATC systém vie kontrolovať viac systémov jednotne.', 'A central ATC system can check several systems consistently.'],
    ],
    [['Zelený ATC neznamená správnu logiku; je to statická kontrola.', 'A green ATC does not mean the logic is right; it is a static check.']],
    ['Varianty pre S/4HANA readiness ukážu použitie zjednodušených objektov.', 'S/4HANA readiness variants show use of simplified objects.'],
  ),
  ST05: note(
    ['Keď je program pomalý a máš podozrenie na databázu: aké SELECTy, koľko a ako dlho.', 'When a program is slow and you suspect the database: which SELECTs, how many, how long.'],
    [
      ['Trace zapni len pre svojho používateľa a len na čas reprodukcie.', 'Switch the trace on for your user only and only while reproducing.'],
      ['Hľadaj identické SELECTy v slučke a chýbajúce indexy.', 'Look for identical SELECTs in a loop and missing indexes.'],
      ['Okrem SQL vie aj buffer, RFC a enqueue trace.', 'Besides SQL it can trace buffer, RFC and enqueue calls.'],
    ],
    [['Zabudnutý zapnutý trace zaťažuje systém a plní disk.', 'A trace left switched on loads the system and fills the disk.']],
  ),
  SAT: note(
    ['Keď je pomalý ABAP kód (nie DB): ktoré metódy a funkcie žerú čas.', 'When ABAP code is slow (not the database): which methods and functions eat the time.'],
    [
      ['Meraj s agregáciou podľa volaní, potom choď do detailu.', 'Measure with aggregation per call first, then drill down.'],
      ['Porovnaj dva behy pred a po zmene.', 'Compare two runs before and after a change.'],
    ],
    [['Meranie samo spomaľuje; absolútne časy ber s rezervou.', 'Measuring slows things down itself; take absolute times with a grain of salt.']],
  ),
  ST22: note(
    ['Pri každom „programe, ktorý padol“: runtime error, miesto v kóde, používateľ a čas.', 'For every "program that crashed": runtime error, place in the code, user and time.'],
    [
      ['Sekcia „What happened“ a „Error analysis“ zvyčajne povedia príčinu.', 'The "What happened" and "Error analysis" sections usually tell the cause.'],
      ['Filtrovaním podľa dňa a programu nájdeš opakovania.', 'Filter by day and program to find repeats.'],
      ['Názov chyby (TIME_OUT, CONVT_NO_NUMBER…) vlož do našepkávača.', 'Paste the error name (TIME_OUT, CONVT_NO_NUMBER…) into the whisper.'],
    ],
    [['Dumpy sa po čase mažú; dôležité si včas ulož.', 'Dumps are deleted after a while; keep the important ones in time.']],
  ),
  SLG1: note(
    ['Keď aplikácia hlási chybu „do logu“: IDoc spracovanie, migrácie, BP, joby, rozhrania.', 'When an application reports errors "to the log": IDoc processing, migration, BP, jobs, interfaces.'],
    [
      ['Vyber objekt a podobjekt a obmedz čas; inak je výsledok obrovský.', 'Pick object and sub-object and restrict time, or the result is huge.'],
      ['Externé ID často obsahuje číslo dokladu alebo IDocu.', 'The external ID often contains the document or IDoc number.'],
    ],
    [['Nie každá aplikácia píše do SLG1; prázdny log neznamená, že nie je chyba.', 'Not every application writes to SLG1; an empty log does not mean there is no error.']],
  ),
  SM37: note(
    ['Na kontrolu background jobov: stav, log, spool a kedy bežali.', 'To check background jobs: status, log, spool and when they ran.'],
    [
      ['Filtruj podľa mena jobu so * a podľa používateľa *.', 'Filter by job name with * and user *.'],
      ['Job log ukáže prvú chybu; dump nájdeš v ST22 v rovnakom čase.', 'The job log shows the first error; find the dump in ST22 at the same time.'],
    ],
    [['Opakovanie jobu môže spracovať dáta dvakrát; najprv zisti, čo už prebehlo.', 'Repeating a job may process data twice; first find out what already ran.']],
  ),
  SM59: note(
    ['Keď volanie do iného systému zlyháva: test spojenia a prihlásenia RFC používateľa.', 'When a call into another system fails: test the connection and the RFC user logon.'],
    [
      ['Connection test overí sieť; Authorization test aj používateľa a heslo.', 'Connection test checks the network; Authorization test also checks user and password.'],
      ['Typ 3 je ABAP, typ G HTTP k externému serveru, typ H HTTP k ABAP.', 'Type 3 is ABAP, type G is HTTP to an external server, type H is HTTP to ABAP.'],
    ],
    [['Zmena destinácie v produkcii ovplyvní všetky rozhrania, ktoré ju používajú.', 'Changing a destination in production affects every interface that uses it.']],
  ),
  SM12: note(
    ['Pri hláške „locked by user …“: kto drží enqueue zámok a od kedy.', 'For "locked by user …": who holds the enqueue lock and since when.'],
    [
      ['Starý zámok + používateľ neprihlásený (SM04) = podozrivé, ale over SM50 a SM13.', 'Old lock + user not logged on (SM04) = suspicious, but check SM50 and SM13.'],
      ['Názov tabuľky a argument zámku povedia, ktorý doklad je zamknutý.', 'The table name and lock argument tell which document is locked.'],
    ],
    [['Mazanie zámku počas bežiaceho update môže poškodiť dáta.', 'Deleting a lock while an update is running can corrupt data.']],
  ),
  SM21: note(
    ['Na systémové udalosti okolo incidentu: reštarty, chyby DB, problémy s pamäťou.', 'For system events around an incident: restarts, database errors, memory problems.'],
    [
      ['Vždy obmedz čas na okno incidentu.', 'Always restrict the time to the incident window.'],
      ['V novších verziách je log za celý systém, nie len za server.', 'In newer releases the log covers the whole system, not just one server.'],
    ],
    [['Mnoho hlášok je šum; hľadaj tie, ktoré sedia časom.', 'Many entries are noise; look for those that match the time.']],
  ),
  SM50: note(
    ['Keď systém „visí“: ktoré pracovné procesy sú obsadené, kým a v akom programe.', 'When the system "hangs": which work processes are busy, by whom and in which program.'],
    [
      ['Dlho bežiaci dialóg v jednom programe je podozrivý z nekonečnej slučky alebo zlého SELECTu.', 'A long-running dialog step in one program suggests an endless loop or a bad SELECT.'],
      ['SM66 ukáže to isté za všetky servery.', 'SM66 shows the same across all servers.'],
    ],
    [['Ukončenie procesu ruší prácu používateľa; iba podľa postupu.', 'Ending a process cancels a user’s work; only per procedure.']],
  ),
  ST03N: note(
    ['Na obraz záťaže: časy odozvy podľa transakcie, používateľa a typu úlohy.', 'For the workload picture: response times by transaction, user and task type.'],
    [
      ['Porovnaj „dobrý“ a „zlý“ deň, nie jeden údaj.', 'Compare a "good" and a "bad" day, not a single figure.'],
      ['DB čas vs. CPU čas ukáže, kde hľadať ďalej.', 'Database time vs CPU time shows where to look next.'],
    ],
    [['Priemery skrývajú výkyvy; pozri aj maximá.', 'Averages hide peaks; look at the maximums too.']],
  ),
  STAD: note(
    ['Na štatistiku jednej konkrétnej požiadavky: kto, kedy, koľko DB, CPU a RFC času.', 'For the statistics of one specific request: who, when, how much DB, CPU and RFC time.'],
    [
      ['Hľadaj podľa používateľa a presného času incidentu.', 'Search by user and the exact incident time.'],
      ['Veľký RFC čas posiela hľadanie do iného systému.', 'Large RFC time sends the search to another system.'],
    ],
    [['Štatistiky sa po čase agregujú a strácajú detail.', 'Statistics are aggregated over time and lose detail.']],
  ),
  SM58: note(
    ['Keď tRFC volania zlyhali alebo visia: cieľ, chyba a čas.', 'When tRFC calls failed or hang: target, error and time.'],
    [
      ['Text chyby často odkáže na SM59 alebo oprávnenie RFC používateľa.', 'The error text often points to SM59 or the RFC user’s authorization.'],
      ['Rovnaký cieľ v mnohých záznamoch = problém spojenia, nie dát.', 'The same target in many entries = a connection problem, not data.'],
    ],
    [['Opätovné spustenie môže zopakovať biznis operáciu.', 'Re-executing can repeat a business operation.']],
  ),
  SMQ1: note(
    ['Pri odchádzajúcich qRFC frontách (napr. ERP → EWM, CRM, BW): čo visí a prečo.', 'For outbound qRFC queues (e.g. ERP → EWM, CRM, BW): what is stuck and why.'],
    [
      ['Prvý záznam s chybou (SYSFAIL) blokuje celú frontu za ním.', 'The first entry in error (SYSFAIL) blocks the whole queue behind it.'],
      ['Detail chyby často nájdeš v cieľovom systéme.', 'The error details are often in the target system.'],
    ],
    [['Mazanie záznamu z fronty znamená stratenú správu; iba so schválením.', 'Deleting a queue entry means a lost message; only with approval.']],
  ),
  SMQ2: note(
    ['Pri prichádzajúcich qRFC frontách: správy prišli, ale nespracovali sa.', 'For inbound qRFC queues: messages arrived but were not processed.'],
    [
      ['Status READY dlho bez pohybu môže znamenať neregistrovaný plánovač (SMQR).', 'Status READY for long without progress may mean an unregistered scheduler (SMQR).'],
      ['Dvojklik na chybu otvorí dôvod; často dump alebo aplikačná chyba.', 'Double-click the error to see the reason; often a dump or an application error.'],
    ],
    [['Poradie správ je dôležité; preskočenie môže rozbiť konzistenciu.', 'Message order matters; skipping one can break consistency.']],
  ),
  WE02: note(
    ['Na zobrazenie IDocu: kontrolný záznam, segmenty a história statusov.', 'To display an IDoc: control record, segments and status history.'],
    [
      ['Najnovší status hore; aplikačná chyba je v jeho texte.', 'The latest status is on top; the application error is in its text.'],
      ['Status 51 = aplikácia nespracovala, 03 = odoslaný na port, 53 = zaúčtovaný.', 'Status 51 = application did not post, 03 = passed to port, 53 = posted.'],
    ],
    [['Úprava dát IDocu v produkcii je zásah do dôkazu; iba podľa postupu.', 'Editing IDoc data in production tampers with evidence; only per procedure.']],
  ),
  BD87: note(
    ['Na opätovné spracovanie IDocov podľa statusu, keď je príčina odstránená.', 'To reprocess IDocs by status once the root cause is fixed.'],
    [
      ['Najprv vyber jeden IDoc a over výsledok, až potom hromadne.', 'Reprocess one IDoc first and check the result, then the rest.'],
      ['Strom statusov ukáže, koľko IDocov a akého typu čaká.', 'The status tree shows how many IDocs of which type are waiting.'],
    ],
    [
      ['Opakované spracovanie môže vytvoriť duplicitný doklad.', 'Reprocessing can create a duplicate document.'],
      ['Bez odstránenia príčiny len vyrobíš nové chyby.', 'Without fixing the cause you only produce new errors.'],
    ],
  ),
  SU53: note(
    ['Hneď po hláške „nemáte oprávnenie“: ktorý objekt a hodnoty chýbali.', 'Right after a "no authorization" message: which object and values were missing.'],
    [
      ['Používateľ ho má spustiť hneď, v tej istej session.', 'The user should run it immediately, in the same session.'],
      ['Ako admin vieš zobraziť SU53 iného používateľa.', 'As an admin you can display another user’s SU53.'],
    ],
    [['Ukazuje len poslednú neúspešnú kontrolu; viac povie STAUTHTRACE.', 'It shows only the last failed check; STAUTHTRACE tells more.']],
  ),
  PFCG: note(
    ['Na návrh a údržbu rolí: menu, oprávnenia a priradení používatelia.', 'To design and maintain roles: menu, authorizations and assigned users.'],
    [
      ['Transakcia v menu roly prináša návrhy z SU24.', 'A transaction in the role menu brings its proposals from SU24.'],
      ['Po zmene oprávnení vygeneruj profil a porovnaj používateľov.', 'After changing authorizations, generate the profile and compare users.'],
    ],
    [['Ručne pridané „manuálne“ hodnoty sa ťažko udržiavajú a obchádzajú SU24.', 'Manually added values are hard to maintain and bypass SU24.']],
    ['Fiori prístup sa rieši katalógmi a skupinami priradenými v roli.', 'Fiori access is granted through catalogs and groups assigned in the role.'],
  ),
  SE09: note(
    ['Na workbench requesty: obsah, úlohy, uvoľnenie a história.', 'For workbench requests: contents, tasks, release and history.'],
    [
      ['Úlohy sa uvoľňujú pred requestom; request ide ďalej až po uvoľnení.', 'Tasks are released before the request; the request moves on only once released.'],
      ['Objekt zamknutý v inom requeste ukáže, kto na ňom pracuje.', 'An object locked in another request shows who is working on it.'],
    ],
    [['Uvoľnený request sa nedá „vrátiť“; oprava ide novým transportom.', 'A released request cannot be "taken back"; a fix goes in a new transport.']],
  ),
  STMS: note(
    ['Na transportnú krajinu a importné fronty: čo kam odišlo a s akým výsledkom.', 'For the transport landscape and import queues: what went where and with what result.'],
    [
      ['Návratový kód 0 a 4 sú v poriadku, 8 a viac znamená chybu.', 'Return codes 0 and 4 are fine, 8 and above mean an error.'],
      ['Log importu ukáže fázu (DDIC, main import, after-import metódy).', 'The import log shows the phase (DDIC, main import, after-import methods).'],
    ],
    [['Import mimo poradia môže prepísať novšiu verziu staršou.', 'Importing out of order can overwrite a newer version with an older one.']],
  ),
  SPDD: note(
    ['Počas upgrade alebo konverzie: zladenie modifikovaných DDIC objektov pred aktiváciou.', 'During an upgrade or conversion: adjust modified Dictionary objects before activation.'],
    [
      ['Rozhodnutia ulož do transportu pre ďalšie systémy.', 'Record decisions in a transport for the following systems.'],
      ['Návrat k štandardu je často najlepšia voľba.', 'Returning to standard is often the best choice.'],
    ],
    [['Zlé rozhodnutie môže zmazať údaje v zákazníckych poliach.', 'A wrong decision can wipe data in customer fields.']],
  ),
  SPAU: note(
    ['Po upgrade: zladenie modifikácií repozitára a SAP Notes so štandardom.', 'After an upgrade: adjust repository modifications and SAP Notes to the standard.'],
    [
      ['Notes, ktoré sú už v novom SP, stačí resetovať.', 'Notes already contained in the new SP can simply be reset.'],
      ['Spolupracuj s vlastníkmi modifikácií; nie všetky sú ešte potrebné.', 'Work with the modification owners; not all are still needed.'],
    ],
    [['Neukončené SPAU nechá objekty v nekonzistentnom stave.', 'Unfinished SPAU leaves objects inconsistent.']],
  ),
  WE05: note(
    ['Na zoznam IDocov podľa času, typu, partnera a statusu.', 'For an IDoc list by time, type, partner and status.'],
    [
      ['Užitočné na otázku „vznikol vôbec nejaký IDoc?“.', 'Useful for "was any IDoc created at all?".'],
      ['Strom podľa statusu rýchlo ukáže, kde je väčšina chýb.', 'The status tree quickly shows where most errors are.'],
    ],
    [['Archivované IDocy tu nemusia byť.', 'Archived IDocs may not appear here.']],
  ),
  WE20: note(
    ['Keď IDoc nevznikne alebo ide zle: partnerský profil, message type a spôsob spracovania.', 'When an IDoc is not created or goes wrong: partner profile, message type and processing mode.'],
    [
      ['Outbound: port a režim (okamžite / zbierať); inbound: procesný kód.', 'Outbound: port and mode (immediately / collect); inbound: process code.'],
      ['Partner type LS = logický systém, KU/LI = odberateľ/dodávateľ.', 'Partner type LS = logical system, KU/LI = customer/vendor.'],
    ],
    [['Zmena v produkcii ovplyvní každý budúci IDoc partnera.', 'A change in production affects every future IDoc of the partner.']],
  ),
  WE21: note(
    ['Na kontrolu portu IDocu: tRFC port, RFC destinácia alebo súbor.', 'To check the IDoc port: tRFC port, RFC destination or file.'],
    [
      ['tRFC port odkazuje na SM59; test rob tam.', 'A tRFC port points to SM59; test there.'],
      ['Súborový port potrebuje platnú cestu na serveri (AL11).', 'A file port needs a valid path on the server (AL11).'],
    ],
    [['Jeden port môže zdieľať viac partnerov.', 'Several partners may share one port.']],
  ),
  ST12: note(
    ['Keď chceš ABAP aj SQL trace naraz, napr. na pomalý job alebo transakciu.', 'When you want ABAP and SQL traces together, e.g. for a slow job or transaction.'],
    [
      ['Dostupnosť závisí od systému; nie je všade.', 'Availability depends on the system; it is not everywhere.'],
      ['Vie tracovať aj iného používateľa alebo background job.', 'It can trace another user or a background job.'],
    ],
    [['Dlhý trace má veľký objem; obmedz scenár.', 'A long trace is large; keep the scenario short.']],
  ),
  STAUTHTRACE: note(
    ['Keď SU53 nestačí: zaznamenaj všetky kontroly oprávnení počas scenára.', 'When SU53 is not enough: record every authorization check during a scenario.'],
    [
      ['Zapni pre jedného používateľa, zopakuj scenár, vypni.', 'Switch on for one user, repeat the scenario, switch off.'],
      ['Filter na „neúspešné“ ukáže všetky chýbajúce hodnoty naraz.', 'Filtering on "failed" shows all missing values at once.'],
    ],
    [['Trace ukazuje kontroly, nie biznis súhlas; o pridelení rozhoduje vlastník roly.', 'The trace shows checks, not business approval; the role owner decides what to grant.']],
  ),
  SUIM: note(
    ['Na otázky typu „kto má rolu X“, „kto môže spustiť Y“, „kedy sa rola zmenila“.', 'For questions like "who has role X", "who can run Y", "when did a role change".'],
    [
      ['Reporty podľa transakcie a autorizačného objektu sú najčastejšie.', 'Reports by transaction and by authorization object are the most used.'],
      ['Zmenové doklady ukážu históriu používateľov a rolí.', 'Change documents show the history of users and roles.'],
    ],
    [['Výsledok závisí od zadaných hodnôt; prázdne polia znamenajú „všetko“.', 'Results depend on the values entered; empty fields mean "everything".']],
  ),
  SU24: note(
    ['Na návrhové hodnoty oprávnení, ktoré transakcia prinesie do roly v PFCG.', 'For the authorization proposals a transaction brings into a role in PFCG.'],
    [
      ['Dobré SU24 hodnoty šetria ručnú prácu v každej roli.', 'Good SU24 values save manual work in every role.'],
      ['Po zmene SU24 treba roly v PFCG zladiť.', 'After changing SU24, roles in PFCG need to be merged.'],
    ],
    [['Zmena návrhov ovplyvní všetky roly s danou transakciou.', 'Changing proposals affects every role with that transaction.']],
  ),
  SE10: note(
    ['Na customizing requesty, ktoré vznikajú v SPRO/SM30.', 'For customizing requests created from SPRO/SM30.'],
    [
      ['Customizing je často klientsky závislý; over cieľový klient.', 'Customizing is often client-dependent; check the target client.'],
      ['Obsah requestu povie, ktoré tabuľky a kľúče sa menia.', 'The request contents show which tables and keys change.'],
    ],
    [['Zabudnutý záznam v requeste prenesie aj nechcenú zmenu.', 'A forgotten entry in a request carries an unwanted change too.']],
  ),
};
