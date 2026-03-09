import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════ STORAGE ═══════════════ */
const SK = "morganbet_v5";
async function loadData() { try { const r = await window.storage.get(SK); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveData(d) { try { await window.storage.set(SK, JSON.stringify(d)); } catch {} }

/* ═══════════════ CONSTANTS ═══════════════ */
const XAF = 655.957;
const DEFAULT_PIN = "1234";

/* ═══════════════ TRANSLATIONS ═══════════════ */
const T = {
  fr: {
    tagline: "Chaque pari compte.",
    sub: "Suivi professionnel de vos paris sportifs. Statistiques style trading, bilans hebdo/mensuels, profit net, EUR & XAF.",
    badge: "⚽ Gestion de bankroll sportive pro",
    start: "🚀 Commencer", access: "Accéder →",
    feats:[["📊","Stats trading","ROI, drawdown, streak, profit net — comme un trader pro."],["📅","Bilans auto","Bilan automatique chaque semaine et chaque mois."],["💶","EUR & XAF","Conversion automatique en temps réel."],["📅","Date libre","Choisissez la date/heure exacte de chaque pari."],["👁️","Mode public","Stats visibles à tous. Modifications réservées à l'admin (PIN)."],["📱","Responsive","Parfait sur mobile, tablette et ordinateur."]],
    setupTitle:"Configuration initiale", setupBtn:"Lancer MorganbetBK 🚀",
    pinAdmin:"Code PIN admin (4 chiffres) — seul vous pouvez modifier",
    pinCreate:"Créer un PIN", pinConfirm:"Confirmer le PIN",
    pinTitle:"Accès Admin", pinSub:"Code PIN 4 chiffres", pinCancel:"Annuler", pinWrong:"Code incorrect.",
    dashTitle:"Dashboard", dashAdmin:"Mode Admin 🔐", dashReadonly:"Lecture seule 👁️",
    dashBankroll:"💰 Bankroll actuelle", addBet:"+ Pari",
    noPending:"Aucun pari en cours.", addHere:" Ajouter →", seeAll:"Voir tous →",
    pending:"En cours", won:"Gagné ✓", lost:"Perdu ✗", refunded:"Remboursé",
    newBetTitle:"Nouveau pari", simple:"🎯 Simple", combine:"🔗 Combiné",
    betName:"Nom du pari (optionnel)", betNamePh:"Ex: Soirée Ligue 1...",
    betDate:"📅 Date et heure du pari", match:"Match", home:"Domicile", away:"Extérieur",
    market:"Marché", cote:"Cote", addMatch:"+ Ajouter un match",
    stakeTitle:"Montant de mise", stakeLbl:"Mise", totalCote:"Cote totale",
    potGain:"Gain potentiel", netIfWon:"Profit NET si gagné", pctBank:"% bankroll",
    note:"Note (optionnel)", notePh:"Votre analyse...", save:"✅ Enregistrer le pari",
    histTitle:"📁 Historique", search:"🔍 Rechercher...",
    all:"Tous", pendingF:"En cours", wonF:"Gagnés ✓", lostF:"Perdus ✗", refundedF:"Remboursés",
    allTypes:"Tous types", simples:"Simples", combines:"Combinés",
    results:n=>`${n} pari(s)`, noResult:"Aucun résultat.",
    details:"▼ Détails", reduce:"▲ Réduire",
    markWon:"✓ Gagné", markLost:"✗ Perdu", markRef:"↩ Remb.", del:"🗑 Supprimer",
    statsTitle:"📊 Statistiques", tradingBadge:"Trading View",
    bilanTitle:"📅 Bilans", byMonth:"📆 Par mois", byWeek:"📅 Par semaine",
    noData:"Aucune donnée. Ajoutez des paris pour voir vos bilans.",
    settingsTitle:"⚙️ Paramètres", displayCur:"Devise d'affichage",
    bankrollLbl:"Bankroll", define:"Définir", addAmt:"+ Ajouter", subAmt:"− Retirer",
    update:"Mettre à jour", changePIN:"🔐 Changer le PIN",
    newPIN:"Nouveau PIN", confirmPINLbl:"Confirmer", updatePIN:"Mettre à jour le PIN",
    dangerZone:"⚠️ Zone de danger",
    dangerText:"Supprime TOUS les paris et remet la bankroll à zéro. Cette action est irréversible.",
    resetBtn:"🗑️ Tout réinitialiser",
    confirmDelTitle:"Supprimer le pari", confirmDelMsg:"Cette action est irréversible. Le pari sera définitivement supprimé.", confirmDelOk:"Supprimer",
    confirmResetTitle:"Réinitialiser complètement", confirmResetMsg:"Tous vos paris seront supprimés et la bankroll remise à zéro. Irréversible.", confirmResetOk:"Réinitialiser",
    cancel:"Annuler",
    tSaved:"Pari enregistré ✓", tWon:"Pari marqué Gagné ✓", tLost:"Pari marqué Perdu ✗", tRef:"Pari remboursé ↩",
    tBank:"Bankroll mise à jour ✓", tPIN:"Code PIN mis à jour ✓", tDel:"Pari supprimé", tReset:"Application réinitialisée", tAdmin:"Connecté en mode Admin 🔐",
    accessRequired:"Accès Admin requis", accessSub:"Connectez-vous pour accéder à cette section.", login:"Se connecter",
    netProfit:"Profit NET", staked:"💸 Mises totales", returned:"💵 Total encaissé",
    grossP:"📈 Profit BRUT", netP:"💰 Profit NET", roiP:"📊 ROI période",
    totalBets:"Total paris", periods:"Périodes", globalNet:"💰 Profit NET global",
    wLabel:k=>{ const[y,w]=k.split("-W"); return `Semaine ${parseInt(w)} · ${y}`; },
    mLabel:k=>{ const[y,m]=k.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}); },
    navD:"Accueil", navH:"Historique", navS:"Stats", navB:"Bilans", navN:"Pari", navSet:"Réglages",
    combineL:"Combiné", simpleL:"Simple",
    inProgress:"⏳ Paris en cours",
    eAmt:"Montant invalide", ePIN:"4 chiffres requis", ePINM:"Les codes ne correspondent pas",
    eStake:"Mise invalide", eTeam:"Équipe requise", eCote:"Cote requise",
    initialBank:"Bankroll initiale en",
    vsCapital:"vs capital initial",
  },
  en: {
    tagline: "Every bet counts.",
    sub: "Professional sports betting bankroll tracker. Trading-style stats, weekly/monthly reports, net profit, EUR & XAF.",
    badge: "⚽ Pro sports bankroll management",
    start: "🚀 Get started", access: "Access →",
    feats:[["📊","Trading stats","ROI, drawdown, streak, net profit — like a pro trader."],["📅","Auto reports","Automatic weekly & monthly reports. Net profit + stakes."],["💶","EUR & XAF","Real-time automatic currency conversion."],["📅","Custom date","Choose the exact date/time for each bet."],["👁️","Public mode","Stats visible to all. Edits reserved for admin (PIN)."],["📱","Responsive","Perfect on mobile, tablet and desktop."]],
    setupTitle:"Initial setup", setupBtn:"Launch MorganbetBK 🚀",
    pinAdmin:"Admin PIN (4 digits) — only you can modify data",
    pinCreate:"Create PIN", pinConfirm:"Confirm PIN",
    pinTitle:"Admin Access", pinSub:"4-digit PIN code", pinCancel:"Cancel", pinWrong:"Wrong code.",
    dashTitle:"Dashboard", dashAdmin:"Admin Mode 🔐", dashReadonly:"Read only 👁️",
    dashBankroll:"💰 Current bankroll", addBet:"+ Bet",
    noPending:"No pending bets.", addHere:" Add →", seeAll:"See all →",
    pending:"Pending", won:"Won ✓", lost:"Lost ✗", refunded:"Refunded",
    newBetTitle:"New bet", simple:"🎯 Single", combine:"🔗 Accumulator",
    betName:"Bet name (optional)", betNamePh:"e.g. Champions League night...",
    betDate:"📅 Bet date & time", match:"Match", home:"Home team", away:"Away team",
    market:"Market", cote:"Odds", addMatch:"+ Add a match",
    stakeTitle:"Stake amount", stakeLbl:"Stake", totalCote:"Total odds",
    potGain:"Potential return", netIfWon:"Net profit if won", pctBank:"% of bankroll",
    note:"Note (optional)", notePh:"Your analysis...", save:"✅ Save bet",
    histTitle:"📁 History", search:"🔍 Search...",
    all:"All", pendingF:"Pending", wonF:"Won ✓", lostF:"Lost ✗", refundedF:"Refunded",
    allTypes:"All types", simples:"Singles", combines:"Accumulators",
    results:n=>`${n} bet(s)`, noResult:"No results.",
    details:"▼ Details", reduce:"▲ Collapse",
    markWon:"✓ Won", markLost:"✗ Lost", markRef:"↩ Refund", del:"🗑 Delete",
    statsTitle:"📊 Statistics", tradingBadge:"Trading View",
    bilanTitle:"📅 Reports", byMonth:"📆 By month", byWeek:"📅 By week",
    noData:"No data yet. Add bets to see your reports.",
    settingsTitle:"⚙️ Settings", displayCur:"Display currency",
    bankrollLbl:"Bankroll", define:"Set", addAmt:"+ Add", subAmt:"− Subtract",
    update:"Update", changePIN:"🔐 Change PIN",
    newPIN:"New PIN", confirmPINLbl:"Confirm", updatePIN:"Update PIN",
    dangerZone:"⚠️ Danger zone",
    dangerText:"Deletes ALL bets and resets bankroll to zero. This action is irreversible.",
    resetBtn:"🗑️ Reset everything",
    confirmDelTitle:"Delete bet", confirmDelMsg:"This action is irreversible. The bet will be permanently deleted.", confirmDelOk:"Delete",
    confirmResetTitle:"Reset everything", confirmResetMsg:"All bets will be deleted and bankroll reset to zero. Irreversible.", confirmResetOk:"Reset",
    cancel:"Cancel",
    tSaved:"Bet saved ✓", tWon:"Bet marked Won ✓", tLost:"Bet marked Lost ✗", tRef:"Bet refunded ↩",
    tBank:"Bankroll updated ✓", tPIN:"PIN updated ✓", tDel:"Bet deleted", tReset:"App reset", tAdmin:"Logged in as Admin 🔐",
    accessRequired:"Admin access required", accessSub:"Log in to access this section.", login:"Log in",
    netProfit:"Net profit", staked:"💸 Total staked", returned:"💵 Total returned",
    grossP:"📈 Gross profit", netP:"💰 Net profit", roiP:"📊 Period ROI",
    totalBets:"Total bets", periods:"Periods", globalNet:"💰 Global net profit",
    wLabel:k=>{ const[y,w]=k.split("-W"); return `Week ${parseInt(w)} · ${y}`; },
    mLabel:k=>{ const[y,m]=k.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("en-GB",{month:"long",year:"numeric"}); },
    navD:"Home", navH:"History", navS:"Stats", navB:"Reports", navN:"Bet", navSet:"Settings",
    combineL:"Accumulator", simpleL:"Single",
    inProgress:"⏳ Pending bets",
    eAmt:"Invalid amount", ePIN:"4 digits required", ePINM:"PINs do not match",
    eStake:"Invalid stake", eTeam:"Team required", eCote:"Odds required",
    initialBank:"Initial bankroll in",
    vsCapital:"vs initial capital",
  },
  it: {
    tagline: "Ogni scommessa conta.",
    sub: "Gestione professionale del bankroll sportivo. Statistiche stile trading, report settimanali/mensili, profitto netto, EUR & XAF.",
    badge: "⚽ Gestione bankroll sportiva pro",
    start: "🚀 Inizia ora", access: "Accedi →",
    feats:[["📊","Statistiche trading","ROI, drawdown, streak, profitto netto — come un trader pro."],["📅","Report automatici","Report automatico ogni settimana e ogni mese."],["💶","EUR & XAF","Conversione automatica in tempo reale."],["📅","Data libera","Scegli data e ora esatta per ogni scommessa."],["👁️","Modalità pubblica","Stats visibili a tutti. Modifiche riservate all'admin (PIN)."],["📱","Responsive","Perfetto su mobile, tablet e computer."]],
    setupTitle:"Configurazione iniziale", setupBtn:"Avvia MorganbetBK 🚀",
    pinAdmin:"PIN admin (4 cifre) — solo tu puoi modificare",
    pinCreate:"Crea un PIN", pinConfirm:"Conferma PIN",
    pinTitle:"Accesso Admin", pinSub:"Codice PIN a 4 cifre", pinCancel:"Annulla", pinWrong:"Codice errato.",
    dashTitle:"Dashboard", dashAdmin:"Modalità Admin 🔐", dashReadonly:"Solo lettura 👁️",
    dashBankroll:"💰 Bankroll attuale", addBet:"+ Scommessa",
    noPending:"Nessuna scommessa in corso.", addHere:" Aggiungi →", seeAll:"Vedi tutte →",
    pending:"In corso", won:"Vinta ✓", lost:"Persa ✗", refunded:"Rimborsata",
    newBetTitle:"Nuova scommessa", simple:"🎯 Singola", combine:"🔗 Multipla",
    betName:"Nome scommessa (opzionale)", betNamePh:"Es: Serata Champions...",
    betDate:"📅 Data e ora scommessa", match:"Partita", home:"Casa", away:"Trasferta",
    market:"Mercato", cote:"Quota", addMatch:"+ Aggiungi partita",
    stakeTitle:"Importo puntata", stakeLbl:"Puntata", totalCote:"Quota totale",
    potGain:"Guadagno potenziale", netIfWon:"Profitto netto se vince", pctBank:"% bankroll",
    note:"Nota (opzionale)", notePh:"La tua analisi...", save:"✅ Salva scommessa",
    histTitle:"📁 Storico", search:"🔍 Cerca...",
    all:"Tutte", pendingF:"In corso", wonF:"Vinte ✓", lostF:"Perse ✗", refundedF:"Rimborsate",
    allTypes:"Tutti i tipi", simples:"Singole", combines:"Multiple",
    results:n=>`${n} scommessa/e`, noResult:"Nessun risultato.",
    details:"▼ Dettagli", reduce:"▲ Comprimi",
    markWon:"✓ Vinta", markLost:"✗ Persa", markRef:"↩ Rimborso", del:"🗑 Elimina",
    statsTitle:"📊 Statistiche", tradingBadge:"Visione Trading",
    bilanTitle:"📅 Report", byMonth:"📆 Per mese", byWeek:"📅 Per settimana",
    noData:"Nessun dato. Aggiungi scommesse per vedere i report.",
    settingsTitle:"⚙️ Impostazioni", displayCur:"Valuta visualizzata",
    bankrollLbl:"Bankroll", define:"Imposta", addAmt:"+ Aggiungi", subAmt:"− Sottrai",
    update:"Aggiorna", changePIN:"🔐 Cambia PIN",
    newPIN:"Nuovo PIN", confirmPINLbl:"Conferma", updatePIN:"Aggiorna PIN",
    dangerZone:"⚠️ Zona pericolosa",
    dangerText:"Elimina TUTTE le scommesse e azzera il bankroll. Azione irreversibile.",
    resetBtn:"🗑️ Reimposta tutto",
    confirmDelTitle:"Elimina scommessa", confirmDelMsg:"Azione irreversibile. La scommessa sarà eliminata definitivamente.", confirmDelOk:"Elimina",
    confirmResetTitle:"Reimposta tutto", confirmResetMsg:"Tutte le scommesse saranno eliminate e il bankroll azzerato. Irreversibile.", confirmResetOk:"Reimposta",
    cancel:"Annulla",
    tSaved:"Scommessa salvata ✓", tWon:"Scommessa vinta ✓", tLost:"Scommessa persa ✗", tRef:"Scommessa rimborsata ↩",
    tBank:"Bankroll aggiornata ✓", tPIN:"PIN aggiornato ✓", tDel:"Scommessa eliminata", tReset:"App reimpostata", tAdmin:"Connesso come Admin 🔐",
    accessRequired:"Accesso Admin richiesto", accessSub:"Accedi per gestire questa sezione.", login:"Accedi",
    netProfit:"Profitto netto", staked:"💸 Puntate totali", returned:"💵 Totale incassato",
    grossP:"📈 Profitto lordo", netP:"💰 Profitto netto", roiP:"📊 ROI periodo",
    totalBets:"Scommesse totali", periods:"Periodi", globalNet:"💰 Profitto netto globale",
    wLabel:k=>{ const[y,w]=k.split("-W"); return `Settimana ${parseInt(w)} · ${y}`; },
    mLabel:k=>{ const[y,m]=k.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("it-IT",{month:"long",year:"numeric"}); },
    navD:"Home", navH:"Storico", navS:"Stats", navB:"Report", navN:"Scommessa", navSet:"Impostazioni",
    combineL:"Multipla", simpleL:"Singola",
    inProgress:"⏳ Scommesse in corso",
    eAmt:"Importo non valido", ePIN:"Servono 4 cifre", ePINM:"I codici non corrispondono",
    eStake:"Importo non valido", eTeam:"Squadra richiesta", eCote:"Quota richiesta",
    initialBank:"Bankroll iniziale in",
    vsCapital:"vs capitale iniziale",
  },
};

