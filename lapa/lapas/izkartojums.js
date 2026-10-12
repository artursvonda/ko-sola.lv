import { html, raw } from "../html.js";
import { STATUSI } from "../dati.js";
import { REPO, METODOLOGIJA } from "./saites.js";

// Vietturis, ko Vite plugin aizstāj ar CSS/JS saitēm (dev — avota moduļi, build — hešotie faili).
export const RESURSI = "<!--ko:resursi-->";

const NAV = [
  ["/", "Solījumi"],
  ["/salidzinajums/", "Salīdzināt"],
];

// Absolūtas saites OG metadatiem un kļūdu ziņojumiem.
export const SAITE = process.env.KO_SAITE ?? "https://ko-sola.lv";

/** Kājene visās lapās (#104): Metodoloģija nav cilne galvenē. `atjaunoti` — pēdējās datu izmaiņas datums (null — nerāda). */
const kajene = (atjaunoti) => html`<footer class="kajene">
  <nav aria-label="Par lapu">
    <a href="${METODOLOGIJA}">Metodoloģija un izdevējs</a>
    <a href="${METODOLOGIJA}#kludas">Ziņot par kļūdu</a>
    <a href="${REPO}">Atvērtais kods un dati (GitHub)</a>
  </nav>
  ${atjaunoti && html`<p class="mono">Dati atjaunoti <time datetime="${atjaunoti}">${datums(atjaunoti)}</time></p>`}
</footer>`;

export function izkartojums({ virsraksts, apraksts, cels, og, saturs, atjaunoti = null }) {
  const nosaukums = virsraksts ? `${virsraksts} · ko-sola.lv` : "ko-sola.lv — ko solīja 15. Saeimā ievēlētie saraksti";
  return `<!doctype html>${html`<html lang="lv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${nosaukums}</title>
<meta name="description" content="${apraksts}">
<meta property="og:site_name" content="ko-sola.lv">
<meta property="og:locale" content="lv_LV">
<meta property="og:title" content="${nosaukums}">
<meta property="og:description" content="${apraksts}">
${cels && html`<link rel="canonical" href="${SAITE}${cels}">
<meta property="og:url" content="${SAITE}${cels}">`}
${og && html`<meta property="og:type" content="article">
<meta property="og:image" content="${SAITE}${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${apraksts}">
<meta name="twitter:card" content="summary_large_image">`}
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
${kajene(atjaunoti)}
</body>
</html>`}`;
}

export const datums = (d) => d.split("-").reverse().join(".");

export const statussPill = (statuss) => html`<span class="pill st-${statuss}">${STATUSI[statuss]}</span>`;

/** Amatpersona divās rindās (vārds + politiskais spēks; amats + kopš), lai šaurā šūnā rindas nelūzt pa vidu. */
export function amatpersonaRindas(a, klase) {
  if (!a) return html`<span class="${klase}">Amatpersona nav norādīta</span>`;
  const speks = a.saraksts ? a.saraksts.saisinajums : a.partija;
  return html`<span class="${klase}">${a.vards}${speks ? ` (${speks})` : ""}</span>
    <span class="${klase}">${a.amats}${a.pi ? " p. i." : ""} kopš <time class="mono" datetime="${a.no}">${datums(a.no)}</time></span>`;
}
