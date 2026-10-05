// Visas lapas: { cels (URL), fails (dist/), html, og (Solījums, kam blakus ģenerē og.png) }. Cloudflare html_handling: "auto-trailing-slash".
import { html } from "../html.js";
import { izkartojums } from "./izkartojums.js";
import { sakums } from "./sakums.js";
import { solijums } from "./solijums.js";
import { salidzinajums } from "./salidzinajums.js";

const lapa = (cels, html, og) => ({ cels, fails: cels === "/404" ? "404.html" : `${cels.slice(1)}index.html`, html, og });

export function lapas(m) {
  return [
    lapa("/", sakums(m)),
    lapa("/salidzinajums/", salidzinajums(m)),
    ...m.solijumi.map((s) => lapa(`/solijumi/${s.id}/`, solijums(s, m), s)),
    lapa(
      "/404",
      izkartojums({ virsraksts: "Lapa nav atrasta", apraksts: "", saturs: html`<h1>Lapa nav atrasta</h1><p><a href="/">Uz sākumu</a></p>` }),
    ),
  ];
}