/* ═══════════════════════ MARKETS (per lang) ═══════════════════════ */
const MARKETS = {
  fr:[{id:"team_1_5",icon:"⚽",label:"Une équipe marque +1.5"},{id:"gg",icon:"🎯",label:"GG (Les deux équipes marquent)"},{id:"gg_2_5",icon:"🔥",label:"GG + 2.5 buts"},{id:"win1",icon:"🏠",label:"Victoire domicile (1)"},{id:"win2",icon:"✈️",label:"Victoire extérieur (2)"},{id:"draw",icon:"🤝",label:"Match nul (X)"},{id:"ov25",icon:"📈",label:"Plus de 2.5 buts"},{id:"un25",icon:"📉",label:"Moins de 2.5 buts"},{id:"btts_no",icon:"🚫",label:"BTTS Non"},{id:"dc1x",icon:"🛡️",label:"Double chance 1X"},{id:"dcx2",icon:"🛡️",label:"Double chance X2"},{id:"qual1",icon:"🏆",label:"Qualification équipe domicile"},{id:"qual2",icon:"🏆",label:"Qualification équipe extérieur"},{id:"ct_ov25",icon:"🚩",label:"Corners total Over 2.5"},{id:"ct_ov35",icon:"🚩",label:"Corners total Over 3.5"},{id:"ct_ov45",icon:"🚩",label:"Corners total Over 4.5"},{id:"ct_ov55",icon:"🚩",label:"Corners total Over 5.5"},{id:"ct_ov65",icon:"🚩",label:"Corners total Over 6.5"},{id:"ct_ov75",icon:"🚩",label:"Corners total Over 7.5"},{id:"ct_ov85",icon:"🚩",label:"Corners total Over 8.5"},{id:"ct_ov95",icon:"🚩",label:"Corners total Over 9.5"},{id:"ct_ov105",icon:"🚩",label:"Corners total Over 10.5"},{id:"ct_un25",icon:"🏳️",label:"Corners total Under 2.5"},{id:"ct_un35",icon:"🏳️",label:"Corners total Under 3.5"},{id:"ct_un45",icon:"🏳️",label:"Corners total Under 4.5"},{id:"ct_un55",icon:"🏳️",label:"Corners total Under 5.5"},{id:"ct_un65",icon:"🏳️",label:"Corners total Under 6.5"},{id:"ct_un75",icon:"🏳️",label:"Corners total Under 7.5"},{id:"ct_un85",icon:"🏳️",label:"Corners total Under 8.5"},{id:"ct_un95",icon:"🏳️",label:"Corners total Under 9.5"},{id:"ct_un105",icon:"🏳️",label:"Corners total Under 10.5"},{id:"ch_ov25",icon:"🏠🚩",label:"Corners domicile Over 2.5"},{id:"ch_ov35",icon:"🏠🚩",label:"Corners domicile Over 3.5"},{id:"ch_ov45",icon:"🏠🚩",label:"Corners domicile Over 4.5"},{id:"ch_ov55",icon:"🏠🚩",label:"Corners domicile Over 5.5"},{id:"ch_ov65",icon:"🏠🚩",label:"Corners domicile Over 6.5"},{id:"ch_ov75",icon:"🏠🚩",label:"Corners domicile Over 7.5"},{id:"ch_ov85",icon:"🏠🚩",label:"Corners domicile Over 8.5"},{id:"ch_ov95",icon:"🏠🚩",label:"Corners domicile Over 9.5"},{id:"ch_ov105",icon:"🏠🚩",label:"Corners domicile Over 10.5"},{id:"ch_un25",icon:"🏠🏳️",label:"Corners domicile Under 2.5"},{id:"ch_un35",icon:"🏠🏳️",label:"Corners domicile Under 3.5"},{id:"ch_un45",icon:"🏠🏳️",label:"Corners domicile Under 4.5"},{id:"ch_un55",icon:"🏠🏳️",label:"Corners domicile Under 5.5"},{id:"ch_un65",icon:"🏠🏳️",label:"Corners domicile Under 6.5"},{id:"ch_un75",icon:"🏠🏳️",label:"Corners domicile Under 7.5"},{id:"ch_un85",icon:"🏠🏳️",label:"Corners domicile Under 8.5"},{id:"ch_un95",icon:"🏠🏳️",label:"Corners domicile Under 9.5"},{id:"ch_un105",icon:"🏠🏳️",label:"Corners domicile Under 10.5"},{id:"ca_ov25",icon:"✈️🚩",label:"Corners extérieur Over 2.5"},{id:"ca_ov35",icon:"✈️🚩",label:"Corners extérieur Over 3.5"},{id:"ca_ov45",icon:"✈️🚩",label:"Corners extérieur Over 4.5"},{id:"ca_ov55",icon:"✈️🚩",label:"Corners extérieur Over 5.5"},{id:"ca_ov65",icon:"✈️🚩",label:"Corners extérieur Over 6.5"},{id:"ca_ov75",icon:"✈️🚩",label:"Corners extérieur Over 7.5"},{id:"ca_ov85",icon:"✈️🚩",label:"Corners extérieur Over 8.5"},{id:"ca_ov95",icon:"✈️🚩",label:"Corners extérieur Over 9.5"},{id:"ca_ov105",icon:"✈️🚩",label:"Corners extérieur Over 10.5"},{id:"ca_un25",icon:"✈️🏳️",label:"Corners extérieur Under 2.5"},{id:"ca_un35",icon:"✈️🏳️",label:"Corners extérieur Under 3.5"},{id:"ca_un45",icon:"✈️🏳️",label:"Corners extérieur Under 4.5"},{id:"ca_un55",icon:"✈️🏳️",label:"Corners extérieur Under 5.5"},{id:"ca_un65",icon:"✈️🏳️",label:"Corners extérieur Under 6.5"},{id:"ca_un75",icon:"✈️🏳️",label:"Corners extérieur Under 7.5"},{id:"ca_un85",icon:"✈️🏳️",label:"Corners extérieur Under 8.5"},{id:"ca_un95",icon:"✈️🏳️",label:"Corners extérieur Under 9.5"},{id:"ca_un105",icon:"✈️🏳️",label:"Corners extérieur Under 10.5"}],
  en:[{id:"team_1_5",icon:"⚽",label:"A team scores +1.5"},{id:"gg",icon:"🎯",label:"Both teams to score"},{id:"gg_2_5",icon:"🔥",label:"BTTS + Over 2.5"},{id:"win1",icon:"🏠",label:"Home win (1)"},{id:"win2",icon:"✈️",label:"Away win (2)"},{id:"draw",icon:"🤝",label:"Draw (X)"},{id:"ov25",icon:"📈",label:"Over 2.5 goals"},{id:"un25",icon:"📉",label:"Under 2.5 goals"},{id:"btts_no",icon:"🚫",label:"BTTS No"},{id:"dc1x",icon:"🛡️",label:"Double chance 1X"},{id:"dcx2",icon:"🛡️",label:"Double chance X2"},{id:"qual1",icon:"🏆",label:"Home team qualification"},{id:"qual2",icon:"🏆",label:"Away team qualification"},{id:"ct_ov25",icon:"🚩",label:"Total corners Over 2.5"},{id:"ct_ov35",icon:"🚩",label:"Total corners Over 3.5"},{id:"ct_ov45",icon:"🚩",label:"Total corners Over 4.5"},{id:"ct_ov55",icon:"🚩",label:"Total corners Over 5.5"},{id:"ct_ov65",icon:"🚩",label:"Total corners Over 6.5"},{id:"ct_ov75",icon:"🚩",label:"Total corners Over 7.5"},{id:"ct_ov85",icon:"🚩",label:"Total corners Over 8.5"},{id:"ct_ov95",icon:"🚩",label:"Total corners Over 9.5"},{id:"ct_ov105",icon:"🚩",label:"Total corners Over 10.5"},{id:"ct_un25",icon:"🏳️",label:"Total corners Under 2.5"},{id:"ct_un35",icon:"🏳️",label:"Total corners Under 3.5"},{id:"ct_un45",icon:"🏳️",label:"Total corners Under 4.5"},{id:"ct_un55",icon:"🏳️",label:"Total corners Under 5.5"},{id:"ct_un65",icon:"🏳️",label:"Total corners Under 6.5"},{id:"ct_un75",icon:"🏳️",label:"Total corners Under 7.5"},{id:"ct_un85",icon:"🏳️",label:"Total corners Under 8.5"},{id:"ct_un95",icon:"🏳️",label:"Total corners Under 9.5"},{id:"ct_un105",icon:"🏳️",label:"Total corners Under 10.5"},{id:"ch_ov25",icon:"🏠🚩",label:"Home corners Over 2.5"},{id:"ch_ov35",icon:"🏠🚩",label:"Home corners Over 3.5"},{id:"ch_ov45",icon:"🏠🚩",label:"Home corners Over 4.5"},{id:"ch_ov55",icon:"🏠🚩",label:"Home corners Over 5.5"},{id:"ch_ov65",icon:"🏠🚩",label:"Home corners Over 6.5"},{id:"ch_ov75",icon:"🏠🚩",label:"Home corners Over 7.5"},{id:"ch_ov85",icon:"🏠🚩",label:"Home corners Over 8.5"},{id:"ch_ov95",icon:"🏠🚩",label:"Home corners Over 9.5"},{id:"ch_ov105",icon:"🏠🚩",label:"Home corners Over 10.5"},{id:"ch_un25",icon:"🏠🏳️",label:"Home corners Under 2.5"},{id:"ch_un35",icon:"🏠🏳️",label:"Home corners Under 3.5"},{id:"ch_un45",icon:"🏠🏳️",label:"Home corners Under 4.5"},{id:"ch_un55",icon:"🏠🏳️",label:"Home corners Under 5.5"},{id:"ch_un65",icon:"🏠🏳️",label:"Home corners Under 6.5"},{id:"ch_un75",icon:"🏠🏳️",label:"Home corners Under 7.5"},{id:"ch_un85",icon:"🏠🏳️",label:"Home corners Under 8.5"},{id:"ch_un95",icon:"🏠🏳️",label:"Home corners Under 9.5"},{id:"ch_un105",icon:"🏠🏳️",label:"Home corners Under 10.5"},{id:"ca_ov25",icon:"✈️🚩",label:"Away corners Over 2.5"},{id:"ca_ov35",icon:"✈️🚩",label:"Away corners Over 3.5"},{id:"ca_ov45",icon:"✈️🚩",label:"Away corners Over 4.5"},{id:"ca_ov55",icon:"✈️🚩",label:"Away corners Over 5.5"},{id:"ca_ov65",icon:"✈️🚩",label:"Away corners Over 6.5"},{id:"ca_ov75",icon:"✈️🚩",label:"Away corners Over 7.5"},{id:"ca_ov85",icon:"✈️🚩",label:"Away corners Over 8.5"},{id:"ca_ov95",icon:"✈️🚩",label:"Away corners Over 9.5"},{id:"ca_ov105",icon:"✈️🚩",label:"Away corners Over 10.5"},{id:"ca_un25",icon:"✈️🏳️",label:"Away corners Under 2.5"},{id:"ca_un35",icon:"✈️🏳️",label:"Away corners Under 3.5"},{id:"ca_un45",icon:"✈️🏳️",label:"Away corners Under 4.5"},{id:"ca_un55",icon:"✈️🏳️",label:"Away corners Under 5.5"},{id:"ca_un65",icon:"✈️🏳️",label:"Away corners Under 6.5"},{id:"ca_un75",icon:"✈️🏳️",label:"Away corners Under 7.5"},{id:"ca_un85",icon:"✈️🏳️",label:"Away corners Under 8.5"},{id:"ca_un95",icon:"✈️🏳️",label:"Away corners Under 9.5"},{id:"ca_un105",icon:"✈️🏳️",label:"Away corners Under 10.5"}],
  it:[{id:"team_1_5",icon:"⚽",label:"Una squadra segna +1.5"},{id:"gg",icon:"🎯",label:"GG (Entrambe segnano)"},{id:"gg_2_5",icon:"🔥",label:"GG + 2.5 gol"},{id:"win1",icon:"🏠",label:"Vittoria casa (1)"},{id:"win2",icon:"✈️",label:"Vittoria trasferta (2)"},{id:"draw",icon:"🤝",label:"Pareggio (X)"},{id:"ov25",icon:"📈",label:"Oltre 2.5 gol"},{id:"un25",icon:"📉",label:"Meno di 2.5 gol"},{id:"btts_no",icon:"🚫",label:"GG No"},{id:"dc1x",icon:"🛡️",label:"Doppia chance 1X"},{id:"dcx2",icon:"🛡️",label:"Doppia chance X2"},{id:"qual1",icon:"🏆",label:"Qualificazione squadra casa"},{id:"qual2",icon:"🏆",label:"Qualificazione squadra trasferta"},{id:"ct_ov25",icon:"🚩",label:"Corner totali Over 2.5"},{id:"ct_ov35",icon:"🚩",label:"Corner totali Over 3.5"},{id:"ct_ov45",icon:"🚩",label:"Corner totali Over 4.5"},{id:"ct_ov55",icon:"🚩",label:"Corner totali Over 5.5"},{id:"ct_ov65",icon:"🚩",label:"Corner totali Over 6.5"},{id:"ct_ov75",icon:"🚩",label:"Corner totali Over 7.5"},{id:"ct_ov85",icon:"🚩",label:"Corner totali Over 8.5"},{id:"ct_ov95",icon:"🚩",label:"Corner totali Over 9.5"},{id:"ct_ov105",icon:"🚩",label:"Corner totali Over 10.5"},{id:"ct_un25",icon:"🏳️",label:"Corner totali Under 2.5"},{id:"ct_un35",icon:"🏳️",label:"Corner totali Under 3.5"},{id:"ct_un45",icon:"🏳️",label:"Corner totali Under 4.5"},{id:"ct_un55",icon:"🏳️",label:"Corner totali Under 5.5"},{id:"ct_un65",icon:"🏳️",label:"Corner totali Under 6.5"},{id:"ct_un75",icon:"🏳️",label:"Corner totali Under 7.5"},{id:"ct_un85",icon:"🏳️",label:"Corner totali Under 8.5"},{id:"ct_un95",icon:"🏳️",label:"Corner totali Under 9.5"},{id:"ct_un105",icon:"🏳️",label:"Corner totali Under 10.5"},{id:"ch_ov25",icon:"🏠🚩",label:"Corner casa Over 2.5"},{id:"ch_ov35",icon:"🏠🚩",label:"Corner casa Over 3.5"},{id:"ch_ov45",icon:"🏠🚩",label:"Corner casa Over 4.5"},{id:"ch_ov55",icon:"🏠🚩",label:"Corner casa Over 5.5"},{id:"ch_ov65",icon:"🏠🚩",label:"Corner casa Over 6.5"},{id:"ch_ov75",icon:"🏠🚩",label:"Corner casa Over 7.5"},{id:"ch_ov85",icon:"🏠🚩",label:"Corner casa Over 8.5"},{id:"ch_ov95",icon:"🏠🚩",label:"Corner casa Over 9.5"},{id:"ch_ov105",icon:"🏠🚩",label:"Corner casa Over 10.5"},{id:"ch_un25",icon:"🏠🏳️",label:"Corner casa Under 2.5"},{id:"ch_un35",icon:"🏠🏳️",label:"Corner casa Under 3.5"},{id:"ch_un45",icon:"🏠🏳️",label:"Corner casa Under 4.5"},{id:"ch_un55",icon:"🏠🏳️",label:"Corner casa Under 5.5"},{id:"ch_un65",icon:"🏠🏳️",label:"Corner casa Under 6.5"},{id:"ch_un75",icon:"🏠🏳️",label:"Corner casa Under 7.5"},{id:"ch_un85",icon:"🏠🏳️",label:"Corner casa Under 8.5"},{id:"ch_un95",icon:"🏠🏳️",label:"Corner casa Under 9.5"},{id:"ch_un105",icon:"🏠🏳️",label:"Corner casa Under 10.5"},{id:"ca_ov25",icon:"✈️🚩",label:"Corner trasferta Over 2.5"},{id:"ca_ov35",icon:"✈️🚩",label:"Corner trasferta Over 3.5"},{id:"ca_ov45",icon:"✈️🚩",label:"Corner trasferta Over 4.5"},{id:"ca_ov55",icon:"✈️🚩",label:"Corner trasferta Over 5.5"},{id:"ca_ov65",icon:"✈️🚩",label:"Corner trasferta Over 6.5"},{id:"ca_ov75",icon:"✈️🚩",label:"Corner trasferta Over 7.5"},{id:"ca_ov85",icon:"✈️🚩",label:"Corner trasferta Over 8.5"},{id:"ca_ov95",icon:"✈️🚩",label:"Corner trasferta Over 9.5"},{id:"ca_ov105",icon:"✈️🚩",label:"Corner trasferta Over 10.5"},{id:"ca_un25",icon:"✈️🏳️",label:"Corner trasferta Under 2.5"},{id:"ca_un35",icon:"✈️🏳️",label:"Corner trasferta Under 3.5"},{id:"ca_un45",icon:"✈️🏳️",label:"Corner trasferta Under 4.5"},{id:"ca_un55",icon:"✈️🏳️",label:"Corner trasferta Under 5.5"},{id:"ca_un65",icon:"✈️🏳️",label:"Corner trasferta Under 6.5"},{id:"ca_un75",icon:"✈️🏳️",label:"Corner trasferta Under 7.5"},{id:"ca_un85",icon:"✈️🏳️",label:"Corner trasferta Under 8.5"},{id:"ca_un95",icon:"✈️🏳️",label:"Corner trasferta Under 9.5"},{id:"ca_un105",icon:"✈️🏳️",label:"Corner trasferta Under 10.5"}],
};

