---
name: ai-parskats
description: Nedēļas AI pārskats (grafika režīms) — atrod Notikumu kandidātus oficiālajos avotos pēdējās 14 dienās, katram atbilstošajam veido Notikumu pēc /notikums (viens PR uz Notikumu) un ieraksta kopsavilkumu issue „AI pārskatu žurnāls”. Lieto nedēļas Claude Code routine vai, kad redaktors lūdz "/ai-parskats".
argument-hint: "[--no YYYY-MM-DD] [--lidz YYYY-MM-DD]"
---

# /ai-parskats

Grafika režīms (lēmums: "Statusa maiņas plūsma", #10; plūsma `docs/statusi/notikumi.md`). Bez stāvokļa: katru reizi pārskata logu no jauna; dublikātus atmet rīks. Tu sagatavo melnrakstus — **redaktors apstiprina ar merge**. Redaktora sesijā nav: neskaidro jautā `jautajums` laukā vai kopsavilkumā, nevis sarunā. **Neko neizdomā.**

Vispirms izlasi: `GLOSSARY.md`, `docs/statusi/vertesana.md`, `docs/statusi/notikumi.md`, `.claude/skills/notikums/SKILL.md`.

## 1. Kandidāti

- `git switch main && git pull && npm ci`.
- `npm run --silent kandidati -- $ARGUMENTS > /tmp/kandidati.json` (stderr — kopsavilkums). Logs pēc noklusējuma 14 dienas, ne agrāk par 03.10.2026.
- `avoti[].ok: false` → avots nav pārskatīts; ieraksti kopsavilkumā, turpini ar pārējiem. Citus avotus (LIVS, likumi.lv, ziņu portālus) **nerāpo**.
- Kandidāti ar `jau_ir` jau ir Notikumā (`main` vai `notikums/*` zarā) — tikai saskaiti.

## 2. Atlase

Katram pārējam kandidātam: vai fakts **tieši** ietekmē kāda Solījuma iznākumu (`vertesana.md`)?

- Viens fakts no vairākiem avotiem — viens kandidāts: Saeimas `izsludinats` = Vēstneša "Likums" ar to pašu nosaukumu un datumu (avotos abi); TAP projekts = Vēstneša akts, ja pieņemts.
- Notikums ir tikai faktu veidi no `vertesana.md`: Saeimā iesniegšana, galīgais lasījums, noraidīšana; izsludināšana; MK noteikumi, rīkojumi, protokollēmumi; MK projekts TAP. Atmet: iecelšanas amatos, apbalvojumus, īpašumu nodošanu, tehniskus grozījumus, kas neskar nevienu Solījumu.
- Solījumus meklē visos Sarakstos vienādi: `grep -ril` `data/solijumi/` pēc atslēgvārdiem un sinonīmiem (nosaukuma likums/joma, `temas`, `iestades`). Izlasi kandidātu Solījumus.
- Ja neviens Solījums neatbilst — atmet ar vienu iemeslu (kopsavilkumam).

## 3. Notikumi

- Katram atlasītajam faktam — **secīgi**, pa vienam — palaid apakšaģentu (Agent rīks), kas izpilda `.claude/skills/notikums/SKILL.md` ar šo faktu (oficiālā avota URL, kandidāta JSON un atrastie Solījumi) un atgriež: PR saite vai iemesls, kāpēc Notikums nav izveidots. Paralēli nē — darba koks ir viens.
- Ne vairāk kā **10 PR** vienā reizē; pārējos ieraksti kopsavilkumā kā "neapstrādāti" — nākamā reize tos atradīs (logs pārklājas).
- Zars `notikums/<id>` (ne `claude/…`): dublikātu pārbaude meklē tieši tos.

## 4. Kopsavilkums

Komentārs issue „AI pārskatu žurnāls” (`gh api 'repos/artursvonda/ko-sola.lv/issues?state=open&per_page=100' --jq '.[] | select(.title == "AI pārskatu žurnāls") | .number'`):

```
gh api repos/artursvonda/ko-sola.lv/issues/<nr>/comments -F body=@/tmp/kopsavilkums.md
```

Saturs (latviski, īsi):

- `## <no>…<lidz>` un avoti: katram ok / kļūda / piezīme (piem., trūkst TAP mēneša faila).
- Skaitļi: kandidāti / jau Notikumā / atmesti / Notikumi (PR) / neapstrādāti.
- **PR**: saraksts — nosaukums + saite, Solījumu skaits, Statusa maiņas, atvērtie `jautajums`.
- **Neizveidoti** (atlasīti, bet Notikums netika izveidots): fakts + iemesls (piem., nav oficiāla avota, balsojuma dati vēl nav).
- **Neapstrādāti** (limits): saraksts.
- `<details>` **Atmesti**: viena rinda katram — datums, nosaukums, iemesls.

Ja nav ne PR, ne neizveidotu — komentārs tik un tā (žurnāls rāda, ka pārskats notika).

## GitHub routine vidē

`gh pr …` un `gh issue …` lieto GraphQL, ko routine starpniekserveris bloķē (403). Lieto REST: PR — `gh api repos/artursvonda/ko-sola.lv/pulls -f title=… -f head=notikums/<id> -f base=main -F body=@<fails>`; atvērtie PR — `gh api 'repos/artursvonda/ko-sola.lv/pulls?state=open&per_page=100'`.
