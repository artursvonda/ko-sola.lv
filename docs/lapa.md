# Lapa

Lēmums: "Lapas būvēšana (B1, Grafīts)" (#13). Dizains: "Dizaina varianti Claude Design" (#7). Hostings: #5.

## Tehnika

Statisks HTML no repo datiem, Vite + Web Components + Open Props, Cloudflare Worker ar statiskajiem failiem.

- **Šabloni** — JS funkcijas ar `html` tagged template (`lapa/html.js`: vērtības escapētas; `raw()` — bez escapēšanas). Lapas: `lapa/lapas/`, visu lapu saraksts `lapa/lapas/index.js`.
- **Modelis** — `lapa/dati.js`: `data/` + Solījumi un Notikumi ar atvasināto Statusu, Amatpersonu (build dienā) un Notikumu saitēm.
- **Vite plugin** — `lapa/vite-plugin.js`: dev serverī renderē lapu pēc pieprasījuma (datu/šablonu izmaiņas → pārlāde); build laikā bundlē `lapa/klients/main.js` un izdod katru lapu kā `dist/<ceļš>/index.html` ar hešotajām saitēm.
- **Klients** — `lapa/klients/`: stili (Grafīts tokeni + Open Props) un Web Components tikai kā progresīvais uzlabojums (light DOM). Bez JS viss saturs ir redzams un saites strādā; nestrādā tikai pārskata filtri (`/` rāda visus Solījumus, arī ar filtra query parametriem — to saka `<noscript>` paziņojums) un detaļu panelis.
- **Fonti** — IBM Plex Sans/Mono pašhostēti (`@fontsource`, latin + latin-ext).

## URL

| Ceļš | Lapa |
|---|---|
| `/` | Pārskats: progress, filtri, tabula, detaļu panelis |
| `/solijumi/<id>/` | Solījuma lapa (ID pēc publicēšanas nemainās) |
| `/salidzinajums/` | Matrica saraksts × galvenā tēma; tēma — `?tema=<slug>#<slug>` (visas tēmas statiskajā HTML) |

Filtru stāvoklis — query parametros. Saraksta, Tēmas un Notikuma lapu nav.

## Pārskats (`/`)

- **Filtri** — `?saraksts=<saraksts.slug>&atbildigais=<iestade.slug>&tema=<tema.slug>` (pa vienai vērtībai; saite — `parskatsSaite()` `lapa/lapas/saites.js`). Loģika bez DOM — `lapa/klients/filtri.js` (lieto serveris un klients).
  - Princips: skaitlis vienmēr sakrīt ar to, ko lasītājs redz. Skaits blakus izvēlei = galvenās grupas rindu skaits pēc tās izvēles: tikai pēc galvenās Tēmas/iestādes, arī pārējo grupu filtriem (`skaiti()`).
  - Izvēles ar 0 nerāda (`<li hidden>`), bet tās paliek DOM: slug derīgs URL (saites no Solījuma lapas uz tikai-papildu vērtību strādā), izvēli rāda virsraksts. Izvēlēto opciju rāda arī ar 0.
  - Secība: Atbildīgie un Tēmas — pēc nosaukuma latviešu alfabētā (`Intl.Collator("lv")`), Saraksti — pēc CVK numura.
- **Rindu grupas** (`grupa()`): ar filtru tabulā augšā galvenā grupa (atbilst ar galvenajām vērtībām), zem tās virsraksts „Saistīti arī (papildu): N” un Solījumi, kas atbilst tikai ar papildu Tēmu vai iestādi. Bez filtra — viens saraksts. Rindās „arī …” piezīmju nav (grupa tās aizstāj).
- **Progress** — „X no N solījumiem izpildīti”, statusu josla un skaiti tikai galvenajai grupai; N bez Nepārbaudāmajiem. Josla ir dekoratīva (`aria-hidden`): tieši zem tās — leģenda tajā pašā Statusu secībā ar vārdu, formu un skaitu (Colour Is Never Alone).
- **Tukšs** — ja nav nevienas rindas (arī papildu): „Ar šiem filtriem solījumu nav.” + „Notīrīt filtrus” (`/`, piemēro uz vietas).
- **Bez JS** — redzamas visas rindas un sākotnējie skaiti, filtrus nerāda (`ko-parskats:not(:defined)`), rindas virsraksts ir saite uz Solījuma lapu. Filtra query parametrus (piem., saite no Solījuma lapas) bez JS nevar piemērot — `<noscript>`: „Filtri darbojas tikai ar JavaScript — redzami visi solījumi.”
- **Navigācijas saites** — filtru izvēles un matricas (`/salidzinajums/`) galvenes/šūnas ir navigācija, ne teksta saites: izņēmums no DESIGN.md Links (bez pasvītrojuma; hover un `:focus-visible` — pasvītro, fokusam arī 2px accent outline). Izvēlētais filtrs — selection wash + 2px accent `border-left`.
- **`<ko-parskats>`** (`lapa/klients/ko-parskats.js`) — nolasa query, slēpj rindas (`hidden`), pārrēķina skaitus, filtra maiņa — `pushState`. No 64rem filtri sānos, šaurāk — atverama rinda „Filtri”.
- **Detaļu panelis** — no 75rem rindas klikšķis atver paneli blakus tabulai ar `pushState` uz `/solijumi/<id>/`; saturu ņem no pašas Solījuma lapas HTML (`lapa/klients/panelis.js`: citāts ar avotu, josla ar Atbildīgo un Amatpersonu, 3 jaunākie laika ass ieraksti, saite uz pilno lapu). Šaurāk — parasta saite. Esc / × / „Atpakaļ” aizver. Saite uz pārskatu (`/?…`, piem., Atbildīgais vai Tēma joslā) panelī aizver paneli un piemēro filtrus uz vietas (`pushState`, bez pārlādes; „Atpakaļ” atgriež paneli); pārējās saites — kā parasti.

## Komandas

- `npm run dev` — dev serveris ar `data/`; `KO_DATI=fixtures npm run dev` — ar paraugdatiem (`fixtures/`, nav īsti dati).
- `npm run build` — `dist/`; `npm run preview` — build + `wrangler dev` (kā produkcijā).

## Izvietošana

Workers Builds (Cloudflare panelī): build `npm run build`, deploy `npx wrangler deploy` (`main`), citi zari — `npx wrangler versions upload` (preview URL). `lapa/public/_headers` pagaidām aizliedz indeksēšanu (`X-Robots-Tag: noindex`) — noņemt palaišanā.

## Solījuma lapa: saites un Frakciju balsojums (#36)

- **Saites uz filtrētu pārskatu** — tikai caur `parskatsSaite({ saraksts, atbildigais, tema })` (`lapa/lapas/saites.js`): `/?saraksts=<slug>&atbildigais=<iestādes slug>&tema=<slug>`, tukšos izlaiž, secība nemainīga. Saraksts ceļā, Atbildīgais un Tēma joslā (arī papildu — tās filtrē, bet neskaita), „Visi … solījumi šajā tēmā (N)” citu Sarakstu blokā: N = galvenās grupas rindu skaits pārskatā pēc šīs saites (tests `lapa/test/sakums.test.js`).
- **Frakciju balsojums** — 15. Saeimā frakcijas kods → Saraksts pēc `data/saraksti.yaml` `frakcija` (`frakcijasSaraksts`, `lapa/dati.js`); rindā tikai Saraksts, kods — `title`; secība — Sarakstu CVK numuri, tad nekartētie kodi, „Bez frakcijas” pēdējā. Citās Saeimās — kodi kā Saeimas datos un to secībā, ar piezīmi „Balsojums {N}. Saeimā. Tās frakcijas nav tas pats, kas 2026. gada vēlēšanu Saraksti.”

## Salīdzinājums (`/salidzinajums/`, #37)

- **Matrica** — rindas: Saraksti (CVK numuru secībā), kolonnas: 19 Tēmas (taksonomijas secībā, vertikālas galvenes); skaits pēc galvenās tēmas, 0 → „·”. Tēmas galvene un šūna ar skaitu — saite uz tēmu. Telefonā matrica ritinās savā konteinerā, saraksta kolonna paliek redzama.
- **Tēmas sadaļa** — „<Tēma> — visi saraksti blakus”: visi 6 Saraksti (arī bez solījumiem tēmā), Solījums = nosaukums (saite uz Solījuma lapu), Statuss, Atbildīgā iestāde. Solījumi ar šo papildu tēmu ir pēc galvenajiem zem virsraksta „Saistīti arī (papildu): N” (kā pārskatā) ar norādi „Galvenā tēma: …” (papildu tēma ietekmē atrašanu, ne skaitu — matricas skaitlis var būt mazāks par sarakstā redzamo).
- **Bez JS: visas tēmas vienā statiskā lapā.** Katra tēma ir `<section id="<slug>">`; saites ir `/salidzinajums/?tema=<slug>#<slug>` (`temaSaite()` `lapa/lapas/saites.js`), tāpēc bez JS pārlūks pāriet uz enkuru. Ar JS `<ko-salidzinajums>` (`lapa/klients/ko-salidzinajums.js`) pēc `?tema=` rāda tikai izvēlēto tēmu, iezīmē tās kolonnu un, klikšķinot matricā, maina URL ar `pushState` (atpakaļ poga strādā). Bez `?tema=` (vai ar nezināmu) — visas tēmas (noklusētās tēmas nav). Vienas tēmas skatā virs tās — „Rādīt visas tēmas” (`/salidzinajums/`, `pushState`, atjauno visas sadaļas; fokuss paliek pie līdz šim izvēlētās tēmas); bez JS saite paslēpta.
  - Kāpēc ne lapa katrai tēmai (`/salidzinajums/<slug>/`): `?tema=` jau ir lēmums (#13) un saites no Solījuma lapas to lieto; Tēmu lapas SEO nolūkā ir atliktas (#1 „Not yet specified”); Worker ir tikai statiskie faili, tāpēc `?tema=` bez JS nevar novirzīt uz citu lapu. Viena lapa = viens URL ar un bez JS.
  - Cena: lapas izmērs aug ar Solījumu skaitu (katrs Solījums 1–3 reizes). Ar 50 JV Solījumiem — 78 kB (gzip ~6 kB). Ja pēc pilnās ekstrakcijas lapa kļūst pārāk smaga telefonā, var pāriet uz lapu katrai tēmai, saglabājot `?tema=` ar JS novirzi.