/* ═══════════════════════ THEME ═══════════════════════ */
const C = {
  bg:"#060e1a", bg2:"#0b1929", bg3:"#0f2035",
  border:"rgba(255,255,255,.07)", border2:"rgba(255,255,255,.12)",
  gold:"#f59e0b", goldDim:"rgba(245,158,11,.1)", goldBorder:"rgba(245,158,11,.22)",
  white:"#eef2f7", muted:"#4d6680", sub:"#7a9ab8",
  green:"#10b981", greenDim:"rgba(16,185,129,.1)", greenBright:"#34d399",
  red:"#ef4444", redDim:"rgba(239,68,68,.1)", redBright:"#f87171",
  orange:"#f97316", accent:"#06b6d4",
};

/* ═══════════════════════ HELPERS ═══════════════════════ */
const fEur = n => `€${Number(n).toFixed(2)}`;
const fXaf = n => `${Math.round(n*XAF).toLocaleString("fr-FR")} XAF`;
const fAmt = (n,c) => c==="XAF"?fXaf(n):fEur(n);
const fPct = n => `${n>=0?"+":""}${Number(n).toFixed(2)}%`;
const fDate = iso => new Date(iso).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fShortDate = iso => new Date(iso).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
function getWeekKey(iso){ const d=new Date(iso),j=new Date(d.getFullYear(),0,1); const w=Math.ceil(((d-j)/86400000+j.getDay()+1)/7); return `${d.getFullYear()}-W${String(w).padStart(2,"0")}`; }
function getMonthKey(iso){ const d=new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function calcPeriod(bets){
  const won=bets.filter(b=>b.status==="won"), lost=bets.filter(b=>b.status==="lost"), resolved=[...won,...lost];
  const totalStaked=resolved.reduce((a,b)=>a+b.stakeEur,0);
  const totalReturned=won.reduce((a,b)=>a+b.potentialGainEur,0);
  const totalLostStake=lost.reduce((a,b)=>a+b.stakeEur,0);
  const grossProfit=totalReturned-totalLostStake, netProfit=totalReturned-totalStaked;
  const roi=totalStaked>0?netProfit/totalStaked*100:0, wr=resolved.length>0?won.length/resolved.length*100:0;
  return {won,lost,refunded:bets.filter(b=>b.status==="refunded"),resolved,totalStaked,totalReturned,totalLostStake,grossProfit,netProfit,roi,wr};
}

/* ═══════════════════════ TOAST ═══════════════════════ */
function Toast({msg,type,onClose}){
  useEffect(()=>{ if(!msg)return; const t=setTimeout(onClose,2800); return()=>clearTimeout(t); },[msg]);
  if(!msg)return null;
  const bg=type==="success"?"linear-gradient(135deg,#10b981,#059669)":type==="error"?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#f59e0b,#d97706)";
  return <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:bg,color:"#fff",fontWeight:700,fontSize:14,padding:"11px 22px",borderRadius:50,boxShadow:"0 4px 24px rgba(0,0,0,.4)",whiteSpace:"nowrap",pointerEvents:"none"}}>{msg}</div>;
}

