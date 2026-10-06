import { html, raw } from "../html.js";
import { izkartojums, statussPill } from "./izkartojums.js";
import { progress, skaiti, datuAtributi, izvelesSaite, STATUSU_SECIBA, BEZ_FILTRIEM } from "../klients/filtri.js";

// Statusu joslas segmenti: bez Nepārbaudāmajiem (tie N neiekļauti).
const JOSLAS_STATUSI = STATUSU_SECIBA.filter((k) => k !== "neparbaudams");

/** Ieraksts filtrēšanai: galvenā vērtība pirmā, tad papildu (klients to nolasa no data-* atribūtiem). */
const ieraksts = (s) => ({
  saraksts: s.saraksts.slug,
  iestades: [s.iestade, ...s.papildu_iestades].map((i) => i.slug),
  tema: [s.tema, ...s.papildu_temas].map((t) => t.slug),
  statuss: s.statuss,
});

function progresaSadala(p) {
  return html`<section class="progress" aria-label="Progress">
  <p class="liels" aria-live="polite"><strong data-k="izpilditi">${p.izpilditi}</strong> <span class="vajs">no <span data-k="n">${p.n}</span></span> solījumiem izpildīti</p>
  <div class="statusu-josla" aria-hidden="true">${JOSLAS_STATUSI.map(
    (k) => html`<span class="seg seg-${k}" data-statuss="${k}" style="flex-grow: ${p.skaits[k]}"${p.skaits[k] === 0 && raw(" hidden")}></span>`,
  )}</div>
  <ul class="skaiti">
    ${STATUSU_SECIBA.map((k) => html`<li data-statuss="${k}">${statussPill(k)} <span class="mono" data-k="skaits">${p.skaits[k]}</span></li>`)}
  </ul>
  <p class="vajs neparbaudami" data-k="neparbaudami" ${p.neparbaudami === 0 && "hidden"}>Nepārbaudāmie (<span class="mono" data-k="neparbaudami-n">${p.neparbaudami}</span>) kopskaitā nav iekļauti.</p>
</section>`;
}

const rindasDati = (s) =>
  raw(Object.entries(datuAtributi(ieraksts(s))).map(([k, v]) => html` data-${k}="${v}"`).join(""));

const rinda = (s) => html`<tr role="row" data-id="${s.id}"${rindasDati(s)}>
      <td role="cell" class="t-sar mono"><abbr title="${s.saraksts.nosaukums}">${s.saraksts.saisinajums}</abbr></td>
      <td role="cell" class="t-sol"><a href="/solijumi/${s.id}/">${s.nosaukums}</a>
        <span class="t-tema vajs">${s.tema.nosaukums}</span></td>
      <td role="cell" class="t-atb">${s.iestade.nosaukums}</td>
      <td role="cell" class="t-st">${statussPill(s.statuss)}</td>
    </tr>`;

const tabula = (solijumi) => html`<div class="ritinams">
<table class="tabula parskata-tabula" role="table">
  <thead class="mono" role="rowgroup"><tr role="row">${["Sar.", "Solījums · tēma", "Atbildīgais", "Statuss"].map((t) => html`<th scope="col" role="columnheader">${t}</th>`)}</tr></thead>
  <tbody role="rowgroup" data-k="galvena">
    ${solijumi.map(rinda)}
  </tbody>
  <tbody role="rowgroup" class="papildu-grupa" data-k="papildu" hidden>
    <tr role="row" class="grupas-virsraksts"><th scope="rowgroup" colspan="4" role="rowheader">Saistīti arī (papildu): <span class="mono" data-k="papildu-n">0</span></th></tr>
  </tbody>
</table>
</div>
<p class="tukss" data-k="tukss" hidden>Ar šiem filtriem solījumu nav. <a href="/">Notīrīt filtrus</a></p>`;

