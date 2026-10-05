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
| `/salidzinajums/` | Matrica saraksts × galvenā tēma; tēma — `?tema=<slug>#<slug>` (visas tēmas statiskajā HTML) |

Filtru stāvoklis — query parametros. Saraksta, Tēmas un Notikuma lapu nav.

## Komandas

- `npm run dev` — dev serveris ar `data/`; `KO_DATI=fixtures npm run dev` — ar paraugdatiem (`fixtures/`, nav īsti dati).
- `npm run build` — `dist/`; `npm run preview` — build + `wrangler dev` (kā produkcijā).

## Izvietošana

Workers Builds (Cloudflare panelī): build `npm run build`, deploy `npx wrangler deploy` (`main`), citi zari — `npx wrangler versions upload` (preview URL). `lapa/public/_headers` pagaidām aizliedz indeksēšanu (`X-Robots-Tag: noindex`) — noņemt palaišanā.

## Solījuma lapa: saites un Frakciju balsojums (#36)

- **Saites uz filtrētu pārskatu** — tikai caur `parskatsSaite({ saraksts, atbildigais, tema })` (`lapa/lapas/saites.js`): `/?saraksts=<slug>&atbildigais=<iestādes slug>&tema=<slug>`, tukšos izlaiž, secība nemainīga. Saraksts ceļā, Atbildīgais un Tēma joslā (arī papildu — tās filtrē, bet neskaita), „Visi … solījumi šajā tēmā” citu Sarakstu blokā.
- **Frakciju balsojums** — 15. Saeimā frakcijas kods → Saraksts pēc `data/saraksti.yaml` `frakcija` (`frakcijasSaraksts`, `lapa/dati.js`); bez frakcijas — nevienam. 14. Saeimā rāda kodus kā Saeimas datos ar piezīmi, ka tie nav šo vēlēšanu Saraksti.

## Salīdzinājums (`/salidzinajums/`, #37)

- **Matrica** — rindas: Saraksti (CVK numuru secībā), kolonnas: 19 Tēmas (taksonomijas secībā, vertikālas galvenes); skaits pēc galvenās tēmas, 0 → „·”. Tēmas galvene un šūna ar skaitu — saite uz tēmu. Telefonā matrica ritinās savā konteinerā, saraksta kolonna paliek redzama.
- **Tēmas sadaļa** — „<Tēma> — visi saraksti blakus”: visi 6 Saraksti (arī bez solījumiem tēmā), Solījums = nosaukums (saite uz Solījuma lapu), Statuss, Atbildīgā iestāde. Solījumi ar šo papildu tēmu ir sarakstā pēc galvenajiem ar norādi „Galvenā tēma: …” (papildu tēma ietekmē atrašanu, ne skaitu — matricas skaitlis var būt mazāks par sarakstā redzamo).
- **Bez JS: visas tēmas vienā statiskā lapā.** Katra tēma ir `<section id="<slug>">`; saites ir `/salidzinajums/?tema=<slug>#<slug>` (`temaSaite()` `lapa/lapas/salidzinajums.js`), tāpēc bez JS pārlūks pāriet uz enkuru. Ar JS `<ko-salidzinajums>` (`lapa/klients/ko-salidzinajums.js`) pēc `?tema=` rāda tikai izvēlēto tēmu, iezīmē tās kolonnu un, klikšķinot matricā, maina URL ar `pushState` (atpakaļ poga strādā). Bez `?tema=` (vai ar nezināmu) — visas tēmas.
  - Kāpēc ne lapa katrai tēmai (`/salidzinajums/<slug>/`): `?tema=` jau ir lēmums (#13) un saites no Solījuma lapas to lieto; Tēmu lapas SEO nolūkā ir atliktas (#1 „Not yet specified”); Worker ir tikai statiskie faili, tāpēc `?tema=` bez JS nevar novirzīt uz citu lapu. Viena lapa = viens URL ar un bez JS.
  - Cena: lapas izmērs aug ar Solījumu skaitu (katrs Solījums 1–3 reizes). Ar 50 JV Solījumiem — 78 kB (gzip ~6 kB). Ja pēc pilnās ekstrakcijas lapa kļūst pārāk smaga telefonā, var pāriet uz lapu katrai tēmai, saglabājot `?tema=` ar JS novirzi.
