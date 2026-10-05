# Vienas izpildes palaišana

Viena izpilde = viena CVK nodaļa viena Saraksta = viens PR (`metode.md` §0). Nodaļas pēc kārtas, kā `data/saraksti.yaml` → `nodalas`; pēdējā izpilde — "Ārpus CVK nodaļām".

Vienreiz: `npm ci` (Node ≥ 24).

## Pirms pirmās izpildes Sarakstam

- Paplašinātās programmas teksts ir `sources/paplasinata/` un reģistrēts `data/saraksti.yaml` (`sources/README.md`).
- `data/iestades.yaml` eksistē.
- `npm run parbaude` — bez kļūdām.

## Izpilde

1. Zars no `main`: `ekstrakcija/<saraksts>-<nodaļas nr>`, piem., `ekstrakcija/jv-03`.
2. Ekstraktors — atsevišķs aģents (jauna sesija vai subagent), kas redz tikai:
   - `docs/ekstrakcija/metode.md`, `CONTEXT.md`;
   - CVK programmas failu un paplašinātās programmas failu(-s) no `data/saraksti.yaml`;
   - esošos `data/solijumi/<saraksts>/*.yaml`;
   - `data/temas.yaml`, `data/iestades.yaml`.

   Uzdevums: "Saraksts `<slug>`, CVK nodaļa `<nosaukums>` (paplašinātās nodaļas: `atbilst_cvk`). Izraksti Solījumus pēc `metode.md`; raksti `data/solijumi/<slug>/`; kopsavilkumu (§9) — `parskats/<slug>-<nr>-kopsavilkums.md`."
3. `npm run parbaude` — labo, līdz paliek tikai `jautajums` kļūdas.
4. Pārskats: `npm run parskats -- <slug> "<nodaļa>" --kopsavilkums parskats/<slug>-<nr>-kopsavilkums.md` → `parskats/<slug>-<nodaļa>.html` (atver pārlūkā).
   - Kreisi avots: zaļš = izrakstīts, sarkans = neizrakstīts, pelēks = nav jāizraksta. Klikšķis → Solījums.
   - Labi Solījumi: "Šajā zarā" = jauni vai mainīti pret `origin/main` (`--bazes-zars` maina).
5. PR uz `main`: nosaukums "Ekstrakcija: <Saraksts> — <nodaļa>", apraksts = kopsavilkums.
6. Redaktors pārbauda pēc `parbaude.md` pārskatā. Atsauksmes — pogas pie Solījumiem → "Kopēt atsauksmi" → ekstraktoram; atbildes uz `jautajums` → labojumi failos, lauks tukšs.
7. CI ("Dati") zaļš → merge. Nākamā nodaļa — no jaunā `main`.
