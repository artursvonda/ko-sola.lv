# Statusa vērtēšana

Pierādījuma standarts katram Statusam (lēmums: "Statusa maiņas plūsma", #10). Vārdnīca: `GLOSSARY.md`. Faili un plūsma: `notikumi.md`.

## Ko vērtē

- Statuss vērtē **iznākumu** — vai solītais notika —, nevis Saraksta paša rīcību. Koalīcijas un opozīcijas Sarakstiem skala un standarts ir vienādi. Saraksta rīcība (balsojums, iesniegts likumprojekts) redzama Notikumos.
- Vērtē pēc **vērtēšanas avota**: CVK programmas citāta; ja tajā nav mēra, bet citā avotā ir, — pēc tā mēra (`docs/ekstrakcija/metode.md` §4). Nesakritība netiek "izlīdzināta" par labu Sarakstam.
- Nepārbaudāmam solījumam Statusu nevērtē: tas saņem Notikumus, ne Statusa maiņas.
- Katrai Statusa maiņai ir ≥1 Notikums ar oficiālu avotu. Bez Notikuma Statuss nemainās.
- Statuss var mainīties jebkurā virzienā (piem., Izpildīts → Daļēji izpildīts, ja likumu atceļ), bet ne atpakaļ uz Nav vērtēts.

## Statusi

| Statuss | `statuss` | Pietiek ar | Nepietiek ar |
|---|---|---|---|
| Nav vērtēts | (nav `statusa_mainas`) | — sākuma stāvoklis | — |
| Procesā | `procesa` | Datēts **formāls solis** ceļā uz iznākumu: likumprojekts iesniegts Saeimā; MK projekts publicēts TAP; finansējums iekļauts budžeta likumā; izsludināts iepirkums. | Paziņojumi, intervijas, nodomi, darba grupas izveide bez formāla dokumenta. |
| Izpildīts | `izpildits` | Vērtēšanas avota iznākums **pilnā mērā**: normatīvs pieņemts un izsludināts; skaitliskam mērķim — oficiāla statistika (CSP, Valsts kase) vai normatīvs, kas mērķi nosaka. | Pieņemts tikai Saeimā, bet nav izsludināts; iznākums mazāks par solīto (→ Daļēji). |
| Daļēji izpildīts | `daleji-izpildits` | **Daļējs iznākums jau spēkā** (piem., minimālā alga 45%, solīti 50%; izpildīta daļa no uzskaitītā). | Solis ceļā uz iznākumu, kas vēl nav spēkā (→ Procesā). |
| Nav izpildīts | `nav-izpildits` | Pēc sasaukuma vai Solījumā nosauktā termiņa beigām bez iznākuma; **vai agrāk**, ja Notikums "pret" padara iznākumu šajā sasaukumā nereālu: likumprojekts galīgi noraidīts, oficiāla atteikšanās, pieņemts pretējs lēmums. | Noraidīts tikai priekšlikums vai lasījums, ja ceļš uz iznākumu paliek atvērts. |

## Notikums un tā virziens

- **Oficiāls avots** (`avoti[].veids` ≠ `zinas`): Saeima, MK/TAP, likumi.lv, Latvijas Vēstnesis, CSP, Valsts kase u. c. Ziņa drīkst būt tikai norāde uz oficiālo dokumentu.
- `virziens` = ietekme uz **iznākumu**, katram Solījumam atsevišķi: `par` — tuvina solīto, `pret` — attālina. Frakcijas balsojums rādīts blakus un virzienu nemaina (likums izpilda JV Solījumu → `par`, arī ja JV balsoja pret).
- Saeimā ieraksta: likumprojekta **iesniegšanu** (parasti → Procesā) un **galīgo lasījumu** (parasti 3. lasījums; steidzamam likumprojektam — "2.lasījums, steidzams"). Citus lasījumus — tikai, ja būtiski grozījumi vai noraidījums.
- **Izsludināšana** (Latvijas Vēstnesis) ir atsevišķs Notikums, ja tā maina Statusu uz Izpildīts vai Daļēji izpildīts: galīgais lasījums pats par sevi to nedara.
- `datums` = kad fakts notika (balsojuma diena, izsludināšanas diena, statistikas publicēšanas diena). Statusa maiņas `datums` = noteicošā Notikuma datums; apstiprināšanas datums = git merge.

## Robežgadījumi

- **Pieņemts, bet stājas spēkā vēlāk**: izsludināts → Izpildīts; spēkā stāšanās datumu min `pamatojums`.
- **Likums, kas atļauj, bet neliek** (piem., MK "var lemt" par finansējumu): tas ir solis, ne iznākums; iznākums ir MK lēmums — atsevišķs Notikums.
- **Fakts pirms 15. Saeimas sanākšanas** (14. Saeima, iepriekšējā valdība, arī pirms vēlēšanām): vēl nav izlemts — [Notikumi pirms 15. Saeimas sanākšanas](https://github.com/artursvonda/ko-sola.lv/issues/31). Līdz lēmumam: Notikumu var sagatavot, Statusu nemaina, `jautajums` (bloķē merge).
- **Netieša ietekme** (fakts var ietekmēt iznākumu tikai caur citiem, vēl nenotikušiem soļiem): Solījumu neiekļauj; PR aprakstā "Meklēts, bet neiekļauts" ar iemeslu.
- **Vairāki Solījumi vienā Notikumā** (arī dažādu Sarakstu): katram savs `virziens` un `pamatojums`; Statusa maiņas — katrā Solījuma failā, vienā PR.
- **Nav skaidrs, vai standarts izpildīts**: Statusu nemaini; pievieno Notikumu un `jautajums` redaktoram.
