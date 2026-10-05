# Notikumi un Statusa maiņas

Formāts un manuālā plūsma (lēmums: "Statusa maiņas plūsma", #10). Pierādījuma standarts: `vertesana.md`. Vārdnīca: `CONTEXT.md`.

## Plūsma (manuālais režīms)

Redaktora Claude Code sesijā: `/notikums <url>` (`.claude/skills/notikums/SKILL.md`) → Notikums + tā izraisītās Statusa maiņas → **viens PR uz Notikumu** (zars `notikums/<id>`). Notikumu pievieno arī tad, ja Statuss nemainās. CI ("Dati") zaļš + redaktora apstiprinājums → merge.

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
    veids: saeima          # saeima | mk | likumi | vestnesis | csp | kase | zinas | cits
solijumi:
  - id: jv-…               # Solījuma id (data/solijumi/)
    virziens: par          # par | pret — ietekme uz iznākumu
    pamatojums: Kāpēc šis fakts tuvina vai attālina tieši šo iznākumu.
balsojums:                 # tikai Saeimas balsojumam; `npm run balsojums -- <datums> <meklējums>`
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
- `balsojums`: no Saeimas sēžu atvērtajiem datiem, nekad ar roku. `nebalsoja` = reģistrējies, bet nebalsoja; neklātesošie nav skaitīti. `komentars` — deputātu paziņojumi par kļūdu balsojumā (oficiālo rezultātu nemaina). 15. Saeimas Frakcijas kods ↔ Saraksts: `data/saraksti.yaml` `frakcija`; deputāts bez frakcijas nevienam Sarakstam netiek pieskaitīts.

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
- Statusa maiņa: Solījums ir Pārbaudāms; katrs Notikums eksistē un min šo Solījumu; `datums` = kāda tā Notikuma datums; datumi nesamazinās; Statuss mainās; atpakaļ uz Nav vērtēts nevar (shēma).