/**
 * Viena filtra grupa: „Visi…” + izvēles ar skaitu (pēc galvenās vērtības). Sākumā izvēlēts „Visi…”.
 * Izvēle ar 0 (piem., tikai papildu vērtība) ir paslēpta, bet paliek DOM: tās slug derīgs URL, nosaukums — virsrakstam.
 */
function filtraGrupa(grupa, virsraksts, visi, izveles, skaits) {
  const saite = (vertiba, nosaukums) => {
    const n = skaits[vertiba ?? ""] ?? 0;
    return html`<li${vertiba && n === 0 && raw(" hidden")}><a href="${izvelesSaite(BEZ_FILTRIEM, grupa, vertiba)}" data-grupa="${grupa}" data-vertiba="${vertiba ?? ""}" data-nosaukums="${nosaukums}"${vertiba ? "" : raw(' aria-current="true"')}><span>${nosaukums}</span> <span class="mono skaits" data-k="skaits">${n}</span></a></li>`;
  };
  return html`<section class="filtra-grupa" aria-labelledby="f-${grupa}">
    <h2 class="lbl" id="f-${grupa}">${virsraksts}</h2>
    <ul>${saite(null, visi)}${izveles.map((x) => saite(x.slug, x.nosaukums))}</ul>
  </section>`;
}

// Atbildīgie un Tēmas — pēc redzamā nosaukuma latviešu alfabētā; Saraksti — CVK numuru secībā (m.saraksti).
const lv = new Intl.Collator("lv");
const pecNosaukuma = (xi) => xi.toSorted((a, b) => lv.compare(a.nosaukums, b.nosaukums));

function filtri(m, ieraksti) {
  const skaitiPec = skaiti(ieraksti, BEZ_FILTRIEM);
  const iestades = new Set(ieraksti.flatMap((ieraksts) => ieraksts.iestades));
  const temas = new Set(ieraksti.flatMap((ieraksts) => ieraksts.tema));
  return html`<div class="filtri">
  <details class="filtri-atvere" data-k="atvere">
    <summary><span class="lbl">Filtri</span> <span class="filtra-nosaukums" data-k="nosaukums">Visi saraksti</span></summary>
    ${filtraGrupa("saraksts", "Saraksts", "Visi saraksti", m.saraksti.map((s) => ({ slug: s.slug, nosaukums: s.isais_nosaukums })), skaitiPec.saraksts)}
    ${filtraGrupa("atbildigais", "Atbildīgais", "Visi", pecNosaukuma(m.iestades.filter((i) => iestades.has(i.slug))), skaitiPec.atbildigais)}
    ${filtraGrupa("tema", "Tēma", "Visas tēmas", pecNosaukuma(m.temas.filter((t) => temas.has(t.slug))), skaitiPec.tema)}
  </details>
</div>`;
}

export function sakums(m) {
  const ieraksti = m.solijumi.map(ieraksts);
  const saturs = m.solijumi.length
    ? html`<ko-parskats>
<div class="parskats">
<h1 class="parskats-virsraksts" data-k="nosaukums">Visi saraksti</h1>
<noscript><p class="vajs bez-js">Filtri darbojas tikai ar JavaScript — redzami visi solījumi.</p></noscript>
${filtri(m, ieraksti)}
<div class="parskats-saturs">
${progresaSadala(progress(ieraksti))}
<div class="parskats-zona" data-k="zona">
<div class="parskats-tabula">
${tabula(m.solijumi)}
</div>
<aside class="panelis" aria-label="Izvēlētais solījums" data-k="panelis" tabindex="-1" hidden></aside>
</div>
</div>
</div>
</ko-parskats>`
    : html`<p class="tukss">Solījumi tiek apkopoti no ievēlēto sarakstu programmām.</p>`;

  return izkartojums({
    cels: "/",
    apraksts: "15. Saeimā ievēlēto sarakstu priekšvēlēšanu solījumi, to izpilde un atbildīgie.",
    saturs,
  });
}