/* ═══════════════════════ CONFIRM MODAL ═══════════════════════ */
function ConfirmModal({config,t,onOk,onCancel}){
  if(!config)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(12px)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:18,width:"100%",maxWidth:340,padding:"26px 22px",textAlign:"center"}}>
        <div style={{fontSize:38,marginBottom:10}}>⚠️</div>
        <h3 style={{color:C.white,fontWeight:800,fontSize:18,margin:"0 0 8px"}}>{config.title}</h3>
        <p style={{color:C.sub,fontSize:13,margin:"0 0 22px",lineHeight:1.6}}>{config.message}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{t.cancel}</button>
          <button onClick={onOk} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{config.okLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PIN MODAL ═══════════════════════ */
function PinModal({t,onSuccess,onCancel}){
  const [pin,setPin]=useState(""), [err,setErr]=useState(false);
  const add=d=>{ if(pin.length>=4)return; const n=pin+d; setPin(n); setErr(false); if(n.length===4)setTimeout(()=>onSuccess(n,()=>{setPin("");setErr(true);}),150); };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",backdropFilter:"blur(14px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:18,width:"100%",maxWidth:320,textAlign:"center",padding:"28px 20px"}}>
        <div style={{fontSize:36,marginBottom:8}}>🔐</div>
        <h3 style={{color:C.white,fontWeight:800,fontSize:19,margin:"0 0 4px"}}>{t.pinTitle}</h3>
        <p style={{color:C.muted,fontSize:12,margin:"0 0 18px"}}>{t.pinSub}</p>
        <div style={{display:"flex",justifyContent:"center",gap:13,marginBottom:16}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",border:`2px solid ${err?C.red:C.gold}`,background:pin.length>i?(err?C.red:C.gold):"transparent",transition:"background .15s"}}/>)}
        </div>
        {err&&<p style={{color:C.red,fontSize:12,marginBottom:10}}>{t.pinWrong}</p>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=><button key={n} onClick={()=>add(String(n))} style={{padding:"14px",borderRadius:10,border:`1px solid ${C.border2}`,background:C.bg3,color:C.white,fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>)}
          <div/><button onClick={()=>add("0")} style={{padding:"14px",borderRadius:10,border:`1px solid ${C.border2}`,background:C.bg3,color:C.white,fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>0</button>
          <button onClick={()=>{setPin(p=>p.slice(0,-1));setErr(false);}} style={{padding:"14px",borderRadius:10,border:`1px solid ${C.border2}`,background:C.bg3,color:C.sub,fontSize:16,cursor:"pointer"}}>⌫</button>
        </div>
        {onCancel&&<button onClick={onCancel} style={{width:"100%",marginTop:6,padding:"10px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t.pinCancel}</button>}
      </div>
    </div>
  );
}

/* ═══════════════════════ BASE UI ═══════════════════════ */
const Inp=({label,err,...p})=>(
  <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:C.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:".7px"}}>{label}</label>}
    <input {...p} style={{width:"100%",background:C.bg3,border:`1px solid ${err?C.red:C.border2}`,borderRadius:10,padding:"10px 13px",color:C.white,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",colorScheme:"dark",...p.style}}/>
    {err&&<div style={{color:C.redBright,fontSize:11,marginTop:3}}>⚠ {err}</div>}
  </div>
);
const Slct=({label,children,...p})=>(
  <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:C.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:".7px"}}>{label}</label>}
    <select {...p} style={{width:"100%",background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,padding:"10px 13px",color:C.white,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",cursor:"pointer"}}>{children}</select>
  </div>
);
function Btn({children,v="gold",sm,full,...p}){
  const vs={gold:{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000"},green:{background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff"},red:{background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff"},ghost:{background:"transparent",color:C.sub,border:`1px solid ${C.border2}`}};
  return <button {...p} style={{padding:sm?"7px 13px":"10px 18px",width:full?"100%":undefined,borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:sm?12:14,fontFamily:"inherit",transition:"opacity .15s",...vs[v],...p.style}} onMouseEnter={e=>e.currentTarget.style.opacity=".8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}
const Badge=({status,t})=>{
  const m={pending:{bg:"#0a2035",fg:"#38bdf8"},won:{bg:"#062918",fg:"#34d399"},lost:{bg:"#200a0a",fg:"#f87171"},refunded:{bg:"#1a1208",fg:"#fb923c"}};
  const s=m[status]||m.pending, lbl={pending:t.pending,won:t.won,lost:t.lost,refunded:t.refunded}[status]||status;
  return <span style={{background:s.bg,color:s.fg,border:`1px solid ${s.fg}30`,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>{lbl}</span>;
};

/* ═══════════════════════ LANG SWITCHER ═══════════════════════ */
function LangSwitcher({lang,setLang}){
  const flags={fr:"🇫🇷",en:"🇬🇧",it:"🇮🇹"};
  return(
    <div style={{display:"flex",gap:4}}>
      {["fr","en","it"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 8px",borderRadius:8,border:`1.5px solid ${lang===l?C.gold:C.border}`,background:lang===l?C.goldDim:"transparent",color:lang===l?C.gold:C.muted,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit",lineHeight:1}}>
          {flags[l]} {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════ SPARKLINE ═══════════════════════ */
function Sparkline({data,color=C.green,height=40}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1, w=160,h=height;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/range)*h*.85-h*.075}`).join(" ");
  return(<svg width={w} height={h} style={{overflow:"visible"}}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)"/><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function StatCard({label,value,sub,icon,color,spark,trend}){
  const col=color||C.white;
  return(
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 14px",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",marginBottom:5}}>{icon&&<span style={{marginRight:4}}>{icon}</span>}{label}</div>
          <div style={{color:col,fontWeight:800,fontSize:"clamp(13px,3vw,18px)",letterSpacing:"-.3px",lineHeight:1.1}}>{value}</div>
          {sub&&<div style={{color:C.muted,fontSize:10,marginTop:3}}>{sub}</div>}
        </div>
        {trend!==undefined&&<div style={{background:trend>=0?C.greenDim:C.redDim,border:`1px solid ${trend>=0?C.green:C.red}30`,borderRadius:8,padding:"3px 7px",fontSize:11,fontWeight:700,color:trend>=0?C.greenBright:C.redBright,flexShrink:0}}>{trend>=0?"▲":"▼"} {Math.abs(trend).toFixed(1)}%</div>}
      </div>
      {spark&&<div style={{marginTop:8,opacity:.7}}><Sparkline data={spark} color={col} height={34}/></div>}
    </div>
  );
}

/* ═══════════════════════ LOGO ═══════════════════════ */
function Logo({big}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:big?12:8}}>
      <div style={{width:big?44:32,height:big?44:32,borderRadius:big?12:9,background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?24:17,flexShrink:0}}>⚽</div>
      <div>
        <div style={{color:C.white,fontWeight:900,fontSize:big?23:15,letterSpacing:"-.4px",lineHeight:1}}>Morganbet<span style={{color:C.gold}}>BK</span></div>
        {big&&<div style={{color:C.muted,fontSize:11,marginTop:2}}>Bankroll Manager Pro</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════ LANDING ═══════════════════════ */
function Landing({t,lang,setLang,onEnter}){
  return(
    <div style={{minHeight:"100vh",background:C.bg,overflowX:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:"min(600px,120vw)",height:"min(600px,120vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,.1) 0%,transparent 65%)",top:"-15%",right:"-10%"}}/>
        <div style={{position:"absolute",width:"min(400px,90vw)",height:"min(400px,90vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 65%)",bottom:"5%",left:"-5%"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"44px 44px"}}/>
      </div>
      <div style={{position:"relative",zIndex:1,maxWidth:1000,margin:"0 auto",padding:"0 14px"}}>
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",gap:10,flexWrap:"wrap"}}>
          <Logo/>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <LangSwitcher lang={lang} setLang={setLang}/>
            <Btn onClick={onEnter} sm>{t.access}</Btn>
          </div>
        </nav>
        <div style={{textAlign:"center",padding:"clamp(32px,7vw,70px) 0 clamp(24px,5vw,46px)"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",borderRadius:30,padding:"5px 16px",color:C.gold,fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",marginBottom:20}}>{t.badge}</div>
          <h1 style={{color:C.white,fontSize:"clamp(26px,7vw,60px)",fontWeight:900,lineHeight:1.08,margin:"0 0 16px",fontFamily:"Georgia,serif"}}>
            MorganbetBK.<br/><span style={{color:C.gold}}>{t.tagline}</span>
          </h1>
          <p style={{color:C.sub,fontSize:"clamp(13px,2.5vw,17px)",maxWidth:520,margin:"0 auto 28px",lineHeight:1.75}}>{t.sub}</p>
          <Btn onClick={onEnter} style={{padding:"13px 32px",fontSize:16}}>{t.start}</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,230px),1fr))",gap:11,paddingBottom:"clamp(28px,5vw,54px)"}}>
          {t.feats.map(([i,title,desc],idx)=>(
            <div key={idx} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"17px 14px",textAlign:"center"}}>
              <div style={{fontSize:27,marginBottom:8}}>{i}</div>
              <div style={{color:C.white,fontWeight:700,fontSize:13,marginBottom:5}}>{title}</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SETUP ═══════════════════════ */
function Setup({t,onSave}){
  const [amt,setAmt]=useState(""), [cur,setCur]=useState("EUR"), [pin,setPin]=useState(""), [pin2,setPin2]=useState(""), [errs,setErrs]=useState({});
  const eur=parseFloat(amt)>0?(cur==="EUR"?parseFloat(amt):parseFloat(amt)/XAF):0;
  const cross=eur>0?(cur==="EUR"?fXaf(eur):fEur(eur)):"";
  const go=()=>{
    const e={};
    if(!eur||eur<=0)e.amt=t.eAmt;
    if(pin.length!==4)e.pin=t.ePIN;
    else if(pin!==pin2)e.pin2=t.ePINM;
    if(Object.keys(e).length){setErrs(e);return;}
    onSave(eur,pin);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:20}}><Logo big/><p style={{color:C.muted,fontSize:13,marginTop:10}}>{t.setupTitle}</p></div>
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <div style={{display:"flex",gap:8,marginBottom:13}}>
            {["EUR","XAF"].map(c=><button key={c} onClick={()=>setCur(c)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${cur===c?C.gold:C.border}`,background:cur===c?C.goldDim:"transparent",color:cur===c?C.gold:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{c==="EUR"?"🇪🇺 EUR":"🌍 XAF"}</button>)}
          </div>
          <Inp label={`${t.initialBank} ${cur}`} type="number" min="0" step="0.01" placeholder={cur==="EUR"?"500.00":"327978"} value={amt} onChange={e=>{setAmt(e.target.value);setErrs(x=>({...x,amt:null}));}} err={errs.amt}/>
          {cross&&<p style={{color:C.gold,fontSize:12,marginTop:-7,marginBottom:12,textAlign:"center"}}>= {cross}</p>}
          <div style={{borderTop:`1px solid ${C.border}`,margin:"13px 0"}}/>
          <p style={{color:C.sub,fontSize:12,marginBottom:9}}>🔐 {t.pinAdmin}</p>
          <Inp label={t.pinCreate} type="password" maxLength={4} inputMode="numeric" placeholder="••••" value={pin} onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setErrs(x=>({...x,pin:null}));}} err={errs.pin}/>
          <Inp label={t.pinConfirm} type="password" maxLength={4} inputMode="numeric" placeholder="••••" value={pin2} onChange={e=>{setPin2(e.target.value.replace(/\D/g,""));setErrs(x=>({...x,pin2:null}));}} style={{borderColor:pin2.length===4?(pin===pin2?C.green:C.red):C.border2}} err={errs.pin2}/>
          <Btn full style={{marginTop:6,padding:13}} onClick={go}>{t.setupBtn}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ BET CARD ═══════════════════════ */
function BetCard({bet,isAdmin,onStatus,onDelete,cur,t}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"12px 14px"}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}>
            <Badge status={bet.status} t={t}/>
            <span style={{background:bet.type==="combine"?"rgba(139,92,246,.12)":"rgba(6,182,212,.1)",color:bet.type==="combine"?"#a78bfa":C.accent,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>
              {bet.type==="combine"?t.combineL:t.simpleL}
            </span>
          </div>
          <div style={{color:C.white,fontWeight:700,fontSize:13,marginBottom:2,wordBreak:"break-word"}}>{bet.name}</div>
          <div style={{color:C.muted,fontSize:11}}>{fDate(bet.date)}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{color:C.sub,fontSize:10}}>{t.stakeLbl}</div>
          <div style={{color:C.white,fontWeight:700,fontSize:13}}>{fAmt(bet.stakeEur,cur)}</div>
          <div style={{color:C.green,fontSize:10,marginTop:2}}>→ {fAmt(bet.potentialGainEur,cur)}</div>
          <div style={{color:C.gold,fontSize:11,fontWeight:700}}>×{bet.totalCote}</div>
        </div>
      </div>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer",padding:"3px 0",marginTop:2}}>
        {open?t.reduce:t.details}
      </button>
      {open&&(
        <div style={{marginTop:8}}>
          {bet.selections.map((s,i)=>(
            <div key={i} style={{background:C.bg3,borderRadius:8,padding:"7px 10px",marginBottom:5,fontSize:12}}>
              <div style={{color:C.white,fontWeight:700}}>{s.homeTeam} vs {s.awayTeam}</div>
              <div style={{color:C.sub}}>{s.market} — ×{s.cote}</div>
            </div>
          ))}
          {bet.note&&<div style={{color:C.muted,fontSize:11,fontStyle:"italic",marginTop:4}}>📝 {bet.note}</div>}
        </div>
      )}
      {isAdmin&&bet.status==="pending"&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
          <Btn sm v="green" onClick={()=>onStatus(bet.id,"won")}>{t.markWon}</Btn>
          <Btn sm v="red" onClick={()=>onStatus(bet.id,"lost")}>{t.markLost}</Btn>
          <Btn sm v="ghost" onClick={()=>onStatus(bet.id,"refunded")}>{t.markRef}</Btn>
          <Btn sm v="ghost" onClick={()=>onDelete(bet.id)} style={{marginLeft:"auto",color:C.red}}>{t.del}</Btn>
        </div>
      )}
      {isAdmin&&bet.status!=="pending"&&(
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <Btn sm v="ghost" onClick={()=>onDelete(bet.id)} style={{color:C.red}}>{t.del}</Btn>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ DASHBOARD ═══════════════════════ */
function Dashboard({bankroll,initialBankroll,bets,isAdmin,onPage,onStatus,onDelete,cur,t}){
  const {won,resolved,totalStaked,netProfit,roi,wr}=calcPeriod(bets);
  const pending=bets.filter(b=>b.status==="pending");
  const totalReturned=won.reduce((a,b)=>a+b.potentialGainEur,0);
  const growth=initialBankroll>0?(bankroll-initialBankroll)/initialBankroll*100:0;
  const spark=[initialBankroll]; let r=initialBankroll;
  [...bets].filter(b=>b.status!=="pending").sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(b=>{
    if(b.status==="won")r+=b.potentialGainEur-b.stakeEur; else if(b.status==="lost")r-=b.stakeEur; spark.push(r);
  });
  return(
    <div style={{maxWidth:940,margin:"0 auto",padding:"14px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10}}>
        <div>
          <h2 style={{color:C.white,fontWeight:900,fontSize:"clamp(16px,4vw,22px)",margin:0}}>{t.dashTitle}</h2>
          <p style={{color:C.muted,fontSize:11,margin:"3px 0 0"}}>{isAdmin?t.dashAdmin:t.dashReadonly}</p>
        </div>
        {isAdmin&&<Btn onClick={()=>onPage("newbet")} sm>{t.addBet}</Btn>}
      </div>
      <div style={{background:"linear-gradient(135deg,rgba(245,158,11,.12),rgba(16,185,129,.06))",border:`1px solid ${C.goldBorder}`,borderRadius:18,padding:"16px 18px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{color:C.gold,fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>{t.dashBankroll}</div>
            <div style={{color:C.white,fontSize:"clamp(24px,6vw,42px)",fontWeight:900,letterSpacing:"-1px"}}>{cur==="XAF"?fXaf(bankroll):fEur(bankroll)}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:2}}>{cur==="XAF"?fEur(bankroll):fXaf(bankroll)}</div>
            <div style={{marginTop:5,display:"flex",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:growth>=0?C.greenBright:C.redBright,fontWeight:700}}>{growth>=0?"▲":"▼"} {Math.abs(growth).toFixed(2)}% {t.vsCapital}</span>
              <span style={{color:C.muted,fontSize:11}}>|</span>
              <span style={{fontSize:11,color:netProfit>=0?C.greenBright:C.redBright,fontWeight:700}}>{t.netProfit}: {netProfit>=0?"+":""}{fAmt(netProfit,cur)}</span>
            </div>
          </div>
          {spark.length>2&&<div style={{opacity:.8}}><Sparkline data={spark} color={spark[spark.length-1]>=spark[0]?C.green:C.red} height={50}/></div>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:13}}>
        <StatCard label={((t.staked||'').replace('💸 ',''))} value={fAmt(totalStaked,cur)} icon="💸"/>
        <StatCard label={((t.returned||'').replace('💵 ',''))} value={fAmt(totalReturned,cur)} icon="💵" color={C.greenBright}/>
        <StatCard label={t.netProfit} value={(netProfit>=0?"+":"")+fAmt(netProfit,cur)} icon="📈" color={netProfit>=0?C.greenBright:C.redBright} trend={roi}/>
        <StatCard label={((t.won||'').replace(' ✓',''))} value={`${wr.toFixed(1)}%`} icon="🎯" color={wr>=50?C.greenBright:C.redBright}/>
        <StatCard label={t.pending} value={pending.length} icon="⏳" color="#38bdf8"/>
      </div>
      <h3 style={{color:C.white,fontWeight:700,fontSize:14,margin:"0 0 10px"}}>{t.inProgress} ({pending.length})</h3>
      {pending.length===0
        ?<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"22px",textAlign:"center",color:C.muted}}>{t.noPending}{isAdmin&&<span onClick={()=>onPage("newbet")} style={{color:C.gold,cursor:"pointer"}}>{t.addHere}</span>}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {pending.slice(0,5).map(b=><BetCard key={b.id} bet={b} isAdmin={isAdmin} onStatus={onStatus} onDelete={onDelete} cur={cur} t={t}/>)}
          {pending.length>5&&<button onClick={()=>onPage("history")} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:13,padding:8}}>{t.seeAll}</button>}
        </div>
      }
    </div>
  );
}

/* ═══════════════════════ NEW BET ═══════════════════════ */
function NewBet({bankroll,onAdd,onBack,showToast,t,lang}){
  const [type,setType]=useState("simple"), [sels,setSels]=useState([{id:1,home:"",away:"",mkt:"gg",cote:""}]);
  const [stake,setStake]=useState(""), [stkCur,setStkCur]=useState("EUR");
  const [name,setName]=useState(""), [note,setNote]=useState("");
  const [betDate,setBetDate]=useState(todayISO()), [errs,setErrs]=useState({});
  const mkts=MARKETS[lang]||MARKETS.fr;
  const stakeEur=parseFloat(stake)>0?(stkCur==="EUR"?parseFloat(stake):parseFloat(stake)/XAF):0;
  const totalCote=sels.reduce((a,s)=>{const c=parseFloat(s.cote);return a*(isNaN(c)||c<=0?1:c);},1);
  const gain=stakeEur*totalCote, pct=bankroll>0?stakeEur/bankroll*100:0;
  const upd=(id,f,v)=>setSels(ss=>ss.map(s=>s.id===id?{...s,[f]:v}:s));
  const submit=()=>{
    const e={};
    if(stakeEur<=0)e.stake=t.eStake;
    sels.forEach((s,i)=>{if(!s.home.trim())e[`h${i}`]=t.eTeam;if(!s.away.trim())e[`a${i}`]=t.eTeam;if(!parseFloat(s.cote))e[`c${i}`]=t.eCote;});
    if(Object.keys(e).length){setErrs(e);return;}
    onAdd({id:Date.now().toString(),type,status:"pending",date:new Date(betDate).toISOString(),name:name.trim()||(type==="simple"?`${sels[0].home} vs ${sels[0].away}`:`${t.combineL} ${sels.length}`),selections:sels.map(s=>({homeTeam:s.home.trim(),awayTeam:s.away.trim(),market:mkts.find(m=>m.id===s.mkt)?.label||s.mkt,marketId:s.mkt,cote:parseFloat(s.cote)})),stakeEur,totalCote:parseFloat(totalCote.toFixed(3)),potentialGainEur:gain,note:note.trim()});
    showToast(t.tSaved,"success");
  };
  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"14px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:15}}>
        <button onClick={onBack} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,width:34,height:34,color:C.white,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
        <h2 style={{color:C.white,fontWeight:900,fontSize:19,margin:0}}>{t.newBetTitle}</h2>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:11}}>
        {[{id:"simple",l:t.simple},{id:"combine",l:t.combine}].map(tp=>(
          <button key={tp.id} onClick={()=>{setType(tp.id);setSels([{id:1,home:"",away:"",mkt:"gg",cote:""}]);}} style={{flex:1,padding:"11px",borderRadius:11,border:`2px solid ${type===tp.id?C.gold:C.border}`,background:type===tp.id?C.goldDim:C.bg2,color:type===tp.id?C.gold:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{tp.l}</button>
        ))}
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"12px 14px",marginBottom:9}}>
        <Inp label={t.betName} placeholder={t.betNamePh} value={name} onChange={e=>setName(e.target.value)}/>
        <Inp label={t.betDate} type="datetime-local" value={betDate} onChange={e=>setBetDate(e.target.value)}/>
      </div>
      {sels.map((s,idx)=>(
        <div key={s.id} style={{background:C.bg2,border:`1px solid ${(errs[`h${idx}`]||errs[`a${idx}`]||errs[`c${idx}`])?C.red:C.border}`,borderRadius:13,padding:"12px 13px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{color:C.gold,fontWeight:700,fontSize:12}}>{type==="combine"?`${t.match} ${idx+1}`:t.match}</span>
            {type==="combine"&&sels.length>1&&<button onClick={()=>setSels(ss=>ss.filter(x=>x.id!==s.id))} style={{background:C.redDim,border:"none",borderRadius:6,padding:"3px 9px",color:C.redBright,cursor:"pointer",fontSize:11}}>✕</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Inp label={t.home} placeholder="PSG" value={s.home} onChange={e=>{upd(s.id,"home",e.target.value);setErrs(x=>({...x,[`h${idx}`]:null}));}} err={errs[`h${idx}`]}/>
            <Inp label={t.away} placeholder="Lyon" value={s.away} onChange={e=>{upd(s.id,"away",e.target.value);setErrs(x=>({...x,[`a${idx}`]:null}));}} err={errs[`a${idx}`]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <Slct label={t.market} value={s.mkt} onChange={e=>upd(s.id,"mkt",e.target.value)}>{mkts.map(m=><option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}</Slct>
            <Inp label={t.cote} type="number" min="1" step="0.01" placeholder="1.85" value={s.cote} onChange={e=>{upd(s.id,"cote",e.target.value);setErrs(x=>({...x,[`c${idx}`]:null}));}} err={errs[`c${idx}`]}/>
          </div>
        </div>
      ))}
      {type==="combine"&&<button onClick={()=>setSels(ss=>[...ss,{id:Date.now(),home:"",away:"",mkt:"gg",cote:""}])} style={{width:"100%",padding:"11px",marginBottom:8,borderRadius:11,border:`2px dashed ${C.goldBorder}`,background:"transparent",color:C.gold,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{t.addMatch}</button>}
      <div style={{background:C.bg2,border:`1px solid ${errs.stake?C.red:C.border}`,borderRadius:13,padding:"12px 13px",marginBottom:8}}>
        <h4 style={{color:C.white,fontWeight:700,margin:"0 0 9px",fontSize:13}}>{t.stakeTitle}</h4>
        <div style={{display:"flex",gap:8,marginBottom:9}}>
          {["EUR","XAF"].map(c=><button key={c} onClick={()=>setStkCur(c)} style={{flex:1,padding:"8px",borderRadius:9,border:`2px solid ${stkCur===c?C.gold:C.border}`,background:stkCur===c?C.goldDim:"transparent",color:stkCur===c?C.gold:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{c}</button>)}
        </div>
        <Inp type="number" min="0" step="0.01" placeholder={stkCur==="EUR"?"10.00":"6560"} value={stake} onChange={e=>{setStake(e.target.value);setErrs(x=>({...x,stake:null}));}} err={errs.stake}/>
        {stakeEur>0&&(
          <div style={{background:C.bg3,borderRadius:9,padding:"10px 12px",fontSize:12}}>
            {[[t.stakeLbl,fEur(stakeEur)+" / "+fXaf(stakeEur),null],[t.totalCote,"×"+totalCote.toFixed(3),C.gold],[t.potGain,fEur(gain)+" / "+fXaf(gain),C.greenBright],[t.netIfWon,"+"+fEur(gain-stakeEur)+" / +"+fXaf(gain-stakeEur),C.green],[t.pctBank,pct.toFixed(1)+"%"+(pct>10?" ⚠️":""),pct>10?C.red:C.muted]].map(([l,v,c],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:i<4?5:0,paddingTop:i===2?7:0,borderTop:i===2?`1px solid ${C.border}`:"none"}}>
                <span style={{color:C.muted}}>{l}</span><span style={{color:c||C.white,fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"12px 13px",marginBottom:13}}>
        <Inp label={t.note} placeholder={t.notePh} value={note} onChange={e=>setNote(e.target.value)}/>
      </div>
      <Btn full style={{padding:14,fontSize:15}} onClick={submit}>{t.save}</Btn>
    </div>
  );
}

/* ═══════════════════════ HISTORY ═══════════════════════ */
function History({bets,isAdmin,onStatus,onDelete,cur,t}){
  const [st,setSt]=useState("all"), [tp,setTp]=useState("all"), [q,setQ]=useState("");
  const filtered=bets.filter(b=>{
    if(st!=="all"&&b.status!==st)return false;
    if(tp!=="all"&&b.type!==tp)return false;
    if(q){const s=q.toLowerCase();return b.name.toLowerCase().includes(s)||b.selections.some(x=>x.homeTeam.toLowerCase().includes(s)||x.awayTeam.toLowerCase().includes(s));}
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const FB=(active,val,setVal,l)=><button onClick={()=>setVal(val)} style={{padding:"6px 11px",borderRadius:20,border:`1.5px solid ${active===val?C.gold:C.border}`,background:active===val?C.goldDim:"transparent",color:active===val?C.gold:C.muted,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"}}>{l}</button>;
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"14px 12px"}}>
      <h2 style={{color:C.white,fontWeight:900,fontSize:"clamp(16px,4vw,22px)",margin:"0 0 12px"}}>{t.histTitle}</h2>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,padding:"9px 13px",color:C.white,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:9}}/>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
        {FB(st,"all",setSt,t.all)}{FB(st,"pending",setSt,t.pendingF)}{FB(st,"won",setSt,t.wonF)}{FB(st,"lost",setSt,t.lostF)}{FB(st,"refunded",setSt,t.refundedF)}
        <div style={{width:1,background:C.border,margin:"0 2px"}}/>
        {FB(tp,"all",setTp,t.allTypes)}{FB(tp,"simple",setTp,t.simples)}{FB(tp,"combine",setTp,t.combines)}
      </div>
      <div style={{color:C.muted,fontSize:11,marginBottom:9}}>{t.results(filtered.length)}</div>
      {filtered.length===0?<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,padding:"22px",textAlign:"center",color:C.muted}}>{t.noResult}</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{filtered.map(b=><BetCard key={b.id} bet={b} isAdmin={isAdmin} onStatus={onStatus} onDelete={onDelete} cur={cur} t={t}/>)}</div>}
    </div>
  );
}

/* ═══════════════════════ STATS ═══════════════════════ */
function Stats({bets,bankroll,initialBankroll,cur,t}){
  const won=bets.filter(b=>b.status==="won"), lost=bets.filter(b=>b.status==="lost");
  const pending=bets.filter(b=>b.status==="pending"), refunded=bets.filter(b=>b.status==="refunded");
  const resolved=[...won,...lost];
  const {totalStaked,totalReturned,netProfit,roi,wr}=calcPeriod(bets);
  const avgCote=resolved.length>0?resolved.reduce((a,b)=>a+b.totalCote,0)/resolved.length:0;
  const avgStake=resolved.length>0?totalStaked/resolved.length:0;
  const growth=initialBankroll>0?(bankroll-initialBankroll)/initialBankroll*100:0;
  const grossWin=won.reduce((a,b)=>a+(b.potentialGainEur-b.stakeEur),0);
  const grossLoss=lost.reduce((a,b)=>a+b.stakeEur,0);
  const pf=grossLoss>0?grossWin/grossLoss:grossWin>0?Infinity:0;
  let peak=initialBankroll,runDD=initialBankroll,maxDD=0;
  [...bets].filter(b=>b.status!=="pending").sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(b=>{
    if(b.status==="won")runDD+=b.potentialGainEur-b.stakeEur;else if(b.status==="lost")runDD-=b.stakeEur;
    if(runDD>peak)peak=runDD; const dd=peak>0?(peak-runDD)/peak*100:0; if(dd>maxDD)maxDD=dd;
  });
  const sorted2=[...resolved].sort((a,b)=>new Date(b.date)-new Date(a.date));
  let streak=0,streakType=null;
  for(const b of sorted2){if(!streakType)streakType=b.status;if(b.status===streakType)streak++;else break;}
  const spark=[initialBankroll]; let r2=initialBankroll;
  [...bets].filter(b=>b.status!=="pending").sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(b=>{
    if(b.status==="won")r2+=b.potentialGainEur-b.stakeEur;else if(b.status==="lost")r2-=b.stakeEur;spark.push(r2);
  });
  const mkts={};
  bets.forEach(b=>{if(b.status==="pending"||b.status==="refunded")return;b.selections.forEach(s=>{if(!mkts[s.market])mkts[s.market]={w:0,l:0,n:0,staked:0,returned:0};mkts[s.market].n++;if(b.status==="won"){mkts[s.market].w++;mkts[s.market].returned+=b.potentialGainEur;}else mkts[s.market].l++;mkts[s.market].staked+=b.stakeEur;});});
  return(
    <div style={{maxWidth:940,margin:"0 auto",padding:"14px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <h2 style={{color:C.white,fontWeight:900,fontSize:"clamp(16px,4vw,22px)",margin:0}}>{t.statsTitle}</h2>
        <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:"3px 10px",fontSize:11,color:C.gold,fontWeight:700}}>{t.tradingBadge}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:13}}>
        <StatCard label="Bankroll départ" value={fAmt(initialBankroll,cur)} icon="🏦" color={C.gold} sub={cur==="XAF"?fEur(initialBankroll):fXaf(initialBankroll)}/>
        <StatCard label="Bankroll actuelle" value={fAmt(bankroll,cur)} icon="💰" color={growth>=0?C.greenBright:C.redBright} sub={cur==="XAF"?fEur(bankroll):fXaf(bankroll)} trend={growth}/>
        <StatCard label={t.netProfit} value={(netProfit>=0?"+":"")+fAmt(netProfit,cur)} icon="📈" color={netProfit>=0?C.greenBright:C.redBright} trend={roi} spark={spark.length>2?spark:null}/>
        <StatCard label="ROI" value={fPct(roi)} icon="🎯" color={roi>=0?C.greenBright:C.redBright}/>
        <StatCard label={((t.won||'').replace(' ✓',''))} value={`${wr.toFixed(1)}%`} icon="✅" color={wr>=50?C.greenBright:C.redBright}/>
        <StatCard label={((t.staked||'').replace('💸 ',''))} value={fAmt(totalStaked,cur)} icon="💸"/>
        <StatCard label={((t.returned||'').replace('💵 ',''))} value={fAmt(totalReturned,cur)} icon="💵" color={C.greenBright}/>
        <StatCard label="Profit factor" value={isFinite(pf)?pf.toFixed(2):"∞"} icon="⚡" color={pf>=1?C.greenBright:C.redBright}/>
        <StatCard label="Max Drawdown" value={`${maxDD.toFixed(1)}%`} icon="📉" color={maxDD>20?C.redBright:C.orange}/>
        <StatCard label="Streak" value={`${streak} ${streakType==="won"?"✓":"✗"}`} icon="🔥" color={streakType==="won"?C.greenBright:C.redBright}/>
        <StatCard label={t.totalBets} value={bets.length} icon="📋"/>
        <StatCard label={(t.wonF||'')} value={won.length} icon="🟢" color={C.greenBright}/>
        <StatCard label={(t.lostF||'')} value={lost.length} icon="🔴" color={C.redBright}/>
        <StatCard label={t.pendingF} value={pending.length} icon="⏳" color="#38bdf8"/>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px",marginBottom:11}}>
        <h4 style={{color:C.white,fontWeight:700,margin:"0 0 11px"}}>{t.simple} vs {t.combine}</h4>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {["simple","combine"].map(tp=>{
            const tb=resolved.filter(b=>b.type===tp),tw=tb.filter(b=>b.status==="won");
            const twr=tb.length>0?tw.length/tb.length*100:0,tp2=calcPeriod(bets.filter(b=>b.type===tp));
            return(<div key={tp} style={{background:C.bg3,borderRadius:10,padding:"11px 12px"}}>
              <div style={{color:C.white,fontWeight:700,fontSize:13,marginBottom:7}}>{tp==="simple"?t.simple:t.combine}</div>
              {[["#",tb.length,C.white],[t.wonF,tw.length,C.greenBright],[t.lostF,tb.length-tw.length,C.redBright],[t.netProfit,(tp2.netProfit>=0?"+":"")+fAmt(tp2.netProfit,cur),tp2.netProfit>=0?C.greenBright:C.redBright],["ROI",fPct(tp2.roi),tp2.roi>=0?C.greenBright:C.redBright]].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>
              ))}
              <div style={{height:4,background:C.bg,borderRadius:4,overflow:"hidden",marginTop:7}}><div style={{height:"100%",width:twr+"%",background:twr>=50?C.green:C.red,borderRadius:4}}/></div>
              <div style={{color:twr>=50?C.greenBright:C.redBright,fontSize:11,fontWeight:700,marginTop:3}}>{twr.toFixed(1)}%</div>
            </div>);
          })}
        </div>
      </div>
      {Object.keys(mkts).length>0&&(
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px"}}>
          <h4 style={{color:C.white,fontWeight:700,margin:"0 0 11px"}}>{t.market}</h4>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(mkts).sort((a,b)=>b[1].n-a[1].n).map(([mkt,s])=>{
              const wr2=s.n>0?s.w/s.n*100:0,net=s.returned-s.staked;
              return(<div key={mkt}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3,flexWrap:"wrap",gap:4}}><span style={{color:C.white,fontSize:12,fontWeight:600}}>{mkt}</span><div style={{display:"flex",gap:9,fontSize:11}}><span style={{color:C.sub}}>{s.w}W/{s.l}L</span><span style={{color:net>=0?C.greenBright:C.redBright,fontWeight:700}}>{net>=0?"+":""}{fAmt(net,cur)}</span></div></div><div style={{height:4,background:C.bg3,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:wr2+"%",background:wr2>=50?C.green:C.red,borderRadius:4}}/></div></div>);
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ BILAN ═══════════════════════ */
function PeriodBilan({label,bets,cur,t,defaultOpen=false}){
  const [open,setOpen]=useState(defaultOpen);
  const {won,lost,resolved,totalStaked,totalReturned,grossProfit,netProfit,roi,wr}=calcPeriod(bets);
  const pending=bets.filter(b=>b.status==="pending");
  const pc=netProfit>=0?C.greenBright:C.redBright;
  return(
    <div style={{background:C.bg2,border:`1px solid ${netProfit>=0?"rgba(16,185,129,.18)":"rgba(239,68,68,.13)"}`,borderRadius:14,marginBottom:8,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <div style={{textAlign:"left"}}>
          <div style={{color:C.white,fontWeight:700,fontSize:13}}>{label}</div>
          <div style={{color:C.muted,fontSize:11,marginTop:2}}>{bets.length} · {resolved.length} ✓ · {pending.length} ⏳</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:pc,fontWeight:800,fontSize:15}}>{netProfit>=0?"+":""}{fAmt(netProfit,cur)}</div>
            <div style={{color:C.muted,fontSize:10}}>{t.netProfit}</div>
          </div>
          <div style={{background:wr>=50?C.greenDim:C.redDim,border:`1px solid ${wr>=50?C.green:C.red}30`,borderRadius:8,padding:"3px 7px",fontSize:11,fontWeight:700,color:wr>=50?C.greenBright:C.redBright}}>{wr.toFixed(0)}%</div>
          <span style={{color:C.muted,fontSize:12}}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"13px 15px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:7,marginBottom:12}}>
            {[{l:t.staked,v:fAmt(totalStaked,cur),c:C.white,s:cur==="XAF"?fEur(totalStaked):fXaf(totalStaked)},{l:t.returned,v:fAmt(totalReturned,cur),c:C.greenBright,s:cur==="XAF"?fEur(totalReturned):fXaf(totalReturned)},{l:t.grossP,v:(grossProfit>=0?"+":"")+fAmt(grossProfit,cur),c:grossProfit>=0?C.greenBright:C.redBright},{l:t.netP,v:(netProfit>=0?"+":"")+fAmt(netProfit,cur),c:pc},{l:t.roiP,v:fPct(roi),c:roi>=0?C.greenBright:C.redBright},{l:t.wonF,v:won.length,c:C.greenBright},{l:t.lostF,v:lost.length,c:C.redBright},{l:t.pendingF,v:pending.length,c:"#38bdf8"}].map((s,i)=>(
              <div key={i} style={{background:C.bg3,borderRadius:9,padding:"9px 11px"}}>
                <div style={{color:C.muted,fontSize:10,marginBottom:3}}>{s.l}</div>
                <div style={{color:s.c,fontWeight:800,fontSize:13}}>{s.v}</div>
                {s.s&&<div style={{color:C.muted,fontSize:9,marginTop:2}}>{s.s}</div>}
              </div>
            ))}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}><span>{((t.wonF||'').replace(' ✓',''))}</span><span style={{color:wr>=50?C.greenBright:C.redBright,fontWeight:700}}>{wr.toFixed(1)}%</span></div>
            <div style={{height:5,background:C.bg,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:wr+"%",background:wr>=50?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)",borderRadius:5}}/></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {bets.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).map(b=>(
              <div key={b.id} style={{background:C.bg3,borderRadius:8,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div style={{minWidth:0,flex:1}}><div style={{color:C.white,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div><div style={{color:C.muted,fontSize:10}}>{fShortDate(b.date)}</div></div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <div style={{textAlign:"right"}}><div style={{color:C.white,fontSize:11,fontWeight:600}}>{fAmt(b.stakeEur,cur)}</div>{b.status==="won"&&<div style={{color:C.greenBright,fontSize:10}}>+{fAmt(b.potentialGainEur-b.stakeEur,cur)}</div>}{b.status==="lost"&&<div style={{color:C.redBright,fontSize:10}}>-{fAmt(b.stakeEur,cur)}</div>}</div>
                  <Badge status={b.status} t={t}/>
                </div>
              </div>
            ))}
            {bets.length>10&&<div style={{color:C.muted,fontSize:11,textAlign:"center",padding:4}}>+{bets.length-10}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Bilan({bets,cur,t}){
  const [view,setView]=useState("month");
  const groups={};
  bets.forEach(b=>{ const k=view==="week"?getWeekKey(b.date):getMonthKey(b.date); if(!groups[k])groups[k]=[]; groups[k].push(b); });
  const sorted=Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0]));
  const labelFn=view==="week"?t.wLabel:t.mLabel;
  const {totalStaked,netProfit}=calcPeriod(bets);
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"14px 12px"}}>
      <h2 style={{color:C.white,fontWeight:900,fontSize:"clamp(16px,4vw,22px)",margin:"0 0 12px"}}>{t.bilanTitle}</h2>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 15px",marginBottom:12,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:9}}>
        {[{l:t.staked,v:fAmt(totalStaked,cur)},{l:t.globalNet,v:(netProfit>=0?"+":"")+fAmt(netProfit,cur),c:netProfit>=0?C.greenBright:C.redBright},{l:t.totalBets,v:bets.length},{l:t.periods,v:sorted.length}].map((s,i)=>(
          <div key={i}><div style={{color:C.muted,fontSize:10,marginBottom:2}}>{s.l}</div><div style={{color:s.c||C.white,fontWeight:800,fontSize:14}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{id:"month",l:t.byMonth},{id:"week",l:t.byWeek}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"9px 15px",borderRadius:10,border:`2px solid ${view===v.id?C.gold:C.border}`,background:view===v.id?C.goldDim:C.bg2,color:view===v.id?C.gold:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{v.l}</button>
        ))}
      </div>
      {sorted.length===0?<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"26px",textAlign:"center",color:C.muted}}>{t.noData}</div>:sorted.map(([k,bs],i)=><PeriodBilan key={k} label={labelFn(k)} bets={bs} cur={cur} t={t} defaultOpen={i===0}/>)}
    </div>
  );
}

/* ═══════════════════════ SETTINGS ═══════════════════════ */
function Settings({bankroll,onUpdateBankroll,onResetRequest,onChangePin,cur,onCurChange,lang,onLangChange,showToast,t}){
  const [amt,setAmt]=useState(""), [amtCur,setAmtCur]=useState("EUR"), [mode,setMode]=useState("set");
  const [np,setNp]=useState(""), [np2,setNp2]=useState(""), [pe,setPe]=useState({});
  const apply=()=>{ const n=parseFloat(amt); if(!n||n<=0)return; onUpdateBankroll(amtCur==="EUR"?n:n/XAF,mode); setAmt(""); showToast(t.tBank,"success"); };
  const chgPin=()=>{ const e={}; if(np.length!==4)e.np=t.ePIN; else if(np!==np2)e.np2=t.ePINM; if(Object.keys(e).length){setPe(e);return;} onChangePin(np); setNp(""); setNp2(""); setPe({}); showToast(t.tPIN,"success"); };
  return(
    <div style={{maxWidth:580,margin:"0 auto",padding:"14px 12px"}}>
      <h2 style={{color:C.white,fontWeight:900,fontSize:"clamp(16px,4vw,22px)",margin:"0 0 12px"}}>{t.settingsTitle}</h2>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px",marginBottom:9}}>
        <h4 style={{color:C.white,margin:"0 0 9px"}}>🌍 Langue / Language</h4>
        <LangSwitcher lang={lang} setLang={onLangChange}/>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px",marginBottom:9}}>
        <h4 style={{color:C.white,margin:"0 0 9px"}}>{t.displayCur}</h4>
        <div style={{display:"flex",gap:8}}>{["EUR","XAF"].map(c=><button key={c} onClick={()=>onCurChange(c)} style={{flex:1,padding:"11px",borderRadius:10,border:`2px solid ${cur===c?C.gold:C.border}`,background:cur===c?C.goldDim:C.bg3,color:cur===c?C.gold:C.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{c==="EUR"?"🇪🇺 EUR":"🌍 XAF"}</button>)}</div>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px",marginBottom:9}}>
        <h4 style={{color:C.white,margin:"0 0 4px"}}>{t.bankrollLbl}</h4>
        <div style={{color:C.gold,fontWeight:800,fontSize:18,marginBottom:11}}>{fEur(bankroll)} / {fXaf(bankroll)}</div>
        <div style={{display:"flex",gap:6,marginBottom:9}}>{[[" set",t.define],["add",t.addAmt],["subtract",t.subAmt]].map(([id,l])=><button key={id} onClick={()=>setMode(id.trim())} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${mode===id.trim()?C.gold:C.border}`,background:mode===id.trim()?C.goldDim:"transparent",color:mode===id.trim()?C.gold:C.muted,fontWeight:700,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{l}</button>)}</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>{["EUR","XAF"].map(c=><button key={c} onClick={()=>setAmtCur(c)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${amtCur===c?"#38bdf8":C.border}`,background:amtCur===c?"rgba(56,189,248,.1)":"transparent",color:amtCur===c?"#38bdf8":C.muted,fontWeight:600,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{c}</button>)}</div>
        <Inp type="number" min="0" step="0.01" placeholder="..." value={amt} onChange={e=>setAmt(e.target.value)}/>
        <Btn full onClick={apply}>{t.update}</Btn>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px",marginBottom:9}}>
        <h4 style={{color:C.white,margin:"0 0 8px"}}>{t.changePIN}</h4>
        <Inp label={t.newPIN} type="password" maxLength={4} inputMode="numeric" placeholder="••••" value={np} onChange={e=>{setNp(e.target.value.replace(/\D/g,""));setPe(x=>({...x,np:null}));}} err={pe.np}/>
        <Inp label={t.confirmPINLbl} type="password" maxLength={4} inputMode="numeric" placeholder="••••" value={np2} onChange={e=>{setNp2(e.target.value.replace(/\D/g,""));setPe(x=>({...x,np2:null}));}} style={{borderColor:np2.length===4?(np===np2?C.green:C.red):C.border2}} err={pe.np2}/>
        <Btn full v="ghost" onClick={chgPin}>{t.updatePIN}</Btn>
      </div>
      <div style={{background:C.bg2,border:"1px solid rgba(239,68,68,.2)",borderRadius:14,padding:"13px 15px"}}>
        <h4 style={{color:C.red,margin:"0 0 6px"}}>{t.dangerZone}</h4>
        <p style={{color:C.muted,fontSize:12,marginBottom:10,lineHeight:1.6}}>{t.dangerText}</p>
        <Btn v="red" full onClick={onResetRequest}>{t.resetBtn}</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function App(){
  const [page,setPage]=useState("landing");
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [isAdmin,setIsAdmin]=useState(false);
  const [showPin,setShowPin]=useState(false);
  const [pendingPage,setPendingPage]=useState(null);
  const [cur,setCur]=useState("EUR");
  const [lang,setLang]=useState("fr");
  const [confirmCfg,setConfirmCfg]=useState(null);
  const confirmCb=useRef(null);
  const [toast,setToast]=useState({msg:"",type:""});
  const [menuOpen,setMenuOpen]=useState(false);
  const t=T[lang];

  const showToast=(msg,type="info")=>setToast({msg,type});
  const closeToast=()=>setToast({msg:"",type:""});
  const askConfirm=(cfg,onOk)=>{ setConfirmCfg(cfg); confirmCb.current=onOk; };
  const handleConfirmOk=()=>{ setConfirmCfg(null); confirmCb.current&&confirmCb.current(); confirmCb.current=null; };
  const handleConfirmCancel=()=>{ setConfirmCfg(null); confirmCb.current=null; };

  useEffect(()=>{ loadData().then(d=>{
    if(d){ setData(d); if(d.lang)setLang(d.lang); if(d.cur)setCur(d.cur); }
    else {
      // Auto-init empty data so public users always see dashboard
      const empty={bankroll:{eur:0,initial:0,setup:false},bets:[],pin:DEFAULT_PIN,lang:"fr",cur:"EUR"};
      setData(empty); saveData(empty);
    }
    setLoading(false);
  }); },[]);

  const persist=useCallback(nd=>{ setData(nd); saveData(nd); },[]);

  const checkPin=(entered,onFail)=>{
    if(entered===(data?.pin||DEFAULT_PIN)){ setIsAdmin(true); setShowPin(false); if(pendingPage){setPage(pendingPage);setPendingPage(null);} showToast(t.tAdmin,"success"); }
    else if(onFail)onFail();
  };
  const navTo=p=>{ setMenuOpen(false); if(p==="newbet"||p==="settings"){if(isAdmin){setPage(p);return;} setPendingPage(p);setShowPin(true);return;} setPage(p); };
  const handleSetup=(eur,pin)=>{ persist({bankroll:{eur,initial:eur,setup:true},bets:[],pin,lang,cur}); setIsAdmin(true); setPage("dashboard"); };
  const handleAddBet=bet=>{ persist({...data,bets:[bet,...(data.bets||[])]}); setPage("dashboard"); };
  const handleStatus=(id,status)=>{
    const bet=data.bets.find(b=>b.id===id); if(!bet)return;
    let br=data.bankroll.eur;
    if(status==="won")br+=bet.potentialGainEur-bet.stakeEur;
    else if(status==="lost")br-=bet.stakeEur;
    persist({...data,bankroll:{...data.bankroll,eur:br},bets:data.bets.map(b=>b.id===id?{...b,status}:b)});
    showToast({won:t.tWon,lost:t.tLost,refunded:t.tRef}[status]||"",status==="won"?"success":"error");
  };
  const handleDelete=id=>{ askConfirm({title:t.confirmDelTitle,message:t.confirmDelMsg,okLabel:t.confirmDelOk},()=>{ persist({...data,bets:data.bets.filter(b=>b.id!==id)}); showToast(t.tDel,"error"); }); };
  const handleUpdateBankroll=(eur,mode)=>{ let n=data.bankroll.eur; if(mode==="set")n=eur;else if(mode==="add")n+=eur;else n=Math.max(0,n-eur); const wasEmpty=!data.bankroll.initial||data.bankroll.initial===0; persist({...data,bankroll:{...data.bankroll,eur:n,initial:wasEmpty&&mode==="set"?n:data.bankroll.initial,setup:true}}); };
  const handleResetRequest=()=>{ askConfirm({title:t.confirmResetTitle,message:t.confirmResetMsg,okLabel:t.confirmResetOk},()=>{ persist({bankroll:{eur:0,initial:0,setup:false},bets:[],pin:data?.pin||DEFAULT_PIN}); setIsAdmin(false); setPage("landing"); showToast(t.tReset,"error"); }); };
  const handleLangChange=l=>{ setLang(l); if(data)persist({...data,lang:l}); };
  const handleCurChange=c=>{ setCur(c); if(data)persist({...data,cur:c}); };

  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.gold,fontSize:22}}>⏳</div></div>;
  if(page==="landing")return <Landing t={t} lang={lang} setLang={handleLangChange} onEnter={()=>setPage("dashboard")}/>;
  // Setup page removed - admin sets bankroll in Settings

  const bankroll=data?.bankroll?.eur||0, bets=data?.bets||[];
  const NAV=[{id:"dashboard",icon:"🏠",label:t.navD,short:"Home"},{id:"history",icon:"📁",label:t.navH,short:"Hist."},{id:"stats",icon:"📊",label:t.navS,short:"Stats"},{id:"bilan",icon:"📅",label:t.navB,short:"Bilan"},{id:"newbet",icon:"➕",label:t.navN,short:"Pari",admin:true},{id:"settings",icon:"⚙️",label:t.navSet,short:"⚙️",admin:true}];

  const AccessDenied=()=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,textAlign:"center",padding:"26px 20px",maxWidth:300}}>
        <div style={{fontSize:40,marginBottom:10}}>🔐</div>
        <h3 style={{color:C.white,fontWeight:800,margin:"0 0 6px"}}>{t.accessRequired}</h3>
        <p style={{color:C.muted,fontSize:13,marginBottom:16}}>{t.accessSub}</p>
        <Btn full onClick={()=>setShowPin(true)}>{t.login}</Btn>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        .mob-top{display:flex;}.desk-nav{display:none;}.bot-nav{display:flex;}
        @media(min-width:640px){.mob-top{display:none!important;}.desk-nav{display:block!important;}.bot-nav{display:none!important;}}
        input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.5;cursor:pointer;}
        input:focus,select:focus{border-color:rgba(245,158,11,.5)!important;box-shadow:0 0 0 3px rgba(245,158,11,.07);}
        ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px;}
      `}</style>

      <ConfirmModal config={confirmCfg} t={t} onOk={handleConfirmOk} onCancel={handleConfirmCancel}/>
      {showPin&&<PinModal t={t} onSuccess={checkPin} onCancel={()=>{setShowPin(false);setPendingPage(null);}}/>}
      <Toast msg={toast.msg} type={toast.type} onClose={closeToast}/>

      {/* Mobile top bar */}
      <div className="mob-top" style={{position:"sticky",top:0,zIndex:90,background:"rgba(6,14,26,.97)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"10px 14px",alignItems:"center",justifyContent:"space-between"}}>
        <Logo/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:C.gold,fontWeight:800,fontSize:14}}>{cur==="XAF"?fXaf(bankroll):fEur(bankroll)}</div>
            <div style={{color:C.muted,fontSize:10}}>{cur==="XAF"?fEur(bankroll):fXaf(bankroll)}</div>
          </div>
          {isAdmin
            ?<button onClick={()=>setIsAdmin(false)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:20,padding:"5px 10px",color:"#a78bfa",fontSize:11,fontWeight:700,cursor:"pointer"}}>🔐</button>
            :<button onClick={()=>setShowPin(true)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 10px",color:C.muted,fontSize:11,cursor:"pointer"}}>🔒</button>
          }
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="desk-nav" style={{position:"sticky",top:0,zIndex:90,background:"rgba(6,14,26,.96)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center"}}>
          <div style={{padding:"12px 0",marginRight:20,cursor:"pointer"}} onClick={()=>setPage("dashboard")}><Logo/></div>
          <div style={{display:"flex",flex:1,gap:0,overflowX:"auto"}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>navTo(n.id)} style={{padding:"15px 12px",background:"none",border:"none",borderBottom:`2px solid ${page===n.id?C.gold:"transparent"}`,color:page===n.id?C.gold:n.admin?"#a78bfa":C.muted,fontWeight:page===n.id?700:500,cursor:"pointer",fontSize:13,fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
                {n.icon} {n.label}{n.admin&&!isAdmin&&<span style={{fontSize:9,opacity:.5}}>🔒</span>}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:12,flexShrink:0}}>
            <LangSwitcher lang={lang} setLang={handleLangChange}/>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.gold,fontWeight:800,fontSize:14}}>{cur==="XAF"?fXaf(bankroll):fEur(bankroll)}</div>
              <div style={{color:C.muted,fontSize:10}}>{cur==="XAF"?fEur(bankroll):fXaf(bankroll)}</div>
            </div>
            {isAdmin?<button onClick={()=>setIsAdmin(false)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:20,padding:"4px 10px",color:"#a78bfa",fontSize:11,fontWeight:700,cursor:"pointer"}}>🔐 Admin</button>:<button onClick={()=>setShowPin(true)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 10px",color:C.muted,fontSize:11,cursor:"pointer"}}>🔒 {t.login}</button>}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{paddingBottom:80}}>
        {page==="dashboard"&&<Dashboard bankroll={bankroll} initialBankroll={data?.bankroll?.initial||bankroll} bets={bets} isAdmin={isAdmin} onPage={navTo} onStatus={handleStatus} onDelete={handleDelete} cur={cur} t={t}/>}
        {page==="newbet"&&(isAdmin?<NewBet bankroll={bankroll} onAdd={handleAddBet} onBack={()=>setPage("dashboard")} showToast={showToast} t={t} lang={lang}/>:<AccessDenied/>)}
        {page==="history"&&<History bets={bets} isAdmin={isAdmin} onStatus={handleStatus} onDelete={handleDelete} cur={cur} t={t}/>}
        {page==="stats"&&<Stats bets={bets} bankroll={bankroll} initialBankroll={data?.bankroll?.initial||bankroll} cur={cur} t={t}/>}
        {page==="bilan"&&<Bilan bets={bets} cur={cur} t={t}/>}
        {page==="settings"&&(isAdmin?<Settings bankroll={bankroll} onUpdateBankroll={handleUpdateBankroll} onResetRequest={handleResetRequest} onChangePin={p=>persist({...data,pin:p})} cur={cur} onCurChange={handleCurChange} lang={lang} onLangChange={handleLangChange} showToast={showToast} t={t}/>:<AccessDenied/>)}
      </main>

      {/* Mobile bottom bar with hamburger */}
      <div className="bot-nav" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,background:"rgba(6,14,26,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${C.border}`,display:"none",paddingBottom:"env(safe-area-inset-bottom,0)",alignItems:"center",justifyContent:"space-around",padding:"8px 10px"}}>
        {/* Quick access: 3 main pages */}
        {[NAV[0],NAV[1],NAV[2]].map(n=>(
          <button key={n.id} onClick={()=>{navTo(n.id);setMenuOpen(false);}} style={{flex:1,padding:"6px 2px",background:"none",border:"none",color:page===n.id?C.gold:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            <span style={{fontSize:22,lineHeight:1}}>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:page===n.id?700:400,color:"inherit"}}>{n.short||n.label}</span>
            {page===n.id&&<div style={{position:"absolute",bottom:-2,left:"50%",transform:"translateX(-50%)",width:18,height:2,background:C.gold,borderRadius:2}}/>}
          </button>
        ))}
        {/* Hamburger menu button */}
        <button onClick={()=>setMenuOpen(o=>!o)} style={{flex:1,padding:"6px 2px",background:"none",border:"none",color:menuOpen?C.gold:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:22,lineHeight:1}}>{menuOpen?"✕":"☰"}</span>
          <span style={{fontSize:9,color:"inherit"}}>Menu</span>
        </button>
      </div>

      {/* Mobile slide-up menu */}
      {menuOpen&&<div style={{position:"fixed",inset:0,zIndex:89,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={()=>setMenuOpen(false)}/>}
      <div className="bot-nav" style={{position:"fixed",bottom:menuOpen?60:"-100%",left:0,right:0,zIndex:89,background:"rgba(6,14,26,.99)",backdropFilter:"blur(20px)",borderTop:`2px solid ${C.goldBorder}`,borderRadius:"20px 20px 0 0",display:"none",flexDirection:"column",padding:"16px 16px calc(env(safe-area-inset-bottom,0px) + 16px)",gap:8,transition:"bottom .3s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{textAlign:"center",marginBottom:4}}>
          <div style={{width:36,height:3,background:C.border2,borderRadius:3,margin:"0 auto 10px"}}/>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Navigation</div>
        </div>
        {NAV.slice(2).map(n=>(
          <button key={n.id} onClick={()=>{navTo(n.id);setMenuOpen(false);}} style={{width:"100%",padding:"13px 16px",background:page===n.id?C.goldDim:C.bg2,border:`1px solid ${page===n.id?C.goldBorder:C.border}`,borderRadius:12,color:page===n.id?C.gold:n.admin?(isAdmin?"#a78bfa":C.muted):C.white,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,fontSize:15,fontWeight:page===n.id?700:500,textAlign:"left"}}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.admin&&!isAdmin&&<span style={{fontSize:11,color:C.muted}}>🔒</span>}
            {page===n.id&&<span style={{fontSize:11,color:C.gold}}>●</span>}
          </button>
        ))}
        {isAdmin&&(
          <button onClick={()=>{setIsAdmin(false);setMenuOpen(false);}} style={{width:"100%",padding:"11px 16px",background:"transparent",border:`1px solid rgba(139,92,246,.2)`,borderRadius:12,color:"#a78bfa",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginTop:4}}>
            🔐 Déconnexion admin
          </button>
        )}
      </div>
    </div>
  );
}
