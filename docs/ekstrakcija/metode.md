# Solījumu ekstrakcijas metode

Ekstraktora (AI) prompts. Vārdnīca: `GLOSSARY.md`. Redaktora pārbaude: `parbaude.md`. Palaišana: `izpilde.md`.

## 0. Process

- **Viena izpilde = viena CVK programmas nodaļa viena Saraksta.** CVK programma ir enkurs (tā ir visiem Sarakstiem); nodaļas apstrādā **pēc kārtas**, ne paralēli.
- Izpilde nodaļai N aptver:
  1. katru CVK nodaļas N teikumu;
  2. katru paplašinātās programmas **tēmā atbilstošās nodaļas** punktu (arī tos, ko CVK nemin, piem., nodokļi "Finanšu" nodaļā);
  3. punktus no **citām** paplašinātās programmas nodaļām — tikai tad, ja tie ir tas pats Solījums kā 1. vai 2. punktā (tad pievieno citātu un, ja vajag, Nesakritību). Punkts ar jaunu saturu paliek savai nodaļai.
- Ja punkts der vairākām CVK nodaļām, tas pieder nodaļai, kurā tas atrodas paplašinātajā programmā.
- Paplašinātās programmas nodaļas bez atbilstošas CVK nodaļas apstrādā **pēdējā izpildē** ("Ārpus CVK nodaļām").
- **Jau esošie Solījumi** (iepriekšējās izpildes): ja atrastais punkts ir esošs Solījums, papildini tā failu (citāts, Nesakritība), nevis veido jaunu.
- Paplašinātās programmas iekļauto CVK teksta kopiju (piem., JV "10 000 zīmju programmas apsolījums") **ignorē**: tas nav atsevišķs avots.
- Viena izpilde = viens PR, ko redaktors pārbauda.

Ievade izpildei: Saraksta slug, CVK nodaļas nosaukums, CVK programmas fails, paplašinātās programmas fails(-i), esošie `data/solijumi/<saraksts>/*.yaml`. Nodaļas un paplašinātās nodaļu atbilsme (`atbilst_cvk`) — `data/saraksti.yaml`.

## 1. Kas ir Solījums (granularitāte)

Solījums = viena apņemšanās, kurai četru gadu beigās var piešķirt **vienu** Statusu.

- **Dali**, ja vienā teikumā/punktā ir darbības, kurām var būt **atšķirīgi statusi** (piem., "dibinot valsts attīstības fondu …, virzīsim akciju kotāciju biržā (līdz 25%), nodrošināsim sasaisti ar Eiropas depozitārijiem" → 3 Solījumi). Palīgteikums ar "-ot" ir atsevišķs Solījums, ja tas nosauc konkrētu darbību ar savu iznākumu ("paplašinot NATO daudznacionālo brigādi"); ja tas tikai apraksta veidu vai mērķi ("mazinot nodokļu slogu"), nedali.
- Ja galvenajā teikumā bez "-ot" daļas paliek tikai vispārīgs darbības vārds ("Stiprināsim pašvaldības policiju, integrējot …"), Solījums ir tikai "-ot" daļa (citē visu teikumu).
- **Nedali** uzskaitījumu zem viena darbības vārda bez atsevišķiem mērķiem (piem., "stiprināsim pretgaisa, dronu un pretdronu spējas" → 1 Solījums).
- **Neizraksti**: ievadu, vīziju ("Mēs gribam …"), "Pamatojums", kā arī "Prioritātes", ja tās tikai atkārto "Apņemšanās un uzdevumi". Prioritāti izraksti tikai tad, ja tā nav pārklāta citur.
- Ja tas pats saturs avotā atkārtojas, tas ir viens Solījums ar vairākiem citātiem.

## 2. Pārbaudāms vai Nepārbaudāms

Izraksti **abus**: Nepārbaudāmi tiek uzskaitīti un saņems Notikumus, tikai ne Statusu.

