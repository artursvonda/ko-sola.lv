# PROTOTIPS — Solījumu ekstrakcijas metode

Izmetams. Atbild uz kartes biļeti "Solījumu ekstrakcijas metode": kā no programmu tekstiem iegūt Solījumus atkārtojami.

Paraugs: Jaunā VIENOTĪBA, nodaļas "1. Drošība un aizsardzība" un "3. Finanses" (CVK + paplašinātā programma).

- `metode.md` — ekstraktora prompts v0 (noteikumi + YAML formāts).
- `parbaude.md` — redaktora pārbaudes saraksts v0.
- `avoti/` — paplašinātās programmas teksts (PDF → teksts, pypdf), pilns un 1.+3. nodaļas fragments.
- `izvade/` — ekstraktora rezultāts (atsevišķs aģents, kas redzēja tikai `metode.md`, `CONTEXT.md` un avotus).
- `parskats.py` → `parskats.html` — avots blakus Solījumiem: zaļš = izrakstīts, sarkans = neizrakstīts, pelēks = nav jāizraksta; citātu burtiskuma pārbaude; atsauksmes pogas + "Kopēt atsauksmi".

Palaist: `python3 parskats.py && open parskats.html` (vajag PyYAML).

## v1 / v1.1 (pēc redaktora atbildēm)

- `metode-v1.1.md` — kopija no `docs/ekstrakcija/metode.md` (galvenā versija ir tur).
- `izvade-v1/1-drosiba`, `izvade-v1/3-finanses` — v1, divas paralēlas izpildes, visa paplašinātā programma.
- `izvade-v11/` — v1.1, secīgi: 1. nodaļa (v1) + 3. nodaļa ar v1.1 (papildina esošos Solījumus).
- Pārskats: `python3 parskats.py izvade-v11 "1. Drošība un aizsardzība" "3. Finanses"` → `izvade-v11/parskats.html`.
