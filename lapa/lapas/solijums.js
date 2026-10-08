import { html } from "../html.js";
import { STATUSI, NESKAIDRA_IESTADE, frakcijasSaraksts, sisSaeimasBalsojums, pirmsVelesanam } from "../dati.js";
import { izkartojums, statussPill, datums, amatpersonaRindas } from "./izkartojums.js";
import { parskatsSaite, temaSaite } from "./saites.js";

const AVOTI = { cvk: "CVK programma", paplasinata: "Paplašinātā programma" };
const NOTIKUMA_AVOTI = {
  saeima: "Saeima",
  mk: "Ministru kabinets",
  likumi: "likumi.lv",
  vestnesis: "Latvijas Vēstnesis",
  csp: "CSP",
  kase: "Valsts kase",
  zinas: "Ziņa",
};
const CITU_MAX = 3;

/** Citāta izmēra pakāpe pēc garuma: īss citāts — lielāks burts. Citātu nekad negriež. */
const citataPakape = (t) => (t.length <= 90 ? "c-l" : t.length <= 180 ? "c-m" : "c-s");

const avotaRinda = (a) => html`<p class="avota-rinda">
  ${a.url ? html`<a href="${a.url}">${AVOTI[a.veids]}</a>` : html`<span>${AVOTI[a.veids]}</span>`}
  <span>${a.vieta}</span>
  ${a.publikacija && html`<span>${a.publikacija}</span>`}
</p>`;

const citats = (a, klase) => html`<figure class="citats ${klase}">
  <blockquote><p><span class="atv" aria-hidden="true">„</span>${a.citats}<span aria-hidden="true">”</span></p></blockquote>
  <figcaption>${avotaRinda(a)}</figcaption>
</figure>`;

function statussTeksts(s) {
  if (s.statuss === "neparbaudams") return "Deklarācija bez izmērāma iznākuma, tāpēc Statusu nevērtē.";
  const pedeja = s.statusa_mainas.at(-1);
  return pedeja ? html`kopš <time class="mono" datetime="${pedeja.datums}">${datums(pedeja.datums)}</time>` : "Notikumu, kas mainītu Statusu, vēl nav.";
}

// Papildu Tēmas un iestādes filtrē pārskatu tāpat kā galvenās (GLOSSARY.md), tāpēc saite ir tā pati.
const iestadesSaite = (i) => html`<a href="${parskatsSaite({ atbildigais: i.slug })}">${i.nosaukums}</a>`;
const temasSaite = (t) => html`<a href="${parskatsSaite({ tema: t.slug })}">${t.nosaukums}</a>`;
const saisuSaraksts = (xi, saite) => xi.map((x, k) => html`${k > 0 && ", "}${saite(x)}`);

const josla = (s) => html`<dl class="josla">
  <div>
    <dt class="lbl">Statuss</dt>
    <dd>${statussPill(s.statuss)}<span class="josla-sik">${statussTeksts(s)}</span></dd>
  </div>
  <div>
    <dt class="lbl">Atbildīgais</dt>
    <dd><strong>${iestadesSaite(s.iestade)}</strong>${s.iestade.slug !== NESKAIDRA_IESTADE && amatpersonaRindas(s.amatpersona, "josla-sik")}
    ${s.papildu_iestades.length > 0 && html`<span class="josla-sik">Arī: ${saisuSaraksts(s.papildu_iestades, iestadesSaite)}</span>`}</dd>
  </div>
  <div class="josla-pilna">
    <dt class="lbl">Tēma</dt>
    <dd>${temasSaite(s.tema)}${s.papildu_temas.length > 0 && html`<span class="vajs"> · arī ${saisuSaraksts(s.papildu_temas, temasSaite)}</span>`}</dd>
  </div>
</dl>`;

const BEZ_FRAKCIJAS = "bez_frakcijas";

/**
 * Balsojuma rindas: { kods, saraksts (šīs Saeimas balsojumā, ja kartēts), balsis }.
 * Šīs Saeimas balsojumā — Sarakstu CVK secībā, tad nekartētie kodi (datu secībā), „Bez frakcijas” pēdējā; citādi — datu secībā.
 */
function balsojumaRindas(b, saraksti) {
  const rindas = Object.entries(b.frakcijas).map(([kods, balsis]) => ({ kods, saraksts: frakcijasSaraksts(b, kods, saraksti), balsis }));
  if (!sisSaeimasBalsojums(b)) return rindas;
  const vieta = (r) => (r.kods === BEZ_FRAKCIJAS ? Infinity : (r.saraksts?.nr ?? Number.MAX_SAFE_INTEGER));
  return rindas.toSorted((a, c) => vieta(a) - vieta(c));
}

