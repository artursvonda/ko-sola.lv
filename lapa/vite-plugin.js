// Statiskās lapas no repo datiem. Dev: renderē pēc pieprasījuma (dati un šabloni vienmēr svaigi).
// Build: klienta ieeja tiek bundlēta, tad katra lapa izdota kā HTML fails ar hešotajām CSS/JS saitēm;
// Solījuma lapai blakus — og.png (lapa/og.js).
import { join } from "node:path";
import { RESURSI } from "./lapas/izkartojums.js";

const KLIENTS = "lapa/klients/main.js";
const SABLONI = ["/lapa/dati.js", "/lapa/lapas/index.js"];
const OG = "/lapa/og.js";
const OG_FAILS = "og.png";

function modelaOpcijas(sakne) {
  const dati = process.env.KO_DATI;
  return { sakne, datuSakne: dati ? join(sakne, dati) : sakne };
}

async function renderet(ieladet, sakne) {
  const [{ ieladetModeli }, { lapas }] = await Promise.all(SABLONI.map(ieladet));
  return lapas(ieladetModeli(modelaOpcijas(sakne)));
}

export function koLapas() {
  let sakne;
  return {
    name: "ko-lapas",
    config: () => ({ appType: "custom", build: { rollupOptions: { input: KLIENTS } } }),
    configResolved(c) {
      sakne = c.root;
    },

    configureServer(server) {
      server.watcher.add(["data", "fixtures"].map((d) => join(sakne, d)));
      server.watcher.on("all", (_, fails) => {
        if (/\/(data|fixtures)\/.*\.yaml$|\/lapa\/(lapas\/|dati\.js|html\.js|og\.js)/.test(fails)) server.ws.send({ type: "full-reload" });
      });
      server.middlewares.use(async (req, res, next) => {
        try {
          const cels = new URL(req.url, "http://x").pathname;
          if (req.method === "GET" && cels.endsWith(`/${OG_FAILS}`)) {
            const visas = await renderet((m) => server.ssrLoadModule(m), sakne);
            const lapa = visas.find((l) => l.og && `${l.cels}${OG_FAILS}` === cels);
            if (!lapa) return next();
            const { ogAttels } = await server.ssrLoadModule(OG);
            res.setHeader("Content-Type", "image/png");
            res.end(await ogAttels(lapa.og));
            return;
          }
          if (req.method !== "GET" || /\.[a-z0-9]+$/i.test(cels) || cels.startsWith("/@")) return next();
          const visas = await renderet((m) => server.ssrLoadModule(m), sakne);
          const lapa = visas.find((l) => l.cels === cels);
          if (!lapa && visas.some((l) => l.cels === `${cels}/`)) {
            res.writeHead(307, { Location: `${cels}/` }).end();
            return;
          }
          const atrasta = lapa ?? visas.find((l) => l.cels === "/404");
          const teksts = atrasta.html.replace(RESURSI, `<script type="module" src="/${KLIENTS}"></script>`);
          res.statusCode = lapa ? 200 : 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(await server.transformIndexHtml(req.url, teksts));
        } catch (e) {
          next(e);
        }
      });
    },

    async generateBundle(_, bundle) {
      const ieeja = Object.values(bundle).find((c) => c.type === "chunk" && c.isEntry);
      const resursi = [
        ...[...(ieeja.viteMetadata?.importedCss ?? [])].map((f) => `<link rel="stylesheet" href="/${f}">`),
        `<script type="module" src="/${ieeja.fileName}"></script>`,
      ].join("\n");
      const visas = await renderet((m) => import(join(sakne, m)), sakne);
      const { ogAttels } = await import(join(sakne, OG));
      for (const l of visas) {
        this.emitFile({ type: "asset", fileName: l.fails, source: l.html.replace(RESURSI, resursi) });
        if (l.og) this.emitFile({ type: "asset", fileName: `${l.cels.slice(1)}${OG_FAILS}`, source: await ogAttels(l.og) });
      }
    },
  };
}
