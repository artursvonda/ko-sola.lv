import { html, raw } from "../html.js";
import { izkartojums, statussPill } from "./izkartojums.js";
import { progress as skaititProgresu, skaiti, datuAtributi, izvelesSaite, STATUSU_SECIBA } from "../klients/filtri.js";

const TUKSI = { saraksts: null, atbildigais: null, tema: null };

// Statusu joslas segmenti: bez Nepārbaudāmajiem (tie N neiekļauti).
const JOSLAS_STATUSI = STATUSU_SECIBA.filter((k) => k !== "neparbaudams");

/** Ieraksts filtrēšanai: galvenā vērtība pirmā, tad papildu (klients to nolasa no data-* atribūtiem). */
const ieraksts = (s) => ({
  saraksts: s.saraksts.slug,
  atbildigais: [s.iestade, ...s.papildu_iestades].map((i) => i.slug),
  tema: [s.tema, ...s.papildu_temas].map((t) => t.slug),
  statuss: s.statuss,
});

function progresaSadala(p) {
  return html`<section class="progress" aria-label="Progress">
  <h1 class="filtra-nosaukums" data-k="nosaukums">Visi saraksti</h1>
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
        <span class="t-tema vajs">${s.tema.nosaukums}${s.papildu_temas.length > 0 && ` · arī ${s.papildu_temas.map((t) => t.nosaukums).join(", ")}`}</span></td>
      <td role="cell" class="t-atb">${s.iestade.nosaukums}
        ${s.papildu_iestades.length > 0 && html`<span class="t-ari vajs">arī: ${s.papildu_iestades.map((i, n) => html`${n > 0 && ", "}<abbr title="${i.nosaukums}">${i.isais_nosaukums}</abbr>`)}</span>`}</td>
      <td role="cell" class="t-st">${statussPill(s.statuss)}</td>
    </tr>`;

const tabula = (solijumi) => html`<div class="ritinams">
<table class="tabula parskata-tabula" role="table">
  <thead class="mono" role="rowgroup"><tr role="row">${["Sar.", "Solījums · tēma", "Atbildīgais", "Statuss"].map((t) => html`<th scope="col" role="columnheader">${t}</th>`)}</tr></thead>
  <tbody role="rowgroup">
    ${solijumi.map(rinda)}
  </tbody>
</table>
</div>
<p class="tukss" data-k="tukss" hidden>Šim filtram solījumu nav.</p>`;

/** Viena filtra grupa: „Visi…” + izvēles ar skaitu (pēc galvenās vērtības). Sākumā izvēlēts „Visi…”. */
function filtraGrupa(grupa, virsraksts, visi, izveles, sk) {
  const saite = (vertiba, nosaukums) => {
    const n = sk[vertiba ?? ""] ?? 0;
    return html`<li><a href="${izvelesSaite(TUKSI, grupa, vertiba)}" data-grupa="${grupa}" data-vertiba="${vertiba ?? ""}" data-nosaukums="${nosaukums}"${vertiba ? "" : raw(' aria-current="true"')}${n === 0 && raw(' class="nulle"')}><span>${nosaukums}</span> <span class="mono skaits" data-k="skaits">${n}</span></a></li>`;
  };
  return html`<section class="filtra-grupa" aria-labelledby="f-${grupa}">
    <h2 class="lbl" id="f-${grupa}">${virsraksts}</h2>
    <ul>${saite(null, visi)}${izveles.map((x) => saite(x.slug, x.nosaukums))}</ul>
  </section>`;
}

function filtri(m, ieraksti) {
  const sk = skaiti(ieraksti, TUKSI);
  const ir = (g) => new Set(ieraksti.flatMap((r) => r[g]));
  const iestades = ir("atbildigais");
  const temas = ir("tema");
  return html`<div class="filtri">
  <details class="filtri-atvere" data-k="atvere">
    <summary><span class="lbl">Filtri</span> <span class="filtra-nosaukums" data-k="nosaukums">Visi saraksti</span></summary>
    ${filtraGrupa("saraksts", "Saraksts", "Visi saraksti", m.saraksti.map((s) => ({ slug: s.slug, nosaukums: s.isais_nosaukums })), sk.saraksts)}
    ${filtraGrupa("atbildigais", "Atbildīgais", "Visi", m.iestades.filter((i) => iestades.has(i.slug)), sk.atbildigais)}
    ${filtraGrupa("tema", "Tēma", "Visas tēmas", m.temas.filter((t) => temas.has(t.slug)), sk.tema)}
  </details>
</div>`;
}

export function sakums(m) {
  const ieraksti = m.solijumi.map(ieraksts);
  const saturs = m.solijumi.length
    ? html`<ko-parskats>
<div class="parskats">
${filtri(m, ieraksti)}
<div class="parskats-saturs">
${progresaSadala(skaititProgresu(ieraksti))}
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