- **Pārbaudāms** (`parbaudams: true`): ir konkrēts iznākums, kas notiek vai nenotiek — skaitlis/procents, likums vai normatīvs, iestādes izveide/likvidācija, konkrēts pasākums ar nosauktu objektu. Arī "izvērtēsim X", "virzīsim X", "iestāsimies par X", ja X ir konkrēts (izvērtējums notika vai nē; X tika panākts vai nē).
- **Nepārbaudāms** (`parbaudams: false`): virziena deklarācija bez konkrēta objekta vai mēra ("stiprināsim", "attīstīsim", "veicināsim" + vispārīgs objekts).
- Ja apvienotajā Solījumā pārbaudāmība atšķiras starp avotiem, noteicošs ir **vērtēšanas avots** (§4).
- Robežgadījumā ieraksti iemeslu `piezimes`.

## 3. Citāts

- Burtisks, nepārtraukts fragments; īsākais, kas nes visu apņemšanos (darbības vārds + objekts + mērs).
- Atļautas tikai tehniskas korekcijas: rindu pārnesumi → atstarpe, vairākas atstarpes → viena.
- Citāts **no katra avota**, kur Solījums parādās; pirmais — CVK, ja tur ir.
- Ja viens CVK teikums aptver vairākus Solījumus un daļām nav sava darbības vārda, citē visu attiecīgo teikumu (tas var atkārtoties vairākos Solījumos).

## 4. Apvienošana un Nesakritība

- **Viens Solījums**, ja avoti sola **to pašu iznākumu** — arī tad, ja atšķiras stiprums, mērs vai rādītājs (piem., CVK "ārējā parāda" vs paplašinātās "valsts parāda").
- **Atsevišķs Solījums**, ja detalizācija pievieno **citu iznākumu**, kam statuss var atšķirties no CVK solījuma (piem., CVK "attīstīsim militāro industriju" + paplašinātās "trīskāršosim aizsardzības industrijas eksportu" → 2 Solījumi). Tam ir tikai paplašinātās programmas avots.
- **Nesakritība** (`nesakritiba`): ieraksti tikai **būtiskas** atšķirības starp viena Solījuma citātiem — arī starp citātiem no viena avota (dažādām nodaļām):
  - stiprums: apņemšanās ↔ nodoms ("celsim līdz 50%" ↔ "virzoties uz mērķi sasniegt 50%"; "virzīsim" ↔ "izvērtēsim iespēju");
  - mērs, skaitlis, termiņš ("līdz 50%" ↔ "1250 eiro");
  - rādītājs vai apjoms ("ārējais parāds" ↔ "valsts parāds"; "aizsardzība" ↔ "iekšējā un ārējā drošība");
  - nosacījums, kas maina iznākumu.
  
  **Neieraksti**: sinonīmus, vārdu secību, pamatojumu vai papildu skaidrojumu, kas nemaina iznākumu. Raksti abu citātu vārdiem, vienā teikumā.
- **Vērtēšanas avots**: CVK programma. Ja CVK citātā nav mēra, bet citā ir, vērtē pēc šī mēra un to norādi `nesakritiba`. Ja CVK citāta nav, vērtēšanas avots ir paplašinātās programmas punkts izpildes nodaļā (tā "Apņemšanās un uzdevumi").
- `nosaukums` izmanto vērtēšanas avota mēru.
- Ja paplašinātā programma CVK teikumu sadala vairākos punktos → seko paplašinātās programmas dalījumam, CVK citātu pievieno katram attiecīgajam Solījumam.

## 5. Nosaukums

Īss, neitrāls lietvārdisks formulējums lasītājam, ≤ 80 zīmes, ar mēru, ja tāds ir. Bez vērtējuma un partijas retorikas. Piem.: "Aizsardzības finansējums 5% no IKP".

## 6. Tēmas

`galvena`: tieši viena; `papildu`: 0–2. Tikai no šī saraksta (slug; nosaukumi un saturs — `data/temas.yaml`):

nodokli-un-budzets, ekonomika-un-darbs, veseliba, izglitiba-un-zinatne, gimenes-un-demografija, socialais-atbalsts-un-pensijas, majokli, aizsardziba, arpolitika, iekseja-drosiba-un-tiesiskums, migracija-un-diaspora, valoda-kultura-un-mediji, energetika, vide-un-klimats, transports, regioni-un-pasvaldibas, lauksaimnieciba-un-zivsaimnieciba, valsts-parvalde, demokratija-un-cilvektiesibas

Tēmu izvēlas pēc tā, **ko solījums maina lasītājam**, nevis pēc programmas nodaļas (uzturēšanās atļaujas nodaļā "Drošība" → `migracija-un-diaspora`). Civilā aizsardzība, robeža, iekšlietu dienesti → `iekseja-drosiba-un-tiesiskums`.