/** Rindas virsraksts: kartēts — tikai Saraksts (kā citur lapā), Frakcijas kods — `title`; citādi — kods, kā Saeimas datos. */
function frakcija({ kods, saraksts }) {
  if (kods === BEZ_FRAKCIJAS) return html`<th scope="row">Bez frakcijas</th>`;
  if (!saraksts) return html`<th scope="row">${kods}</th>`;
  return html`<th scope="row" title="${kods}"><abbr title="${saraksts.nosaukums}">${saraksts.saisinajums}</abbr> · ${saraksts.isais_nosaukums}</th>`;
}

const balsojums = (b, saraksti) => html`
<details class="balsojums">
  <summary>Frakciju balsojums (${b.saeima}. Saeima): par ${b.kopa.par}, pret ${b.kopa.pret}, atturas ${b.kopa.atturas}</summary>
  <table>
    <thead><tr><th scope="col">Frakcija</th><th scope="col">Par</th><th scope="col">Pret</th><th scope="col">Atturas</th><th scope="col">Nebalsoja</th></tr></thead>
    <tbody>${balsojumaRindas(b, saraksti).map(
      (r) => html`<tr>${frakcija(r)}<td>${r.balsis.par}</td><td>${r.balsis.pret}</td><td>${r.balsis.atturas}</td><td>${r.balsis.nebalsoja ?? ""}</td></tr>`,
    )}</tbody>
  </table>
  ${!sisSaeimasBalsojums(b) && html`<p class="vajs">Balsojums ${b.saeima}. Saeimā. Tās frakcijas nav tas pats, kas 2026. gada vēlēšanu Saraksti.</p>`}
  <p><a href="${b.datu_avots}">Saeimas atvērtie dati</a>${b.komentars && html` · ${b.komentars}`}</p>
</details>`;

const solijumaSaite = (x) => html`<a href="/solijumi/${x.id}/"><abbr title="${x.saraksts.nosaukums}">${x.saraksts.saisinajums}</abbr>: ${x.nosaukums}</a>`;

const notikumaAvots = (a) => html`<a href="${a.url}">${NOTIKUMA_AVOTI[a.veids] ?? new URL(a.url).hostname}</a>`;

const maina = (m) => html`<li class="la-maina la-${m.statuss}">
  <p class="la-datums"><time datetime="${m.datums}">${datums(m.datums)}</time> · Statusa maiņa</p>
  <p>${statussPill(m.statuss)}</p>
  <p>${m.pamatojums}</p>
  <p class="vajs">Pamatā: ${m.notikumi.map((n, i) => html`${i > 0 && ", "}<a href="#${n.id}">${n.nosaukums}</a>`)}</p>
</li>`;

const notikums = (n, saraksti) => html`<li class="la-notikums la-${n.virziens}" id="${n.id}">
  <p class="la-datums"><time datetime="${n.datums}">${datums(n.datums)}</time> · Notikums${pirmsVelesanam(n) && " · Pirms vēlēšanām"} · <span class="virziens virziens-${n.virziens}">${n.virziens === "par" ? "par" : "pret"} solīto</span></p>
  <h3>${n.nosaukums}</h3>
  <p>${n.pamatojums}</p>
  <p class="vajs">${n.apraksts}</p>
  <p class="la-avoti">Avots: ${n.avoti.map((a, i) => html`${i > 0 && ", "}${notikumaAvots(a)}`)}</p>
  ${n.balsojums && balsojums(n.balsojums, saraksti)}
  ${n.citi.length > 0 && html`<div class="la-citi"><p class="vajs">Attiecas arī uz:</p><ul>${n.citi.map((x) => html`<li>${solijumaSaite(x)}</li>`)}</ul></div>`}
</li>`;

function laikaAss(s, saraksti) {
  // Jaunākais augšā; vienā datumā Statusa maiņa pirms Notikuma, kas to pamato.
  const ieraksti = [
    ...s.statusa_mainas.map((m) => ({ datums: m.datums, k: 0, html: maina(m) })),
    ...s.notikumi.map((n) => ({ datums: n.datums, k: 1, html: notikums(n, saraksti) })),
  ].sort((a, b) => b.datums.localeCompare(a.datums) || a.k - b.k);
  const sakums = s.avoti[0];
  return html`<ol class="laika-ass">
    ${ieraksti.map((i) => i.html)}
    ${ieraksti.length === 0 && html`<li class="la-tukss"><p>Notikumu vēl nav. ${s.parbaudams ? "Statuss mainās tikai ar Notikumu, kam ir oficiāls avots." : ""}</p></li>`}
    ${sakums.publikacija && html`<li class="la-sakums"><p class="la-datums">Solīts</p><p class="mono">${AVOTI[sakums.veids]} · ${sakums.publikacija}</p></li>`}
  </ol>`;
}

