// Metodoloģija un izdevējs (/metodologija/, #104): kopsavilkums lasītājam ar saitēm uz pilnajiem dokumentiem repo.
// Skaitļi (avotu tabula) — no data/ build laikā, ne tekstā.
import { html } from "../html.js";
import { VELESANU_DIENA } from "../../tools/lib/dati.js";
import { izkartojums, statussPill, datums } from "./izkartojums.js";
import { avotaNosaukums } from "./avoti.js";
import { REPO, repoFails, kludasSaite, METODOLOGIJA } from "./saites.js";

const METODE = repoFails("docs/ekstrakcija/metode.md");
const VERTESANA = repoFails("docs/statusi/vertesana.md");

// Par! un Progresīvie (#106, 5. punkts; pārbaudīts 12.10.2026) — tikai pārbaudītais. CVK datos nav partijas piederības lauka,
// tāpēc skaitīti kandidāti, kas paši norādījuši amatu Kustībā Par!; ievēlētie vēl nav publicēti (dati.cvk.lv), par tiem neraksta.
const PAR_UN_PRO = html`„Kustība Par!” 15. Saeimas vēlēšanās sadarbojās ar Progresīvajiem: Par! pārstāvji kandidēja Progresīvo sarakstā (<a href="https://kustibapar.lv/2026/06/26/kustiba-par-15-saeimas-velesanas-sadarbosies-ar-partiju-progresivie-mes-talsiem-un-novadam-un-kopa-liepajai/">Kustības Par!</a> un <a href="https://progresivie.lv/jaunumi/sadarbibas-partneri">Progresīvo</a> paziņojumi, 26.06.2026). <a href="https://dati.cvk.lv/SV2026/kandidatu-saraksti/progresivie/">CVK datos</a> 8 no 125 Progresīvo kandidātiem norādījuši amatu Kustībā Par!.`;

const SADALAS = [
  ["par", "Kas ir ko-sola.lv"],
  ["atlase", "Kā atlasīti solījumi"],
  ["avoti", "Avoti pa sarakstiem"],
  ["vertesana", "Kā vērtē Statusu"],
  ["ai", "AI loma"],
  ["izdevejs", "Izdevējs un interešu konflikts"],
  ["neitralitate", "Kā nodrošināta neitralitāte"],
  ["kludas", "Kā ziņot par kļūdu"],
];

const virsraksts = (id) => {
  const i = SADALAS.findIndex(([x]) => x === id);
  return html`<h2 id="${id}-v">${i + 1}. ${SADALAS[i][1]}</h2>`;
};
const sadala = (id, saturs) => html`<section class="sadala" id="${id}" aria-labelledby="${id}-v">${virsraksts(id)}${saturs}</section>`;

/** Saraksts × avoti × Solījumi × Nepārbaudāmie — no data/saraksti.yaml un Solījumiem. */
function avotuTabula(m) {
  const rindas = m.saraksti.map((s) => {
    const solijumi = m.solijumi.filter((x) => x.saraksts.slug === s.slug);
    return { s, n: solijumi.length, neparbaudami: solijumi.filter((x) => !x.parbaudams).length };
  });
  const kopa = (k) => rindas.reduce((a, r) => a + r[k], 0);
  return html`<div class="ritinams">
<table class="tabula avotu-tabula">
  <thead><tr><th scope="col">Saraksts</th><th scope="col">Avoti</th><th scope="col" class="sk">Solījumi</th><th scope="col" class="sk">t. sk. Nepārbaudāmi</th></tr></thead>
  <tbody>${rindas.map(
    ({ s, n, neparbaudami }) => html`<tr>
    <th scope="row"><abbr class="mono" title="${s.nosaukums}">${s.saisinajums}</abbr> · ${s.isais_nosaukums}</th>
    <td>${s.avoti.map((a, i) => html`${i > 0 && " + "}<a href="${a.url}">${avotaNosaukums(a)}</a>`)}</td>
    <td class="sk mono">${n}</td>
    <td class="sk mono">${neparbaudami}</td>
  </tr>`,
  )}</tbody>
  <tfoot><tr><th scope="row" colspan="2">Kopā</th><td class="sk mono">${kopa("n")}</td><td class="sk mono">${kopa("neparbaudami")}</td></tr></tfoot>
</table>
</div>`;
}

// Statusu secība — kā vērtēšanas ceļš (docs/statusi/vertesana.md), ne kā pārskata leģenda.
const STATUSU_SKAIDROJUMI = [
  ["nav-vertets", "Sākuma stāvoklis: Notikuma, kas mainītu Statusu, vēl nav."],
  ["procesa", "Datēts formāls solis ceļā uz iznākumu: likumprojekts iesniegts Saeimā, Ministru kabineta projekts publicēts TAP, finansējums iekļauts budžeta likumā, izsludināts iepirkums. Paziņojumi, intervijas un nodomi nav pietiekami."],
  ["daleji-izpildits", "Daļa no solītā jau ir spēkā (piem., minimālā alga celta līdz 45%, solīti 50%)."],
  ["izpildits", "Solītais iznākums pilnā mērā: normatīvs pieņemts un izsludināts; skaitliskam mērķim — oficiāla statistika (CSP, Valsts kase) vai normatīvs, kas mērķi nosaka."],
  ["nav-izpildits", "Saeimas pilnvaru vai solījumā nosauktā termiņa beigās iznākuma nav — vai agrāk, ja iznākums šajā sasaukumā kļuvis nereāls (likumprojekts galīgi noraidīts, oficiāla atteikšanās, pieņemts pretējs lēmums)."],
  ["neparbaudams", "Deklarācija bez izmērāma iznākuma: solījums ir uzskaitīts, tam rāda Notikumus, bet Statusu nevērtē un progresā neskaita."],
];

