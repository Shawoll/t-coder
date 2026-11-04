// Curated notes: MM, SD, FI/CO, PP, EWM and migration.
// Written for T-Coder (not part of the almanac). Conservative by design:
// where to look and what to watch out for, never production procedures.

import { note, type Note } from './note.ts';

export const BUSINESS_NOTES: Record<string, Note> = {
  // ── MM: materials and purchasing ───────────────────────────────
  MM03: note(
    ['Na kontrolu kmeňa materiálu: pohľady, závodné a skladové údaje, MRP a účtovanie.', 'To check the material master: views, plant and storage data, MRP and accounting.'],
    [
      ['Pri výbere pohľadov zadaj závod a sklad, inak neuvidíš závodné údaje.', 'Enter plant and storage location when choosing views, or plant data stays hidden.'],
      ['Zmenové doklady ukážu, kto a kedy kmeň menil.', 'Change documents show who changed the master and when.'],
    ],
    [['Chýbajúci pohľad pre závod je častá príčina „materiál neexistuje“.', 'A missing plant view is a common cause of "material does not exist".']],
  ),
  ME23N: note(
    ['Na zobrazenie nákupnej objednávky: položky, ceny, história príjmov a faktúr.', 'To display a purchase order: items, prices, receipt and invoice history.'],
    [
      ['Záložka história položky ukáže GR a IR na jednom mieste.', 'The item history tab shows goods receipts and invoice receipts together.'],
      ['Stav uvoľnenia povie, či objednávka vôbec mohla odísť.', 'The release status tells whether the order could be sent at all.'],
    ],
    [['Ceny v PO a vo faktúre sa môžu líšiť jednotkou alebo menou.', 'PO and invoice prices may differ by unit or currency.']],
  ),
  ME2N: note(
    ['Na zoznam nákupných objednávok podľa čísla, dátumu, nákupnej skupiny či statusu.', 'For a list of purchase orders by number, date, purchasing group or status.'],
    [
      ['Rozsah výberu (napr. WE101 = otvorené na príjem) šetrí čas.', 'Selection parameters (e.g. WE101 = open for receipt) save time.'],
      ['ME2L a ME2M dajú rovnaký pohľad podľa dodávateľa a materiálu.', 'ME2L and ME2M give the same view by supplier and by material.'],
    ],
    [['Bez obmedzenia dátumu môže výber bežať veľmi dlho.', 'Without a date restriction the selection can run for a long time.']],
  ),
  MIGO: note(
    ['Na skladové pohyby: príjem k objednávke, výdaj, prevod aj storno.', 'For goods movements: receipt against a PO, issue, transfer and reversal.'],
    [
      ['Druh pohybu (101, 201, 261, 311…) určuje význam, nie samotná transakcia.', 'The movement type (101, 201, 261, 311…) defines the meaning, not the transaction.'],
      ['Najprv „Check“, potom „Post“; hlášky ukážu, čo chýba.', 'Use "Check" before "Post"; the messages show what is missing.'],
      ['Zobrazenie materiálového dokladu tiež cez MIGO (A04).', 'Display a material document through MIGO too (A04).'],
    ],
    [['Storno pohybu má účtovný dopad a môže ovplyvniť faktúru.', 'Reversing a movement has accounting impact and can affect the invoice.']],
    ['Nahrádza historické MB01/MB1A/MB1B/MB1C; v S/4 sú pohyby v MATDOC.', 'Replaces the historic MB01/MB1A/MB1B/MB1C; in S/4 movements live in MATDOC.'],
  ),
  MMBE: note(
    ['Na rýchly prehľad zásoby materiálu podľa závodu, skladu, šarže a typu zásoby.', 'For a quick view of material stock by plant, storage location, batch and stock type.'],
    [
      ['Rozlišuj voľnú, kontrolnú (QM) a blokovanú zásobu.', 'Tell unrestricted, quality-inspection and blocked stock apart.'],
      ['Detail ukáže aj zásobu na ceste a rezervácie.', 'The detail also shows stock in transit and reservations.'],
    ],
    [['MMBE ukazuje IM stav; EWM môže mať v detaile iný obraz.', 'MMBE shows the IM view; EWM may tell a different detailed story.']],
  ),
  MB51: note(
    ['Na zoznam materiálových dokladov: čo sa so zásobou dialo a kedy.', 'For a list of material documents: what happened to the stock and when.'],
    [
      ['Filtruj podľa materiálu, závodu a druhu pohybu.', 'Filter by material, plant and movement type.'],
      ['Dvojklik otvorí doklad a z neho účtovný doklad.', 'Double-click opens the document and from there the accounting document.'],
    ],
    [['Veľký časový rozsah bez materiálu môže zaťažiť systém.', 'A wide date range without a material can load the system.']],
  ),
  MIRO: note(
    ['Na zaúčtovanie dodávateľskej faktúry k objednávke (logistické overenie faktúr).', 'To post a supplier invoice against a purchase order (logistics invoice verification).'],
    [
      ['Pred účtovaním skontroluj „Balance“ a návrh položiek z PO.', 'Before posting, check the balance and the items proposed from the PO.'],
      ['Odchýlky nad toleranciu vytvoria blokáciu platby.', 'Variances above tolerance create a payment block.'],
    ],
    [['Faktúra k nesprávnej PO položke rozbije trojstranné párovanie.', 'An invoice against the wrong PO item breaks the three-way match.']],
    ['V S/4 existujú aj Fiori aplikácie pre dodávateľské faktúry.', 'S/4 also offers Fiori apps for supplier invoices.'],
  ),
  VA03: note(
    ['Na zobrazenie odberateľskej objednávky: položky, stav, bloky a tok dokladov.', 'To display a sales order: items, status, blocks and document flow.'],
    [
      ['Tok dokladov (document flow) ukáže dodávky, faktúry a FI doklady.', 'The document flow shows deliveries, billing and FI documents.'],
      ['Neúplnosť (incompletion log) vysvetlí, prečo doklad nejde ďalej.', 'The incompletion log explains why the document cannot go further.'],
    ],
    [['Blok na hlavičke a na položke sú rôzne veci.', 'A header block and an item block are different things.']],
  ),
  VL03N: note(
    ['Na zobrazenie výstupnej dodávky: picking, výdaj tovaru a tok dokladov.', 'To display an outbound delivery: picking, goods issue and document flow.'],
    [
      ['Status prehľad ukáže picking, balenie a goods issue.', 'The status overview shows picking, packing and goods issue.'],
      ['Ak je EWM aktívne, detail úloh hľadaj v /SCWM/MON.', 'If EWM is active, look for task details in /SCWM/MON.'],
    ],
    [['Zmena sa robí vo VL02N, nie v zobrazení.', 'Changes go through VL02N, not the display.']],
  ),
  VF03: note(
    ['Na zobrazenie fakturačného dokladu a jeho prenosu do účtovníctva.', 'To display a billing document and its transfer to accounting.'],
    [
      ['Tlačidlo účtovné doklady ukáže FI, CO a ďalšie doklady.', 'The accounting button shows FI, CO and further documents.'],
      ['Status „nezaúčtované“ často znamená chybu v účtovnom priradení.', 'Status "not posted" often means an account-determination error.'],
    ],
    [['Storno faktúry ide cez VF11, nie úpravou dokladu.', 'Cancel a billing document with VF11, not by editing it.']],
  ),
  BP: note(
    ['Na kmeňové údaje obchodných partnerov: odberatelia, dodávatelia, kontakty, banky.', 'For business partner master data: customers, suppliers, contacts, banks.'],
    [
      ['BP role (napr. FLCU01, FLVN01) určujú, aké údaje partner má.', 'BP roles (e.g. FLCU01, FLVN01) decide which data a partner has.'],
      ['Výber role pri otvorení ukáže správne záložky.', 'Choosing the role when opening shows the right tabs.'],
    ],
    [['Chýbajúca rola alebo nesynchronizovaný CVI = partner „neexistuje“ v SD/FI.', 'A missing role or out-of-sync CVI = partner "does not exist" in SD/FI.']],
    ['V S/4HANA je BP strategický vstup; XD01/XK01/FD01/FK01 sú legacy.', 'In S/4HANA, BP is the strategic entry; XD01/XK01/FD01/FK01 are legacy.'],
  ),
  '/SCWM/MON': note(
    ['Na centrálny pohľad na EWM sklad: úlohy, objednávky, zásoby, dodávky a alerty.', 'For the central view of an EWM warehouse: tasks, orders, stock, deliveries and alerts.'],
    [
      ['Začni zadaním skladu a monitora; strom vľavo vedie k objektom.', 'Start with warehouse and monitor; the tree on the left leads to objects.'],
      ['Uložené výbery (variants) šetria čas pri opakovaných kontrolách.', 'Saved selections (variants) save time on repeated checks.'],
    ],
    [['Monitor umožňuje aj akcie; nie každé tlačidlo je len na čítanie.', 'The monitor allows actions too; not every button is read-only.']],
  ),
  MIR4: note(
    ['Na zobrazenie logistickej faktúry: položky, odchýlky, blokácie a účtovný doklad.', 'To display a logistics invoice: items, variances, blocks and the accounting document.'],
    [
      ['Následné doklady ukážu FI doklad a jeho stav platby.', 'Follow-on documents show the FI document and its payment status.'],
      ['Porovnaj položky s históriou PO v ME23N.', 'Compare items with the PO history in ME23N.'],
    ],
    [['Zobrazenie neodblokuje platbu; to rieši MRBR podľa pravidiel.', 'Display does not release payment; MRBR does that, per the rules.']],
  ),
  MRBR: note(
    ['Na prehľad a uvoľnenie faktúr blokovaných pre odchýlky ceny, množstva či dátumu.', 'To review and release invoices blocked for price, quantity or date variances.'],
    [
      ['Spusti najprv bez uvoľnenia a pozri dôvody blokov.', 'Run it first without releasing and look at the block reasons.'],
      ['Automatické uvoľnenie zruší blok, keď odchýlka zmizla (napr. po príjme).', 'Automatic release removes the block once the variance is gone (e.g. after receipt).'],
    ],
    [['Ručné uvoľnenie je obchodné rozhodnutie, nie technická oprava.', 'Manual release is a business decision, not a technical fix.']],
  ),
  VL06O: note(
    ['Na monitor výstupných dodávok: čo čaká na picking, potvrdenie a výdaj.', 'For the outbound delivery monitor: what waits for picking, confirmation and goods issue.'],
    [
      ['Výber podľa dátumu a skladového čísla dá rýchly zoznam problémov.', 'Selecting by date and warehouse number gives a quick list of issues.'],
      ['Hromadné akcie sú možné; najprv over na jednej dodávke.', 'Mass actions are possible; check on one delivery first.'],
    ],
    [['Hromadný výdaj tovaru je ťažko vratný.', 'Mass goods issue is hard to undo.']],
  ),
  MB52: note(
    ['Na zoznam zásob v závode a na skladoch, aj s hodnotou.', 'For a list of stock on hand per plant and storage location, including value.'],
    [
      ['Užitočné na porovnanie s EWM alebo inventúrou.', 'Useful for comparing with EWM or a physical count.'],
      ['Prepínač „nulové zásoby“ ich skryje alebo ukáže.', 'The "zero stock" switch hides or shows them.'],
    ],
    [['Je to súčasný stav; na minulý dátum použi MB5B.', 'It is the current state; for a past date use MB5B.']],
  ),
  CS03: note(
    ['Na zobrazenie kusovníka: komponenty, množstvá a platnosť.', 'To display a bill of material: components, quantities and validity.'],
    [
      ['Dátum platnosti a alternatíva rozhodujú, ktorý kusovník sa použije.', 'Validity date and alternative decide which BOM is used.'],
      ['CS11 ukáže rozpad do ďalšej úrovne.', 'CS11 shows the explosion to the next level.'],
    ],
    [['Iný kusovník v príkaze ako v CS03 môže znamenať, že príkaz vznikol pred zmenou.', 'A different BOM in the order than in CS03 may mean the order predates the change.']],
  ),
  CO03: note(
    ['Na zobrazenie výrobného príkazu: stav, komponenty, operácie a náklady.', 'To display a production order: status, components, operations and costs.'],
    [
      ['Systémové statusy (REL, CNF, TECO, DLV) povedia, kde príkaz je.', 'System statuses (REL, CNF, TECO, DLV) tell where the order is.'],
      ['Prehľad komponentov ukáže chýbajúce diely.', 'The component overview shows missing parts.'],
    ],
    [['TECO príkaz už neprijíma bežné potvrdenia.', 'A TECO order no longer accepts normal confirmations.']],
  ),
  CO11N: note(
    ['Na potvrdenie operácie výrobného príkazu: množstvá, časy a pohyby.', 'To confirm a production order operation: quantities, times and movements.'],
    [
      ['Pohyby tovaru (backflush) sa môžu vytvoriť automaticky.', 'Goods movements (backflush) may be created automatically.'],
      ['Chybné pohyby skontroluj v COOIS / COGI.', 'Check failed movements in COOIS / COGI.'],
    ],
    [['Storno potvrdenia môže stornovať aj pohyby.', 'Cancelling a confirmation may also reverse movements.']],
  ),
  MD04: note(
    ['Na aktuálny obraz zásob a potrieb materiálu: kto čo potrebuje a kedy.', 'For the current stock and requirements picture: who needs what and when.'],
    [
      ['Výnimky (exception messages) ukážu oneskorenia a nedostatky.', 'Exception messages show delays and shortages.'],
      ['Dvojklik na prvok vedie na príslušný doklad.', 'Double-click an element to reach its document.'],
    ],
    [['MD04 je živý stav; MD05 ukáže výsledok posledného MRP behu.', 'MD04 is live; MD05 shows the result of the last MRP run.']],
  ),
  '/SCWM/ERP_STOCKCHECK': note(
    ['Keď sa zásoby v ERP a EWM nezhodujú a hľadáš rozdiely.', 'When ERP and EWM stock disagree and you are looking for the differences.'],
    [
      ['Porovnávaj rovnaký závod, sklad, typ zásoby a jednotku.', 'Compare the same plant, storage location, stock type and unit.'],
      ['Najprv skontroluj fronty SMQ1/SMQ2; rozdiel môže byť len „na ceste“.', 'Check SMQ1/SMQ2 first; the difference may just be "in transit".'],
    ],
    [['Opravné pohyby bez root cause zakryjú problém.', 'Correction postings without a root cause hide the problem.']],
  ),
  '/SCWM/PRDI': note(
    ['Na prichádzajúcu dodávku v EWM: stav, položky, úlohy na vyskladnenie a príjem.', 'For an inbound delivery in EWM: status, items, putaway tasks and receipt.'],
    [
      ['Statusy ukážu, či je príjem zaúčtovaný a zaskladnený.', 'Statuses show whether receipt is posted and put away.'],
      ['Porovnaj s príjemkou v ERP (VL33N).', 'Compare with the inbound delivery in ERP (VL33N).'],
    ],
    [['Zmeny v EWM sa propagujú do ERP cez fronty.', 'Changes in EWM propagate to ERP through queues.']],
  ),
  '/SCWM/PRDO': note(
    ['Na odchádzajúcu dodávku v EWM: picking, balenie a výdaj.', 'For an outbound delivery order in EWM: picking, packing and goods issue.'],
    [
      ['Statusy hovoria, kde dodávka uviazla.', 'Statuses tell where the delivery is stuck.'],
      ['Úlohy a vlny nájdeš cez /SCWM/MON.', 'Find tasks and waves through /SCWM/MON.'],
    ],
    [['Výdaj v EWM musí prejsť aj do ERP; over fronty.', 'Goods issue in EWM must also reach ERP; check the queues.']],
  ),
  ME51N: note(
    ['Na založenie požiadavky na nákup, prvého kroku procure-to-pay.', 'To create a purchase requisition, the first step of procure-to-pay.'],
    [
      ['Účtovné priradenie (K, F…) určí, kam pôjdu náklady.', 'The account assignment (K, F…) decides where costs go.'],
      ['Stratégia uvoľnenia môže požiadavku zastaviť pred objednávkou.', 'A release strategy may stop the requisition before ordering.'],
    ],
    [['Duplicitné požiadavky vedú k dvojitým objednávkam.', 'Duplicate requisitions lead to double orders.']],
  ),
  ME21N: note(
    ['Na založenie nákupnej objednávky, často z požiadavky alebo zmluvy.', 'To create a purchase order, often from a requisition or contract.'],
    [
      ['Prevzatie z požiadavky zachová účtovné priradenie.', 'Adopting from a requisition keeps the account assignment.'],
      ['Infozáznam (ME13) a zmluva dodajú cenu automaticky.', 'The info record (ME13) and contract supply the price automatically.'],
    ],
    [['Objednávka môže po uložení automaticky odísť dodávateľovi.', 'An order may be sent to the supplier automatically on save.']],
  ),
  F110: note(
    ['Na automatický platobný program: návrh, kontrola a platba otvorených položiek.', 'For the automatic payment program: proposal, review and payment of open items.'],
    [
      ['Vždy najprv návrh a jeho log; výnimky ukážu, čo sa nezaplatí a prečo.', 'Always run the proposal and its log first; exceptions show what will not be paid and why.'],
      ['Parametre (dátum, okruhy, metódy) ulož pod jasným ID behu.', 'Save the parameters (date, company codes, methods) under a clear run ID.'],
    ],
    [['Platobný beh posiela peniaze; ostrý beh len podľa schváleného procesu.', 'A payment run sends money; live runs only per the approved process.']],
  ),
  VA01: note(
    ['Na založenie odberateľskej objednávky, začiatku order-to-cash.', 'To create a sales order, the start of order-to-cash.'],
    [
      ['Druh dokladu (napr. OR) určí ďalší tok: dodávka, fakturácia.', 'The document type (e.g. OR) decides the flow: delivery, billing.'],
      ['ATP kontrola ukáže, kedy je tovar dostupný.', 'The ATP check shows when the goods are available.'],
    ],
    [['Kreditná kontrola môže objednávku zablokovať až po uložení.', 'A credit check may block the order only after saving.']],
  ),
  VL01N: note(
    ['Na vytvorenie výstupnej dodávky k objednávke.', 'To create an outbound delivery for a sales order.'],
    [
      ['Dátum výberu musí pokryť termín dodávky v objednávke.', 'The selection date must cover the delivery date of the order.'],
      ['Hromadne sa dodávky vytvárajú cez zoznam pripravených na dodanie.', 'Deliveries are created in bulk from the due list.'],
    ],
    [['Chýbajúca zásoba alebo blok dodávky zastaví vytvorenie.', 'Missing stock or a delivery block stops creation.']],
  ),
  VL02N: note(
    ['Na zmenu dodávky: picking, balenie a hlavne zaúčtovanie výdaja tovaru (PGI).', 'To change a delivery: picking, packing and, above all, posting goods issue (PGI).'],
    [
      ['PGI z dodávky je bežná cesta v O2C; MIGO nie je univerzálna náhrada.', 'PGI from the delivery is the normal O2C path; MIGO is not a universal replacement.'],
      ['Log chýb pri PGI povie, čo chýba (picking, zásoba, obdobie).', 'The PGI error log says what is missing (picking, stock, period).'],
    ],
    [['Storno výdaja (VL09) má účtovný dopad.', 'Reversing goods issue (VL09) has accounting impact.']],
  ),
  VF01: note(
    ['Na vytvorenie faktúry z dodávky alebo objednávky.', 'To create a billing document from a delivery or order.'],
    [
      ['Hromadne sa fakturuje cez VF04 (billing due list).', 'Bulk billing runs through VF04 (billing due list).'],
      ['Po uložení over prenos do účtovníctva.', 'After saving, check the transfer to accounting.'],
    ],
    [['Chyba účtovného určenia nechá faktúru nezaúčtovanú.', 'An account-determination error leaves the billing document unposted.']],
  ),
  'F-28': note(
    ['Na zaúčtovanie prijatej platby od odberateľa a vyrovnanie otvorených položiek.', 'To post an incoming customer payment and clear open items.'],
    [
      ['Výber otvorených položiek podľa sumy alebo čísla dokladu ušetrí čas.', 'Selecting open items by amount or document number saves time.'],
      ['Rozdiely rieš podľa pravidiel tolerancie a zostatkových položiek.', 'Handle differences per tolerance and residual-item rules.'],
    ],
    [['Chybné vyrovnanie treba rozviazať (FBRA) a stornovať.', 'A wrong clearing has to be reset (FBRA) and reversed.']],
    ['V S/4 sa platby často spracúvajú cez bankové výpisy a Fiori aplikácie.', 'In S/4, payments are often processed through bank statements and Fiori apps.'],
  ),
  MD61: note(
    ['Na zadanie plánovaných nezávislých potrieb (dopytu), ktoré poháňajú MRP.', 'To enter planned independent requirements (demand) that drive MRP.'],
    [
      ['Verzia potreby a jej aktivita rozhodujú, či MRP potrebu vidí.', 'The requirements version and its active flag decide whether MRP sees it.'],
      ['Skontroluj ich v MD63 alebo MD04.', 'Check them in MD63 or MD04.'],
    ],
    [['Duplicitné potreby zdvoja plánovanú výrobu.', 'Duplicate requirements double the planned production.']],
  ),
  MD01N: note(
    ['Na MRP Live beh v S/4HANA: plánovanie materiálov pre závody.', 'For an MRP Live run in S/4HANA: material planning for plants.'],
    [
      ['Pred ostrým behom over rozsah materiálov a závodov.', 'Check the material and plant scope before a live run.'],
      ['Výsledok skontroluj v MD04 a MD05.', 'Check the result in MD04 and MD05.'],
    ],
    [['Celozávodný beh v pracovnom čase môže zaťažiť systém aj používateľov.', 'A full plant run during work hours can load the system and users.']],
    ['MRP Live beží na HANA; klasické MD01 je v S/4 obmedzené.', 'MRP Live runs on HANA; classic MD01 is restricted in S/4.'],
  ),
  MD11: note(
    ['Na ručné založenie plánovanej objednávky.', 'To create a planned order manually.'],
    [
      ['Plánované objednávky väčšinou vytvára MRP; ručné sú výnimka.', 'MRP usually creates planned orders; manual ones are the exception.'],
      ['Konverzia na výrobný príkaz ide cez CO40/CO41 alebo MD04.', 'Conversion to a production order goes through CO40/CO41 or MD04.'],
    ],
    [['Ďalší beh MRP môže ručnú objednávku zmeniť, ak nie je fixovaná.', 'The next MRP run may change a manual order unless it is firmed.']],
  ),
  CO01: note(
    ['Na založenie výrobného príkazu, často z plánovanej objednávky.', 'To create a production order, often from a planned order.'],
    [
      ['Po uvoľnení (REL) sa dá potvrdzovať a vydávať materiál.', 'Once released (REL), it can be confirmed and materials issued.'],
      ['Kontrola dostupnosti ukáže chýbajúce komponenty.', 'The availability check shows missing components.'],
    ],
    [['Príkaz prevezme kusovník a postup platné k dátumu vytvorenia.', 'The order takes the BOM and routing valid on its creation date.']],
  ),
  FAGLL03: note(
    ['Na položky účtov hlavnej knihy v New G/L, s ledgerom a rozšírenými poľami.', 'For G/L account line items in New G/L, with ledger and extended fields.'],
    [
      ['Rozloženia (layouts) s profit centrom a segmentom pomáhajú pri reconciliácii.', 'Layouts with profit center and segment help reconciliation.'],
      ['Otvorené a vyrovnané položky sa vyberajú zvlášť.', 'Open and cleared items are selected separately.'],
    ],
    [['Iný ledger ako vodiaci ukáže iné hodnoty.', 'A ledger other than the leading one shows different values.']],
    ['V S/4 sú položky v ACDOCA; Fiori „Display Line Items“ je moderný ekvivalent.', 'In S/4 items live in ACDOCA; Fiori "Display Line Items" is the modern equivalent.'],
  ),
  'F.01': note(
    ['Na klasický finančný výkaz (súvaha, výsledovka) podľa štruktúry výkazu.', 'For the classic financial statement (balance sheet, P&L) by statement version.'],
    [
      ['Verzia výkazu určuje usporiadanie účtov.', 'The statement version decides the account layout.'],
      ['Porovnaj obdobia na kontrolu pohybov.', 'Compare periods to check movements.'],
    ],
    [['Nezaradené účty sa objavia v osobitnej skupine; to je signál chyby.', 'Unassigned accounts appear in a separate group; that signals an error.']],
    ['V S/4 je preferované reportovanie cez Fiori a CDS.', 'In S/4, reporting through Fiori and CDS is preferred.'],
  ),
  // ── FI ─────────────────────────────────────────────────────────
  FB03: note(
    ['Na zobrazenie účtovného dokladu: hlavička, položky, mena a následné doklady.', 'To display an accounting document: header, items, currency and follow-on documents.'],
    [
      ['Zadaj číslo dokladu, účtovný okruh a fiškálny rok.', 'Enter document number, company code and fiscal year.'],
      ['Pohľad „Document environment“ vedie na pôvodný doklad (MIGO, MIRO, VF).', 'The document environment leads to the original document (MIGO, MIRO, VF).'],
    ],
    [['Rovnaké číslo dokladu môže existovať v inom roku alebo okruhu.', 'The same number may exist in another year or company code.']],
  ),
  FB60: note(
    ['Na dodávateľskú faktúru priamo vo FI, bez väzby na objednávku.', 'To enter a supplier invoice directly in FI, without a PO reference.'],
    [
      ['Pre faktúry k objednávke patrí MIRO, nie FB60.', 'For invoices against a PO, MIRO is right, not FB60.'],
      ['Predbežné uloženie (park) umožní schválenie pred účtovaním.', 'Parking allows approval before posting.'],
    ],
    [['Duplicitná faktúra unikne kontrole, ak sa líši referencia.', 'A duplicate invoice slips through if the reference differs.']],
  ),
  FBL1N: note(
    ['Na položky dodávateľov: otvorené, vyrovnané a ich platobné bloky.', 'For supplier line items: open, cleared and their payment blocks.'],
    [
      ['Stĺpec platobného bloku vysvetlí, prečo F110 položku vynechal.', 'The payment-block column explains why F110 skipped an item.'],
      ['Dátum kľúča „k dátumu“ dá stav k minulému dňu.', 'The "open at key date" option gives the state on a past day.'],
    ],
    [['Bez obmedzenia dodávateľa a okruhu je výber pomalý.', 'Without supplier and company code restrictions the selection is slow.']],
    ['V S/4 je Fiori „Manage Supplier Line Items“ moderný ekvivalent.', 'In S/4, the Fiori "Manage Supplier Line Items" app is the modern equivalent.'],
  ),
  FBL5N: note(
    ['Na položky odberateľov: otvorené pohľadávky, platby a vyrovnania.', 'For customer line items: open receivables, payments and clearings.'],
    [
      ['Rozloženie s dňami po splatnosti pomáha pri upomínaní.', 'A layout with days overdue helps with dunning.'],
      ['Z položky sa dostaneš na pôvodnú faktúru.', 'From an item you can reach the original billing document.'],
    ],
    [['Čiastočné platby môžu vyzerať ako otvorené položky.', 'Partial payments can look like open items.']],
  ),
  FS00: note(
    ['Na centrálne zobrazenie a údržbu G/L účtu: účtová osnova aj účtovný okruh.', 'To display and maintain a G/L account centrally: chart of accounts and company code.'],
    [
      ['Field status group určí, ktoré polia sú pri účtovaní povinné.', 'The field status group decides which fields are mandatory when posting.'],
      ['Typ účtu (napr. nákladový prvok v S/4) mení správanie v CO.', 'The account type (e.g. cost element in S/4) changes CO behaviour.'],
    ],
    [['Zmeny G/L účtov v produkcii idú cez customizing proces.', 'G/L account changes in production go through the customizing process.']],
    ['V S/4 sú nákladové prvky súčasťou G/L účtov.', 'In S/4, cost elements are part of G/L accounts.'],
  ),
  OB52: note(
    ['Keď účtovanie hlási „obdobie nie je otvorené“: otvorené obdobia podľa typu účtu.', 'When posting says "period not open": open periods by account type.'],
    [
      ['Variant účtovných období je priradený k účtovnému okruhu.', 'The posting-period variant is assigned to the company code.'],
      ['Riadok „+“ platí pre všetky typy účtov.', 'The "+" row applies to all account types.'],
    ],
    [['Otvorenie obdobia je rozhodnutie FI podľa uzávierkového kalendára.', 'Opening a period is an FI decision per the closing calendar.']],
  ),
  // ── Migration ─────────────────────────────────────────────────
  LTMOM: note(
    ['Na úpravu migračných objektov S/4HANA migračného kokpitu: štruktúry, polia, mapovanie.', 'To adjust migration objects of the S/4HANA migration cockpit: structures, fields, mapping.'],
    [
      ['Začni od štandardného objektu; vlastné objekty len keď treba.', 'Start from the standard object; custom objects only when needed.'],
      ['Zmeny sú transportovateľné; drž ich v requeste.', 'Changes are transportable; keep them in a request.'],
    ],
    [['Zmena mapovania počas mock behov znehodnotí porovnanie výsledkov.', 'Changing the mapping between mock runs spoils the comparison of results.']],
    ['Spolupracuje s Fiori aplikáciou Migrate Your Data (F3473).', 'Works together with the Fiori app Migrate Your Data (F3473).'],
  ),
  CVI_COCKPIT: note(
    ['V ECC pred konverziou na S/4HANA: príprava synchronizácie odberateľov a dodávateľov na BP.', 'In ECC before an S/4HANA conversion: preparing customer and supplier synchronization to BP.'],
    [
      ['Najprv vyčisti dáta (duplicity, chýbajúce polia), potom synchronizuj.', 'Clean the data first (duplicates, missing fields), then synchronize.'],
      ['Logy synchronizácie nájdeš aj v SLG1.', 'Synchronization logs are also in SLG1.'],
    ],
    [['Neúplná CVI príprava zastaví konverziu.', 'Incomplete CVI preparation stops the conversion.']],
    ['Po konverzii je BP jediný vstup pre odberateľov a dodávateľov.', 'After conversion, BP is the only entry point for customers and suppliers.'],
  ),
};
