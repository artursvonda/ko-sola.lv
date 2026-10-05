# Lapa

Lēmums: "Lapas būvēšana (B1, Grafīts)" (#13). Dizains: "Dizaina varianti Claude Design" (#7). Hostings: #5.

## Tehnika

Statisks HTML no repo datiem, Vite + Web Components + Open Props, Cloudflare Worker ar statiskajiem failiem.

- **Šabloni** — JS funkcijas ar `html` tagged template (`lapa/html.js`: vērtības escapētas; `raw()` — bez escapēšanas). Lapas: `lapa/lapas/`, visu lapu saraksts `lapa/lapas/index.js`.
- **Modelis** — `lapa/dati.js`: `data/` + Solījumi un Notikumi ar atvasināto Statusu, Amatpersonu (build dienā) un Notikumu saitēm.
- **Vite plugin** — `lapa/vite-plugin.js`: dev serverī renderē lapu pēc pieprasījuma (datu/šablonu izmaiņas → pārlāde); build laikā bundlē `lapa/klients/main.js` un izdod katru lapu kā `dist/<ceļš>/index.html` ar hešotajām saitēm.
- **Klients** — `lapa/klients/`: stili (Grafīts tokeni + Open Props) un Web Components tikai kā progresīvais uzlabojums (light DOM). Saturs pilnībā strādā bez JS.
- **Fonti** — IBM Plex Sans/Mono pašhostēti (`@fontsource`, latin + latin-ext).

## URL

| Ceļš | Lapa |
|---|---|
| `/` | Pārskats: progress, filtri, tabula, detaļu panelis |
| `/solijumi/<id>/` | Solījuma lapa (ID pēc publicēšanas nemainās) |
| `/salidzinajums/` | Matrica saraksts × galvenā tēma; tēma — `?tema=` |

Filtru stāvoklis — query parametros. Saraksta, Tēmas un Notikuma lapu nav.

## Pārskats (`/`)

- **Filtri** — `?saraksts=<saraksts.slug>&atbildigais=<iestade.slug>&tema=<tema.slug>` (pa vienai vērtībai; saite — `parskatsSaite()` `lapa/lapas/saites.js`). Papildu Tēma un papildu iestāde atbilst filtram, bet skaitu blakus izvēlei rēķina tikai pēc galvenās; katras grupas skaiti ņem vērā pārējo grupu filtrus. Loģika bez DOM — `lapa/klients/filtri.js` (lieto serveris un klients).
- **Progress** — „X no N solījumiem izpildīti”, statusu josla un skaiti filtrētajām rindām; N bez Nepārbaudāmajiem.
- **Bez JS** — redzamas visas rindas un sākotnējie skaiti, filtrus nerāda (`ko-parskats:not(:defined)`), rindas virsraksts ir saite uz Solījuma lapu.
- **`<ko-parskats>`** (`lapa/klients/ko-parskats.js`) — nolasa query, slēpj rindas (`hidden`), pārrēķina skaitus, filtra maiņa — `pushState`. No 64rem filtri sānos, šaurāk — atverama rinda „Filtri”.
- **Detaļu panelis** — no 75rem rindas klikšķis atver paneli blakus tabulai ar `pushState` uz `/solijumi/<id>/`; saturu ņem no pašas Solījuma lapas HTML (`lapa/klients/panelis.js`: citāts ar avotu, josla ar Atbildīgo un Amatpersonu, 3 jaunākie laika ass ieraksti, saite uz pilno lapu). Šaurāk — parasta saite. Esc / × / „Atpakaļ” aizver.

## Komandas

- `npm run dev` — dev serveris ar `data/`; `KO_DATI=fixtures npm run dev` — ar paraugdatiem (`fixtures/`, nav īsti dati).
- `npm run build` — `dist/`; `npm run preview` — build + `wrangler dev` (kā produkcijā).

## Izvietošana

Workers Builds (Cloudflare panelī): build `npm run build`, deploy `npx wrangler deploy` (`main`), citi zari — `npx wrangler versions upload` (preview URL). `lapa/public/_headers` pagaidām aizliedz indeksēšanu (`X-Robots-Tag: noindex`) — noņemt palaišanā.
