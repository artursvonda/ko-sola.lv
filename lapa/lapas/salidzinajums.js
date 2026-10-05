import { html } from "../html.js";
import { izkartojums } from "./izkartojums.js";

export function salidzinajums(m) {
  const skaits = (saraksts, tema) =>
    m.solijumi.filter((s) => s.saraksts.slug === saraksts && s.tema.slug === tema).length;
  const saturs = html`
<h1>Solījumu skaits: saraksts × galvenā tēma</h1>
<div class="ritinams">
<table class="matrica mono">
  <thead><tr><th></th>${m.saraksti.map((s) => html`<th><abbr title="${s.nosaukums}">${s.saisinajums}</abbr></th>`)}</tr></thead>
  <tbody>${m.temas.map(
    (t) => html`<tr><th scope="row">${t.nosaukums}</th>${m.saraksti.map((s) => html`<td>${skaits(s.slug, t.slug) || ""}</td>`)}</tr>`,
  )}</tbody>
</table>
</div>`;
  return izkartojums({
    cels: "/salidzinajums/",
    virsraksts: "Salīdzinājums pēc tēmas",
    apraksts: "Ko par katru tēmu solīja 15. Saeimā ievēlētie saraksti.",
    saturs,
  });
}
