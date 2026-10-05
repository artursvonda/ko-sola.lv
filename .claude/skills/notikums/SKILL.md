---
name: notikums
description: Pievieno ko-sola.lv Notikumu no avota URL — Notikuma fails, tā izraisītās Statusa maiņas un viens PR. Lieto, kad redaktors raksta "/notikums <url>" vai lūdz pievienot Notikumu (pieņemts likums, balsojums, MK lēmums, statistika) Solījumiem.
argument-hint: <url>
---

# /notikums <url>

Viens izsaukums = viens Notikums = viens PR. Tu sagatavo melnrakstu; redaktors apstiprina ar merge. **Neko neizdomā**: katrs fakts no avota; ja nav pārliecības — `jautajums`, nevis minējums.

Vispirms izlasi: `CONTEXT.md`, `docs/statusi/vertesana.md` (pierādījuma standarts), `docs/statusi/notikumi.md` (formāts).

## 1. Sagatavošana

- `git switch main && git pull && npm ci`; darba koks tīrs.

## 2. Avots

- **Nerāpo** (robots.txt): `titania.saeima.lv` (LIVS), `likumi.lv/rss/`, `delfi.lv`, `tvnet.lv`. Šādas saites drīkst ierakstīt `avoti`, bet neatver — lūdz redaktoram oficiālo dokumentu citā vietā (Saeimas atvērtie dati, vestnesis.lv, TAP, mk.gov.lv) vai tekstu.
- Citam domēnam pirms atvēršanas pārbaudi `robots.txt`. Atver tikai doto URL un tieši saistītos oficiālos dokumentus, nevis rāpo vietni.
- Ja URL ir ziņa: atrodi oficiālo dokumentu, uz kuru tā norāda. Ziņa paliek tikai kā `veids: zinas`. **Bez oficiāla avota Notikumu neveido** — pasaki redaktoram, kāpēc.

## 3. Fakts

- Kas notika, `datums` (kad fakts notika, nevis publicēts ziņās), oficiālais avots un tā `veids`.
- Saeimā Notikums ir iesniegšana vai galīgais lasījums; citi lasījumi — tikai, ja būtiski grozījumi vai noraidījums (`vertesana.md`).
- **Dublikāti**: `grep -rl` `data/notikumi/` pēc avota URL, likumprojekta numura (piem., `1065/Lp14`), balsojuma id; `gh pr list --state open --search "<numurs vai atslēgvārds>"`. Ja jau ir — pasaki un beidz.

## 4. Solījumi

- Meklē visos Sarakstos (koalīcija un opozīcija vienādi): `grep -ril` `data/solijumi/` pēc atslēgvārdiem un sinonīmiem, arī pēc `temas`/`iestades`. Izlasi katru kandidātu pilnībā (citāti, `nesakritiba`, `statusa_mainas`).
- Iekļauj Solījumu tikai, ja fakts ietekmē tā **iznākumu**. `virziens: par | pret` katram atsevišķi; Frakcijas balsojums virzienu nemaina. `pamatojums` — viens teikums par šo Solījumu.
- Nepārbaudāmi solījumi arī saņem Notikumus.
- Ja neviens Solījums neatbilst — Notikumu neveido; pasaki redaktoram, ko meklēji.

## 5. Balsojums (Saeimas balsojumam)

- `npm run balsojums -- <YYYY-MM-DD> "<numurs>), <N>.lasījums"` (vai VOTING_ID). Vairāki rezultāti → precizē. Iznākumu ielīmē kā `balsojums`; ar roku nemaini.
- Dati parādās ~1 dienu vai vairāk pēc sēdes. Ja vēl nav — Notikums bez `balsojums` un `jautajums: "Balsojuma dati vēl nav publicēti (npm run balsojums -- …)"`; tas bloķē merge, līdz pievienots.

## 6. Statusa maiņas

Katram Pārbaudāmam Solījumam: pašreizējais Statuss (pēdējā `statusa_mainas`, citādi Nav vērtēts) → vai šis Notikums (kopā ar iepriekšējiem) atbilst cita Statusa standartam (`vertesana.md`)?

- Jā → pievieno `statusa_mainas` ierakstu: `datums` = noteicošā Notikuma datums, `notikumi` (≥1, var būt arī iepriekšējie), `pamatojums` ar atsauci uz standartu.
- Nē vai neskaidrs → Statusu nemaini; ja neskaidrs — `jautajums` Notikumā.
- Vērtē pēc vērtēšanas avota (`metode.md` §4) un vienādi visiem Sarakstiem.

## 7. Faili un pārbaude

- `data/notikumi/<datums>-<slug>.yaml`; Statusa maiņas — Solījumu failos.
- `npm run parbaude` — labo, līdz paliek tikai `jautajums` kļūdas.

## 8. PR

- Zars `notikums/<id>`, viens commit, `gh pr create`:
  - nosaukums: `Notikums: <nosaukums>`;
  - apraksts: fakts (2–3 teikumi), avoti; tabula Solījums | virziens | Statuss pirms → pēc; atvērtie `jautajums`; ko meklēji, bet neiekļāvi (Solījumi, kas šķita saistīti, un kāpēc ne).
- Nemerge. Redaktors pārbauda un apstiprina.
