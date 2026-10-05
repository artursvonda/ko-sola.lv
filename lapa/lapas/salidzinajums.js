import { html } from "../html.js";
import { izkartojums, statussPill } from "./izkartojums.js";
import { matrica, temasSaraksti } from "./salidzinajums-dati.js";
import { temaSaite } from "./saites.js";

function suna(saraksts, { tema, n }) {
  if (n === 0) return html`<td data-tema="${tema.slug}"><span aria-hidden="true">·</span><span class="nav-redzams">0</span></td>`;
  return html`<td data-tema="${tema.slug}"><a href="${temaSaite(tema.slug)}" aria-label="${saraksts.isais_nosaukums}, ${tema.nosaukums}: ${n}">${n}</a></td>`;
}

const rinda = (s, papildu) => html`<li>
  <a href="/solijumi/${s.id}/">${s.nosaukums}</a>
  <span class="blakus-meta">${statussPill(s.statuss)}<abbr class="mono vajs" title="${s.iestade.nosaukums}">${s.iestade.isais_nosaukums}</abbr></span>
  ${papildu && html`<span class="vajs blakus-galvena">Galvenā tēma: <a href="${temaSaite(s.tema.slug)}">${s.tema.nosaukums}</a></span>`}
</li>`;

const sadala = (m, t) => html`<section class="tema-sadala" id="${t.slug}" data-tema="${t.slug}" aria-labelledby="${t.slug}-v">
  <h2 id="${t.slug}-v">${t.nosaukums} <span class="vajs">— visi saraksti blakus</span></h2>
  <div class="blakus">${temasSaraksti(m, t.slug).map(
    ({ saraksts, galvenie, papildu }) => html`<div class="blakus-saraksts">
    <h3><abbr title="${saraksts.nosaukums}">${saraksts.saisinajums}</abbr> · ${saraksts.isais_nosaukums}</h3>
    ${galvenie.length + papildu.length === 0
      ? html`<p class="vajs">Šajā tēmā solījumu nav.</p>`
      : html`<ul>${galvenie.map((s) => rinda(s, false))}${papildu.map((s) => rinda(s, true))}</ul>`}
  </div>`,
  )}</div>
  <p class="uz-matricu"><a href="#matrica">Uz matricu</a></p>
</section>`;

export function salidzinajums(m) {
  const saturs = html`
<ko-salidzinajums class="salidzinajums">
<h1>Solījumu skaits: saraksts × galvenā tēma</h1>
<p class="vajs">Tēma vai šūna atver šīs tēmas solījumus visiem sarakstiem blakus.</p>
<div class="ritinams" id="matrica">
<table class="matrica mono">
  <thead><tr><td></td>${m.temas.map(
    (t) => html`<th scope="col" data-tema="${t.slug}"><a href="${temaSaite(t.slug)}">${t.nosaukums}</a></th>`,
  )}</tr></thead>
  <tbody>${matrica(m).map(
    (r) => html`<tr>
    <th scope="row"><abbr title="${r.saraksts.nosaukums}">${r.saraksts.saisinajums}</abbr></th>${r.sunas.map((x) => suna(r.saraksts, x))}</tr>`,
  )}</tbody>
</table>
</div>
<div class="temas">${m.temas.map((t) => sadala(m, t))}</div>
</ko-salidzinajums>`;
  return izkartojums({
    cels: "/salidzinajums/",
    virsraksts: "Salīdzinājums pēc tēmas",
    apraksts: "Ko par katru tēmu solīja 15. Saeimā ievēlētie saraksti.",
    saturs,
  });
}
