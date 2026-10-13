# Notikumi un Statusa maiņas

Formāts un manuālā plūsma (lēmums: "Statusa maiņas plūsma", #10). Pierādījuma standarts: `vertesana.md`. Vārdnīca: `GLOSSARY.md`.

## Plūsma (manuālais režīms)

Redaktora Claude Code sesijā: `/notikums <url>` (`.claude/skills/notikums/SKILL.md`) → Notikums + tā izraisītās Statusa maiņas → **viens PR uz Notikumu** (zars `notikums/<id>`). Notikumu pievieno arī tad, ja Statuss nemainās. CI ("Dati") zaļš + redaktora apstiprinājums → merge.

## Grafika režīms (nedēļas AI pārskats)

Claude Code routine reizi nedēļā palaiž `/ai-parskats` (`.claude/skills/ai-parskats/SKILL.md`): `npm run --silent kandidati` → atlase pret Solījumiem → katram faktam `/notikums` (viens PR, zars `notikums/<id>`, ≤ 10 PR reizē) → kopsavilkums komentārā issue „AI pārskatu žurnāls”. Logs — pēdējās 14 dienas (ne agrāk par Vērtēšanas perioda sākumu); dublikāti — kandidāta atslēga (likumprojekta numurs + datums, Vēstneša `op/…`, TA numurs, balsojuma id) kādā Notikumā `main` vai `notikums/*` zarā. Noraidīta PR zars paliek → tas pats fakts netiek piedāvāts atkārtoti (lai piedāvātu — izdzēš zaru).

`npm run kandidati` avoti (robots.txt atļauts):

| Avots | Ko dod | Piezīmes |
|---|---|---|
| `saeima.lv/lawdata.json` | likumprojektu iesniegšana, galīgais lasījums, izsludināšana, noraidīšana | nedokumentēts; saites uz LIVS (nerāpo) |
| data.gov.lv `saeimas-sedes` | Saeimas lēmumi (`/Lm`) no balsojumu failiem | ~1 dienu pēc sēdes |
| data.gov.lv `tap-publicetie-tiesibu-akti` | MK projekti, iesniegti logā (TA numurs, tips, progress) | tekošā mēneša fails var kavēties — tad piezīme |
| `vestnesis.lv/laidiens/YYYY/MM/DD` | "Tiesību akti" (bez pašvaldībām): likumi, MK noteikumi, rīkojumi, protokoli | Crawl-delay 1; RSS `/feed/JL` dod tikai pēdējo laidienu |
| `lsm.lv/assets/sitemap/news_lv_<nedēļa>.xml` | **norāde**, ne pierādījums: LSM ziņas (`zinas/latvija`, `zinas/ekonomika`) — saite, datums, URL slug | nedēļa sākas svētdienā (`2026W41`); RSS dod tikai ~1 dienu |

CSP un Valsts kase — tikai pēc vajadzības skaitliskam Solījumam.

**LSM ziņas** (redaktora lēmums 2026-10-13) ir tikai norāde uz faktu, ko oficiālie avoti vēl nerāda vai ko rīks nenoķer (piem., MK lēmums pirms Vēstneša, CSP dati). Notikums vienmēr balstās oficiālā dokumentā; bez tā Notikumu neveido. LSM [lietošanas noteikumi](https://www.lsm.lv/lietosanas-noteikumi/) satura izmantošanu atļauj tikai ar rakstisku atļauju, bet dalīties ar hipersaiti drīkst. Tāpēc:

- automātiski lasa tikai sitemap (robots.txt to norāda); rakstu tekstu rīks neielādē;
- AI atver tikai atlasītos rakstus (pēc slug), lai atrastu oficiālo dokumentu — kā lasītājs, ne masveidā;
- repo, PR un kopsavilkumā LSM ir tikai saite (`veids: zinas`); tekstu, citātus un virsrakstus nekopē — `apraksts` raksta pēc oficiālā dokumenta.

## Notikums

`data/notikumi/<id>.yaml`, `id` = `<datums>-<slug>` (slug: mazie latīņu burti bez diakritikas, ≤ 6 vārdi). Shēma: `schemas/notikums.schema.json`.

```yaml
id: 2026-09-17-nodoklu-likums-galigais-lasijums
datums: 2026-09-17        # kad fakts notika
nosaukums: Saeima galīgajā lasījumā pieņem grozījumus likumā "Par nodokļiem un nodevām"
apraksts: >-
  Īss neitrāls fakta apraksts: kas notika, kas mainās, kad stājas spēkā.
avoti:
  - url: https://…
    veids: saeima          # saeima (arī Saeimas atvērtie dati data.gov.lv) | mk (arī TAP) | likumi | vestnesis | csp | kase | zinas | cits
solijumi:
  - id: jv-…               # Solījuma id (data/solijumi/)
    virziens: par          # par | pret — ietekme uz iznākumu
    pamatojums: Kāpēc šis fakts tuvina vai attālina tieši šo iznākumu.
balsojums:                 # tikai Saeimas balsojumam; `npm run --silent balsojums -- <datums> <meklējums>`
  saeima: 14
  id: 827a2c9a-1251-4e0f-9eb7-4e01e166a61c   # VOTING_ID
  laiks: 2026-09-17T10:02:12
  motivs: Grozījumi likumā “Par nodokļiem un nodevām” (1065/Lp14), 3.lasījums
  datu_avots: https://data.gov.lv/…-vote.xml
  kopa: { par: 73, pret: 3, atturas: 0 }
  frakcijas:               # Frakcijas kods kā datos; bez_frakcijas — deputāti bez frakcijas
    JV: { par: 18, pret: 0, atturas: 0, nebalsoja: 4 }
    bez_frakcijas: { par: 11, pret: 3, atturas: 0, nebalsoja: 2 }
piezimes: ""
jautajums: ""              # neskaidrība redaktoram; pirms merge jābūt tukšam
```

- `avoti`: ≥1 oficiāls (ne `zinas`). Ziņa — tikai norāde uz oficiālo dokumentu.
- `balsojums`: no Saeimas sēžu atvērtajiem datiem, nekad ar roku. Rīks meklē visos tās dienas balsojumu failos (vienā dienā var būt vairākas sēdes) un izlaiž procedūras balsojumus (priekšlikumi, steidzamība), ja nav `--visi`. `nebalsoja` = reģistrējies, bet nebalsoja; neklātesošie nav skaitīti. `komentars` — deputātu paziņojumi par kļūdu balsojumā (oficiālo rezultātu nemaina). 15. Saeimas Frakcijas kods ↔ Saraksts: `data/saraksti.yaml` `frakcija`; deputāts bez frakcijas nevienam Sarakstam netiek pieskaitīts. 14. Saeimas kodi (piem., "LPV") uz Sarakstiem **netiek** kartēti, arī ja nosaukums sakrīt.

## Statusa maiņa

Solījuma failā (`data/solijumi/<saraksts>/<id>.yaml`), hronoloģiski:

```yaml
statusa_mainas:
  - datums: 2026-09-17     # noteicošā Notikuma datums
    statuss: procesa       # procesa | izpildits | daleji-izpildits | nav-izpildits
    notikumi: [2026-09-17-nodoklu-likums-galigais-lasijums]
    pamatojums: Kāpēc Notikums atbilst šī Statusa standartam (vertesana.md).
```

Pašreizējais Statuss = pēdējā Statusa maiņa; bez `statusa_mainas` — Nav vērtēts.

## CI (`npm run parbaude`)

- Notikums: shēma; `id` = faila vārds un sākas ar `datums`; ≥1 oficiāls avots; Solījumi eksistē un neatkārtojas; `balsojums.laiks` diena = `datums`; viens balsojums tikai vienā Notikumā; 15. Saeimas Frakcijas kods ir `data/saraksti.yaml`; `jautajums` tukšs.
- Statusa maiņa: Solījums ir Pārbaudāms; katrs Notikums eksistē, min šo Solījumu un nav pirms vēlēšanu dienas (Vērtēšanas periods, `vertesana.md`); `datums` = kāda tā Notikuma datums; datumi nesamazinās; Statuss mainās; atpakaļ uz Nav vērtēts nevar (shēma).