## 6a. Atbildīgā iestāde

`iestades.galvena`: tieši viena; `iestades.papildu`: 0–2 (tikai starpnozaru Solījumiem). Tikai no šī saraksta (slug; nosaukumi un Amatpersonas — `data/iestades.yaml`):

vk (Valsts kanceleja), saeima, am (Aizsardzības), arm (Ārlietu), em (Ekonomikas), fm (Finanšu), iem (Iekšlietu), izm (Izglītības un zinātnes), kem (Klimata un enerģētikas), km (Kultūras), lm (Labklājības), sm (Satiksmes), tm (Tieslietu), vm (Veselības), varam (Viedās administrācijas un reģionālās attīstības), zm (Zemkopības)

- Izvēlas iestādi, kuras **kompetencē ir iznākums**, nevis to, kurš Saraksts solīja vai kura Saraksta ministrs to vada. Opozīcijas Solījumam — tāpat.
- Valdības kopējā vai Ministru prezidenta kompetence (piem., valsts pārvaldes reforma) → Valsts kanceleja. Iznākums tikai Saeimas rokās (piem., Kārtības rullis, deputātu skaits) → Saeima.
- ES līmeņa solījums ("iestāsimies ES par X") → nozares ministrija, kas gatavo Latvijas pozīciju par X, ne Ārlietu ministrija (ja vien X nav ārpolitika).
- Iznākums pašvaldību vai neatkarīgas iestādes kompetencē → ministrija vai Saeima, kas var mainīt attiecīgo regulējumu.
- Neskaidrā gadījumā ieraksti iemeslu `piezimes`. Ja redaktors nevar izlemt — `iestades.galvena: neskaidrs`, `papildu: []` (lasītājam "Neskaidrs").

## 7. ID

`<saraksts>-<slug>`, slug no nosaukuma: mazie latīņu burti bez diakritikas, ≤ 6 vārdi. Pēc publicēšanas nemainās. Faila vārds `<id>.yaml`.

## 8. Izvades formāts

`data/solijumi/<saraksts>/<id>.yaml`:

```yaml
id: jv-minimala-alga-50-videjas
saraksts: jv
nosaukums: Minimālā alga 50% no vidējās bruto darba samaksas
parbaudams: true
temas:
  galvena: ekonomika-un-darbs
  papildu: [nodokli-un-budzets]
iestades:
  galvena: <iestāde>  # slug no data/iestades.yaml
  papildu: []
avoti:
  - veids: cvk
    vieta: "3. Finanses"
    citats: "Celsim minimālo algu līdz 50% no vidējās bruto darba samaksas"
  - veids: paplasinata
    vieta: "3. Finanses › Apņemšanās un uzdevumi"
    citats: "Paaugstināsim minimālās darba algas līmeni, virzoties uz mērķi sasniegt 50% no vidējās bruto darba samaksas valstī"
nesakritiba: "CVK sola celt līdz 50%; paplašinātā programma — tikai virzīties uz šo mērķi."
piezimes: ""      # ekstraktora lēmumu iemesli (granularitāte, pārbaudāmība)
jautajums: ""     # neskaidrība redaktoram; pirms merge jābūt tukšam
```

Avota URL ir `data/saraksti.yaml`, ne katrā failā. `vieta` sākas ar nodaļas virsrakstu tieši kā avotā (CVK — kā `data/saraksti.yaml` `nodalas`), sadaļas atdala ar " › ". Shēma: `schemas/solijums.schema.json`; `npm run parbaude` pārbauda arī citātu burtiskumu un `vieta` nodaļu. Statusi un Notikumi šeit netiek aizpildīti. Amatpersonas Solījuma failā nav: tās atvasina no `data/iestades.yaml` pēc datuma.

## 9. Kopsavilkums

Katrai izpildei arī `_kopsavilkums.md` (PR aprakstam, ne repo): Solījumu skaits, Nepārbaudāmo skaits, cik ar abiem avotiem, cik ar `nesakritiba`; visi `jautajums`; un katrs §0 1.–2. punkta teikums/punkts, kas netika izrakstīts, — viena rinda ar iemeslu (arī "atstāts nodaļai X").