export function metodologija(m) {
  const saturs = html`
<article class="metodologija">
  <h1>Metodoloģija un izdevējs</h1>
  <nav class="saturs-raditajs" aria-label="Sadaļas">
    <ol>${SADALAS.map(([id, nosaukums]) => html`<li><a href="#${id}">${nosaukums}</a></li>`)}</ol>
  </nav>

  ${sadala(
    "par",
    html`<p>ko-sola.lv apkopo 15. Saeimā ievēlēto sarakstu priekšvēlēšanu solījumus un seko to izpildei visu Saeimas pilnvaru laiku. Katram solījumam ir burtisks citāts no programmas, tēma, atbildīgā iestāde un Statuss, kas mainās tikai ar Notikumu, ko apliecina oficiāls avots.</p>
    <p>Izdevējs ir partijas „Kustība Par!” biedrs — par to un iespējamo interešu konfliktu sk. <a href="#izdevejs">6. sadaļu</a>.</p>`,
  )}

  ${sadala(
    "atlase",
    html`<p>Solījumus izraksta no divu veidu avotiem:</p>
    <ul>
      <li><strong>CVK programma</strong> — saraksta oficiālā priekšvēlēšanu programma (līdz 10 000 zīmēm), kas iesniegta Centrālajai vēlēšanu komisijai un publicēta „Latvijas Vēstnesī”. Tā ir visiem sarakstiem.</li>
      <li><strong>Paplašinātā programma</strong> — pilna vai tematiska programma, ko saraksts pats vai tā vārdā publicējis 15. Saeimas vēlēšanām papildus CVK programmai. Neskaitās vienas sarakstā ietilpstošas partijas dokuments, vispārīga partijas programma, kas nav sagatavota šīm vēlēšanām, kā arī debates, intervijas un ieraksti sociālajos tīklos.</li>
    </ul>
    <p>Viens solījums ir viena apņemšanās, kurai var piešķirt vienu Statusu. Ja tā pati apņemšanās ir vairākos avotos, tas ir viens solījums ar vairākiem citātiem; pirmais ir CVK programmas citāts. Citāts ir burtisks fragments no avota — mainīti tikai rindu pārnesumi un atstarpes —, un to automātiski pārbauda pret avota tekstu. Apņemšanās no CVK programmas ievada izraksta tikai tad, ja tās nav jau citos solījumos.</p>
    <p><strong>Nepārbaudāmi solījumi</strong> ir deklarācijas bez izmērāma iznākuma (piem., „stiprināsim drošību”). Tie ir izrakstīti un redzami, bet to Statusu nevērtē un progresa kopskaitā neiekļauj.</p>
    <p><strong>Nesakritība</strong> ir būtiska atšķirība starp viena solījuma citātiem — stiprumā, mērā, termiņā vai rādītājā (piem., „celsim līdz 50%” un „virzoties uz 50%”). To rāda pie solījuma. Nesakritība iespējama tikai solījumiem ar vairākiem citātiem, tātad gandrīz tikai sarakstiem ar paplašināto programmu, tāpēc tā nav saraksta konsekvences rādītājs, un lapa nesakritības pa sarakstiem neskaita.</p>
    <p>Pilna metode, pēc kuras izraksta solījumus: <a href="${METODE}">docs/ekstrakcija/metode.md</a>.</p>`,
  )}

  ${sadala(
    "avoti",
    html`<p>CVK programma visiem sarakstiem ir ierobežota līdz 10 000 zīmēm. Paplašināto programmu publicēt nav obligāti, un tās garums ir ļoti dažāds. Tāpēc solījumu skaits galvenokārt atkarīgs no tā, cik garas programmas saraksts publicēja, un sarakstus pēc solījumu skaita salīdzināt nevar: lielāks skaits nenozīmē vērienīgāku programmu.</p>
    ${avotuTabula(m)}
    <p>Ja vēlāk tiek atrasta paplašinātā programma, kas atbilst šiem nosacījumiem, to iekļauj.</p>`,
  )}

  ${sadala(
    "vertesana",
    html`<p>Statuss vērtē <strong>iznākumu</strong> — vai solītais notika —, nevis saraksta paša rīcību. Tāpēc skala un pierādījumu prasības koalīcijas un opozīcijas sarakstiem ir vienādas; saraksta rīcība (balsojumi, iesniegti likumprojekti) redzama Notikumos. Sākumā visiem solījumiem Statuss ir „Nav vērtēts”.</p>
    <dl class="statusu-skala">${STATUSU_SKAIDROJUMI.map(([k, teksts]) => html`<div><dt>${statussPill(k)}</dt><dd>${teksts}</dd></div>`)}</dl>
    <p><strong>Notikums</strong> ir datēts fakts, ko apliecina oficiāls avots: Saeima, Ministru kabinets un TAP portāls, likumi.lv, „Latvijas Vēstnesis”, CSP, Valsts kase. Ziņu raksts var būt tikai norāde uz oficiālo dokumentu. Katram solījumam Notikums ir „par” (tuvina solīto) vai „pret” (attālina). Frakciju balsojums ir redzams blakus, bet virzienu nemaina: likums, kas izpilda solījumu, ir „par” arī tad, ja solījuma devēji balsoja pret.</p>
    <p>Statuss mainās tikai ar vismaz vienu Notikumu un var mainīties jebkurā virzienā. Vērtē tikai Notikumus no vēlēšanu dienas (<time datetime="${VELESANU_DIENA}">${datums(VELESANU_DIENA)}</time>) līdz 15. Saeimas pilnvaru beigām; agrāki fakti redzami kā konteksts „Pirms vēlēšanām”.</p>
    <p>Ja solījuma citāti atšķiras, Statusu vērtē pēc CVK programmas; ja tajā nav mēra — pēc mēra citā citātā; ja CVK citāta nav — pēc paplašinātās programmas.</p>
    <p><strong>Atbildīgais</strong> ir valsts iestāde, kuras kompetencē ir solītais iznākums: ministrija, Valsts kanceleja vai Saeima. To nosaka vienādi visiem sarakstiem, neatkarīgi no tā, kurš solīja un kura partija iestādi vada. Amatpersona ir politiķis, kas iestādi vada lapas atjaunošanas dienā, pēc oficiāliem avotiem.</p>
    <p>Pilnas pierādījumu prasības un robežgadījumi: <a href="${VERTESANA}">docs/statusi/vertesana.md</a>.</p>`,
  )}

  ${sadala(
    "ai",
    html`<p>AI (Anthropic Claude) sagatavo melnrakstus: izraksta solījumus no programmām pēc publiskas instrukcijas un reizi nedēļā meklē Notikumu kandidātus oficiālajos avotos. Katrs melnraksts ir izmaiņu pieprasījums (pull request), ko redaktors pārbauda un apstiprina; bez apstiprinājuma lapā nekas neparādās. Visu izmaiņu vēsture ir publiska <a href="${REPO}">repozitorijā</a>.</p>`,
  )}

  ${sadala(
    "izdevejs",
    html`<p>ko-sola.lv ir privāts projekts. To nav pasūtījusi neviena partija vai saraksts, un tam nav ārēja finansējuma. Izdevējs un visas izmaiņas redzami publiskajā <a href="${REPO}">repozitorijā</a>.</p>
    <p>Izdevējs ir partijas „Kustība Par!” biedrs. ${PAR_UN_PRO} Izdevējs 15. Saeimas vēlēšanās nekandidēja un neieņem amatus ne „Kustībā Par!”, ne Progresīvajos.</p>
    <p>Visu sarakstu solījumiem — arī Progresīvo — piemēro vienu un to pašu metodi (<a href="#neitralitate">7. sadaļa</a>).</p>`,
  )}

  ${sadala(
    "neitralitate",
    html`<ul>
      <li>Viena Statusu skala un vienas pierādījumu prasības visiem sarakstiem — koalīcijai un opozīcijai.</li>
      <li>Katram solījumam ir burtisks citāts ar saiti uz avotu.</li>
      <li>Statusu maina tikai Notikums ar oficiālu avotu.</li>
      <li>Saraksti lapā ir bez partiju krāsām un bez reitinga, CVK numuru secībā.</li>
      <li>Katra izmaiņa ir publiska git vēsturē.</li>
      <li>Ikviens var apstrīdēt jebkuru citātu, Statusu vai Notikumu (<a href="#kludas">8. sadaļa</a>).</li>
    </ul>`,
  )}

  ${sadala(
    "kludas",
    html`<p>Ja pamanījāt kļūdu — nepareizu citātu, Statusu, Tēmu vai Atbildīgo, trūkstošu solījumu vai Notikumu —, ziņojiet par to GitHub: <a href="${kludasSaite(null)}">Ziņot par kļūdu</a> (vajadzīgs GitHub konts). Katra solījuma lapā ir saite, kas ziņojumā jau norāda solījumu. Ziņojumi un labojumi ir publiski.</p>`,
  )}
</article>`;

  return izkartojums({
    cels: METODOLOGIJA,
    virsraksts: "Metodoloģija un izdevējs",
    apraksts: "Kā ko-sola.lv atlasa un vērtē solījumus, kas ir izdevējs un kā ziņot par kļūdu.",
    atjaunoti: m.atjaunoti,
    saturs,
  });
}
