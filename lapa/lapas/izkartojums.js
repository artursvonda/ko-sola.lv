import { html, raw } from "../html.js";
import { STATUSI } from "../dati.js";

// Vietturis, ko Vite plugin aizstāj ar CSS/JS saitēm (dev — avota moduļi, build — hešotie faili).
export const RESURSI = "<!--ko:resursi-->";

const NAV = [
  ["/", "Solījumi"],
  ["/salidzinajums/", "Salīdzināt"],
];

export function izkartojums({ virsraksts, apraksts, cels, saturs }) {
  return `<!doctype html>${html`<html lang="lv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${virsraksts ? `${virsraksts} · ko-sola.lv` : "ko-sola.lv — ko solīja 15. Saeimā ievēlētie saraksti"}</title>
<meta name="description" content="${apraksts}">
${raw(RESURSI)}
</head>
<body>
<header class="galva">
  <a class="logo mono" href="/">ko-sola<span>.lv</span></a>
  <nav aria-label="Galvenā navigācija">
    ${NAV.map(([href, teksts]) => html`<a class="tab" href="${href}" ${href === cels ? raw('aria-current="page"') : ""}>${teksts}</a>`)}
  </nav>
</header>
<main>${saturs}</main>
</body>
</html>`}`;
}

export const datums = (d) => d.split("-").reverse().join(".");

export const statussPill = (statuss) => html`<span class="pill st-${statuss}">${STATUSI[statuss]}</span>`;

export function amatpersonaTeksts(a) {
  if (!a) return "Amatpersona nav norādīta";
  const speks = a.saraksts ? a.saraksts.saisinajums : a.partija;
  return `${a.vards}${speks ? ` (${speks})` : ""} · ${a.amats}${a.pi ? " p. i." : ""} kopš ${datums(a.no)}`;
}