const solijumuSaraksts = (solijumi) => html`<ul class="saistitie">${solijumi.map(
  (x) => html`<li><a href="/solijumi/${x.id}/">${x.nosaukums}</a>${statussPill(x.statuss)}</li>`,
)}</ul>`;

function citiSaraksti(s, m) {
  const tema = s.tema;
  // Visi pārējie saraksti CVK numuru secībā; bez solījumiem tēmā — vienā rindā.
  const visi = m.saraksti
    .filter((sr) => sr.slug !== s.saraksts.slug)
    .map((sr) => ({ sr, visi: m.solijumi.filter((x) => x.saraksts.slug === sr.slug && x.tema.slug === tema.slug) }));
  const ar = visi.filter((x) => x.visi.length > 0);
  const bez = visi.filter((x) => x.visi.length === 0);
  return html`<section class="sadala" aria-labelledby="citi-saraksti">
  <h2 id="citi-saraksti">Ko par tēmu „${tema.nosaukums}” sola citi</h2>
  ${ar.map(
    ({ sr, visi }) => html`<div class="cits-saraksts">
      <h3><abbr title="${sr.nosaukums}">${sr.saisinajums}</abbr> · ${sr.isais_nosaukums}</h3>
      ${solijumuSaraksts(visi.slice(0, CITU_MAX))}
      ${visi.length > CITU_MAX && html`<p><a href="${parskatsSaite({ saraksts: sr.slug, tema: tema.slug })}">Visi ${sr.saisinajums} solījumi šajā tēmā (${visi.length})</a></p>`}
    </div>`,
  )}
  ${bez.length > 0 && html`<p class="vajs">Šajā tēmā solījumu nav: ${bez.map(({ sr }, i) => html`${i > 0 && ", "}<abbr title="${sr.nosaukums}">${sr.saisinajums}</abbr>`)}.</p>`}
  <p><a href="${temaSaite(tema.slug)}">Salīdzināt visus sarakstus tēmā „${tema.nosaukums}”</a></p>
</section>`;
}

export function solijums(s, m) {
  const [galvenais, ...citi] = s.avoti;
  const tasPats = m.solijumi.filter((x) => x.id !== s.id && x.saraksts.slug === s.saraksts.slug && x.tema.slug === s.tema.slug);

  const saturs = html`
<article class="solijums">
  <nav class="cels" aria-label="Atrašanās vieta"><a href="/">Solījumi</a> <span aria-hidden="true">›</span> <a href="${parskatsSaite({ saraksts: s.saraksts.slug })}"><abbr title="${s.saraksts.nosaukums}">${s.saraksts.saisinajums}</abbr> · ${s.saraksts.isais_nosaukums}</a></nav>
  <h1>${s.nosaukums}</h1>
  ${citats(galvenais, `galvenais ${citataPakape(galvenais.citats)}`)}
  ${josla(s)}

  ${citi.length > 0 && html`<section class="sadala" aria-labelledby="citati">
    <h2 id="citati">Citi citāti no programmām</h2>
    ${s.nesakritiba && html`<aside class="nesakritiba" aria-labelledby="nesakritiba">
      <p class="lbl" id="nesakritiba">Nesakritība starp citātiem</p>
      <p>${s.nesakritiba}</p>
      <p class="vajs">Statusu vērtē pēc CVK programmas.</p>
    </aside>`}
    ${citi.map((a) => citats(a, "papildu"))}
  </section>`}

  <section class="sadala" aria-labelledby="laika-ass">
    <h2 id="laika-ass">${s.parbaudams ? "Statusa vēsture un Notikumi" : "Notikumi"}</h2>
    ${laikaAss(s, m.saraksti)}
  </section>

  <section class="sadala" aria-labelledby="tas-pats">
    <h2 id="tas-pats">Citi ${s.saraksts.saisinajums} solījumi tēmā „${s.tema.nosaukums}”</h2>
    ${tasPats.length ? solijumuSaraksts(tasPats) : html`<p class="vajs">Citu ${s.saraksts.saisinajums} solījumu šajā tēmā nav.</p>`}
  </section>

  ${citiSaraksti(s, m)}
</article>`;

  return izkartojums({
    cels: `/solijumi/${s.id}/`,
    virsraksts: `${s.saraksts.saisinajums}: ${s.nosaukums}`,
    apraksts: `${s.saraksts.isais_nosaukums} solīja: „${galvenais.citats}” Statuss: ${STATUSI[s.statuss]}.`,
    og: `/solijumi/${s.id}/og.png`,
    saturs,
  });
}
