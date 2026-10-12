// Visas lapas: { cels (URL), fails (dist/), html, og (Solījums, kam blakus ģenerē og.png) }. Cloudflare html_handling: "auto-trailing-slash".
import { html } from "../html.js";
import { izkartojums, SAITE } from "./izkartojums.js";
import { sakums } from "./sakums.js";
import { solijums } from "./solijums.js";
import { salidzinajums } from "./salidzinajums.js";
import { metodologija } from "./metodologija.js";

const lapa = (cels, html, og) => ({ cels, fails: cels === "/404" ? "404.html" : `${cels.slice(1)}index.html`, html, og });

export function lapas(m) {
  return [
    lapa("/", sakums(m)),
    lapa("/salidzinajums/", salidzinajums(m)),
    lapa("/metodologija/", metodologija(m)),
    ...m.solijumi.map((s) => lapa(`/solijumi/${s.id}/`, solijums(s, m), s)),
    lapa(
      "/404",
      izkartojums({ virsraksts: "Lapa nav atrasta", apraksts: "", atjaunoti: m.atjaunoti, saturs: html`<h1>Lapa nav atrasta</h1><p><a href="/">Uz sākumu</a></p>` }),
    ),
  ];
}

const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Faili blakus lapām: `_redirects` (Pārvirzījumi — aizstātu Solījumu ID, tikai statiski noteikumi,
 * jo Cloudflare dinamisko (ar `*`) limits ir 100) un `sitemap.xml` (visas lapas, izņemot 404).
 */
export function papildFaili(m, visas) {
  const parvirzijumi = m.parvirzijumi.flatMap(({ no, uz }) =>
    [`/solijumi/${no}`, `/solijumi/${no}/`].map((c) => `${c} /solijumi/${uz}/ 301`).concat(`/solijumi/${no}/og.png /solijumi/${uz}/og.png 301`),
  );
  const urli = visas.filter((l) => l.cels !== "/404").map((l) => `<url><loc>${xml(SAITE + l.cels)}</loc></url>`);
  return [
    ...(parvirzijumi.length ? [{ fails: "_redirects", saturs: parvirzijumi.map((r) => `${r}\n`).join("") }] : []),
    {
      fails: "sitemap.xml",
      saturs: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urli.join("\n")}\n</urlset>\n`,
    },
  ];
}
