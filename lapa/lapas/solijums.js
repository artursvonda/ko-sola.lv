import { html } from "../html.js";
import { izkartojums, statussPill, datums, amatpersonaTeksts } from "./izkartojums.js";

const AVOTI = { cvk: "CVK programma", paplasinata: "Paplašinātā programma" };

const balsojums = (b) => html`
<details class="balsojums">
  <summary>Frakciju balsojums (${b.saeima}. Saeima): par ${b.kopa.par}, pret ${b.kopa.pret}, atturas ${b.kopa.atturas}</summary>
  <table class="mono">
    <thead><tr><th>Frakcija</th><th>Par</th><th>Pret</th><th>Atturas</th><th>Nebalsoja</th></tr></thead>
    <tbody>${Object.entries(b.frakcijas).map(
      ([f, x]) => html`<tr><td>${f === "bez_frakcijas" ? "Bez frakcijas" : f}</td><td>${x.par}</td><td>${x.pret}</td><td>${x.atturas}</td><td>${x.nebalsoja ?? ""}</td></tr>`,
    )}</tbody>
  </table>
  <a href="${b.datu_avots}">Saeimas atvērtie dati</a>
</details>`;

export function solijums(s) {
  const saturs = html`
<article class="solijums">
  <p class="mono vajs"><abbr title="${s.saraksts.nosaukums}">${s.saraksts.saisinajums}</abbr> · ${s.saraksts.isais_nosaukums}</p>
  <h1>${s.nosaukums}</h1>
  <p>${statussPill(s.statuss)} <span class="vajs">${[s.tema, ...s.papildu_temas].map((t) => t.nosaukums).join(" · ")}</span></p>

  ${s.avoti.map(
    (a) => html`<figure class="citats">
    <blockquote>„${a.citats}”</blockquote>
    <figcaption>${a.url ? html`<a href="${a.url}">${AVOTI[a.veids]}</a>` : AVOTI[a.veids]} · ${a.vieta}</figcaption>
  </figure>`,
  )}
  ${s.nesakritiba && html`<p class="nesakritiba"><strong>Programmas nesakrīt:</strong> ${s.nesakritiba} Statuss vērtēts pēc CVK programmas.</p>`}

  <section class="karte" aria-labelledby="atb">
    <h2 id="atb" class="lbl">Atbildīgais</h2>
    <p><strong>${s.iestade.nosaukums}</strong><br><span class="vajs">${amatpersonaTeksts(s.amatpersona)}</span></p>
    ${s.papildu_iestades.length > 0 && html`<p class="vajs">Arī: ${s.papildu_iestades.map((i) => i.nosaukums).join(", ")}</p>`}
  </section>

  ${s.parbaudams && html`<section aria-labelledby="vesture">
    <h2 id="vesture" class="lbl">Statusa vēsture</h2>
    ${
      s.statusa_mainas.length
        ? html`<ol class="vesture">${s.statusa_mainas.toReversed().map(
            (m) => html`<li><span class="mono vajs">${datums(m.datums)}</span>
            <div>${statussPill(m.statuss)}<p>${m.pamatojums}</p>
            ${m.notikumi.map((n) => html`<a href="#${n.id}">${n.nosaukums}</a>`)}</div></li>`,
          )}</ol>`
        : html`<p class="vajs">Nav vērtēts — vēl nav Notikumu, kas mainītu Statusu.</p>`
    }
  </section>`}

  <section aria-labelledby="notikumi">
    <h2 id="notikumi" class="lbl">Notikumi</h2>
    ${
      s.notikumi.length
        ? html`<ol class="notikumi">${s.notikumi.toReversed().map(
            (n) => html`<li id="${n.id}"><span class="mono vajs">${datums(n.datums)}</span>
            <div><span class="virziens virziens-${n.virziens}">${n.virziens === "par" ? "Par" : "Pret"}</span>
            <strong>${n.nosaukums}</strong><p>${n.pamatojums}</p>
            <p class="vajs">${n.avoti.map((a) => html`<a href="${a.url}">${new URL(a.url).hostname}</a> `)}</p>
            ${n.balsojums && balsojums(n.balsojums)}</div></li>`,
          )}</ol>`
        : html`<p class="vajs">Vēl nav Notikumu.</p>`
    }
  </section>
</article>`;

  return izkartojums({
    cels: `/solijumi/${s.id}/`,
    virsraksts: `${s.saraksts.saisinajums}: ${s.nosaukums}`,
    apraksts: `${s.saraksts.isais_nosaukums} solīja: „${s.avoti[0].citats}”`,
    saturs,
  });
}
