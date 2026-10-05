import { html } from "../html.js";
import { izkartojums, statussPill } from "./izkartojums.js";
import { progress } from "../dati.js";

export function sakums(m) {
  const p = progress(m.solijumi);
  const saturs = m.solijumi.length
    ? html`
<section class="progress" aria-label="Progress">
  <p class="liels"><strong>${p.skaits.izpildits}</strong> <span class="vajs">no ${p.n}</span> solījumiem izpildīti</p>
  <ul class="skaiti">
    ${Object.entries(p.skaits).map(([k, n]) => html`<li>${statussPill(k)} <span class="mono">${n}</span></li>`)}
  </ul>
</section>
<table class="tabula">
  <thead class="mono"><tr><th>Sar.</th><th>Solījums · tēma</th><th>Atbildīgais</th><th>Statuss</th></tr></thead>
  <tbody>
    ${m.solijumi.map(
      (s) => html`<tr>
      <td class="mono"><abbr title="${s.saraksts.nosaukums}">${s.saraksts.saisinajums}</abbr></td>
      <td><a href="/solijumi/${s.id}/">${s.nosaukums}</a><br><span class="vajs">${s.tema.nosaukums}</span></td>
      <td>${s.iestade.isais_nosaukums}</td>
      <td>${statussPill(s.statuss)}</td>
    </tr>`,
    )}
  </tbody>
</table>`
    : html`<p class="tukss">Solījumi tiek apkopoti no ievēlēto sarakstu programmām.</p>`;

  return izkartojums({
    cels: "/",
    apraksts: "15. Saeimā ievēlēto sarakstu priekšvēlēšanu solījumi, to izpilde un atbildīgie.",
    saturs,
  });
}
