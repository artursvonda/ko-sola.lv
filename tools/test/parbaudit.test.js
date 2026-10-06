import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { stringify } from "yaml";
import { parbaudit } from "../lib/parbaudit.js";

const CVK = `---
url: https://www.vestnesis.lv/op/2026/176A.9
---

1. Drošība

Nodrošināsim aizsardzības finansējumu 5% no IKP un attīstīsim
NATO klātbūtni.

3. Finanses

Celsim minimālo algu līdz 50% no vidējās bruto darba samaksas.
`;

const PAP = `# 3. Finanses

## 10 000 zīmju programmas apsolījums

Celsim minimālo algu līdz 50% no vidējās bruto darba samaksas.

## Apņemšanās un uzdevumi

- Paaugstināsim minimālās darba algas līmeni, virzoties uz mērķi sasniegt 50%
`;

const SARAKSTI = [
  {
    slug: "jv",
    nosaukums: "Jaunā VIENOTĪBA",
    isais_nosaukums: "Jaunā VIENOTĪBA",
    saisinajums: "JV",
    nr: 9,
    avoti: [
      {
        veids: "cvk",
        url: "https://www.vestnesis.lv/op/2026/176A.9",
        fails: "sources/cvk/09-jv.md",
        nodalas: ["1. Drošība", "3. Finanses"],
      },
      {
        veids: "paplasinata",
        url: "https://jaunavienotiba.lv/programma.pdf",
        fails: "sources/paplasinata/jv.md",
        izlaist: ["10 000 zīmju programmas apsolījums"],
        atbilst_cvk: { "3. Finanses": "3. Finanses" },
      },
    ],
  },
];

const SOLIJUMS = {
  id: "jv-minimala-alga-50-videjas",
  saraksts: "jv",
  nosaukums: "Minimālā alga 50% no vidējās bruto darba samaksas",
  parbaudams: true,
  temas: { galvena: "ekonomika-un-darbs", papildu: ["nodokli-un-budzets"] },
  iestades: { galvena: "lm", papildu: [] },
  avoti: [
    { veids: "cvk", vieta: "3. Finanses", citats: "Celsim minimālo algu līdz 50% no vidējās bruto darba samaksas" },
    {
      veids: "paplasinata",
      vieta: "3. Finanses › Apņemšanās un uzdevumi",
      citats: "Paaugstināsim minimālās darba algas līmeni, virzoties uz mērķi sasniegt 50%",
    },
  ],
  nesakritiba: "CVK sola celt līdz 50%; paplašinātā — tikai virzīties uz šo mērķi.",
  piezimes: "",
  jautajums: "",
};

const IESTADES = [
  {
    slug: "lm",
    nosaukums: "Labklājības ministrija",
    isais_nosaukums: "LM",
    avots: "https://www.mk.gov.lv/lv/ministrijas",
    amatpersonas: [
      { vards: "A A", amats: "labklājības ministrs", partija: "ZZS", no: "2023-09-15", lidz: "2026-10-10", avots: "https://x.lv" },
      { vards: "B B", amats: "labklājības ministrs", saraksts: "jv", no: "2026-10-10", avots: "https://x.lv" },
    ],
  },
  {
    slug: "fm",
    nosaukums: "Finanšu ministrija",
    isais_nosaukums: "FM",
    avots: "https://www.mk.gov.lv/lv/ministrijas",
    amatpersonas: [{ vards: "C C", amats: "finanšu ministrs", partija: "bezpartejisks", no: "2023-09-15", avots: "https://x.lv" }],
  },
];

// Minimāls repo pagaidu mapē; `izmainas` pārraksta vai izdzēš (null) failus.
function repo(izmainas = {}) {
  const sakne = mkdtempSync(join(tmpdir(), "ko-sola-"));
  const faili = {
    "data/temas.yaml": stringify([
      { slug: "ekonomika-un-darbs", nosaukums: "Ekonomika un darbs", ietver: "" },
      { slug: "nodokli-un-budzets", nosaukums: "Nodokļi un budžets", ietver: "" },
    ]),
    "data/iestades.yaml": stringify(IESTADES),
    "data/saraksti.yaml": stringify(SARAKSTI),
    "sources/cvk/09-jv.md": CVK,
    "sources/paplasinata/jv.md": PAP,
    [`data/solijumi/jv/${SOLIJUMS.id}.yaml`]: stringify(SOLIJUMS),
    ...izmainas,
  };
  for (const [cels, saturs] of Object.entries(faili)) {
    if (saturs === null) continue;
    mkdirSync(join(sakne, dirname(cels)), { recursive: true });
    writeFileSync(join(sakne, cels), saturs);
  }
  test.after(() => rmSync(sakne, { recursive: true, force: true }));
  return sakne;
}

const solijums = (izmainas, cels = `data/solijumi/jv/${SOLIJUMS.id}.yaml`) => ({
  [cels]: stringify({ ...SOLIJUMS, ...izmainas }),
});

const zinojumi = (sakne) => parbaudit(sakne).map((k) => `${k.fails}: ${k.zinojums}`);

test("derīgs Solījums — nav kļūdu", () => {
  assert.deepEqual(zinojumi(repo()), []);
});

const F = `data/solijumi/jv/${SOLIJUMS.id}.yaml`;

test("citāts, kas nav avotā burtiski, ir kļūda", () => {
  const avoti = [{ ...SOLIJUMS.avoti[0], citats: "Celsim minimālo algu līdz 50% no vidējās algas" }];
  assert.deepEqual(zinojumi(repo(solijums({ avoti }))), [
    `${F}: avoti[0] (cvk): citāts nav atrasts avotā burtiski: „Celsim minimālo algu līdz 50% no vidējās algas”`,
  ]);
});

test("citāts no CVK kopijas paplašinātajā (`izlaist`) neskaitās", () => {
  const avoti = [
    SOLIJUMS.avoti[0],
    { veids: "paplasinata", vieta: "3. Finanses", citats: SOLIJUMS.avoti[0].citats },
  ];
  assert.match(zinojumi(repo(solijums({ avoti })))[0], /avoti\[1\] \(paplasinata\): citāts nav atrasts/);
});

test("vieta jāsakrīt ar nodaļu, kurā ir citāts", () => {
  const avoti = [{ ...SOLIJUMS.avoti[0], vieta: "1. Drošība" }];
  assert.deepEqual(zinojumi(repo(solijums({ avoti }))), [
    `${F}: avoti[0] (cvk): vieta "1. Drošība" nesakrīt: citāts ir nodaļā "3. Finanses"`,
  ]);
});

test("tēmām un iestādēm jābūt no slēgtā saraksta, galvenā neatkārtojas papildu", () => {
  const temas = { galvena: "ekonomika", papildu: [] };
  const iestades = { galvena: "lm", papildu: ["lm"] };
  assert.deepEqual(zinojumi(repo(solijums({ temas, iestades }))), [
    `${F}: tēma "ekonomika" nav data/temas.yaml`,
    `${F}: galvenā iestāde "lm" atkārtota papildu`,
  ]);
});

test("galvenā iestāde „neskaidrs” — atļauta, bet bez papildu iestādēm", () => {
  assert.deepEqual(zinojumi(repo(solijums({ iestades: { galvena: "neskaidrs", papildu: [] } }))), []);
  assert.deepEqual(zinojumi(repo(solijums({ iestades: { galvena: "neskaidrs", papildu: ["lm"] } }))), [
    `${F}: iestāde "neskaidrs" — papildu iestādēm jābūt tukšām`,
  ]);
});

test("bez data/iestades.yaml Solījumu nevar pārbaudīt", () => {
  assert.deepEqual(zinojumi(repo({ "data/iestades.yaml": null })), [
    `${F}: data/iestades.yaml nav — Atbildīgo iestādi nevar pārbaudīt`,
  ]);
});

test("iestādes: Amatpersonas laika secībā, bez pārklāšanās, no vēlēšanu dienas; saraksts un pecteces_no zināmi", () => {
  const iestades = structuredClone(IESTADES);
  const [a, b] = iestades[0].amatpersonas;
  a.lidz = "2026-10-01";
  b.no = "2026-09-30";
  b.saraksts = "xx";
  iestades[1].pecteces_no = ["fm", "vm"];
  iestades[1].amatpersonas.push({ ...b, saraksts: "jv", partija: "Jaunā VIENOTĪBA", jautajums: "Vai p.i.?" });
  assert.deepEqual(zinojumi(repo({ "data/iestades.yaml": stringify(iestades) })), [
    `data/iestades.yaml: lm: amatpersonas[0] A A: amatā tikai līdz 2026-10-01, pirms vēlēšanu dienas 2026-10-03`,
    `data/iestades.yaml: lm: amatpersonas[1] B B: saraksts "xx" nav data/saraksti.yaml`,
    `data/iestades.yaml: lm: amatpersonas[1] B B: no 2026-09-30 pārklājas ar iepriekšējo (lidz 2026-10-01)`,
    `data/iestades.yaml: fm: pecteces_no "fm" nav cita iestāde`,
    `data/iestades.yaml: fm: pecteces_no "vm" nav cita iestāde`,
    `data/iestades.yaml: fm: amatpersonas[1] B B: jābūt tieši vienam no saraksts / partija`,
    `data/iestades.yaml: fm: amatpersonas[1] B B: iepriekšējai Amatpersonai nav lidz`,
    `data/iestades.yaml: fm: amatpersonas[1] B B: neatbildēts jautājums redaktoram: Vai p.i.?`,
  ]);
});

test("iestādes: shēma — Amatpersonai vajag avotu", () => {
  const iestades = structuredClone(IESTADES);
  delete iestades[1].amatpersonas[0].avots;
  assert.deepEqual(zinojumi(repo({ "data/iestades.yaml": stringify(iestades) }))[0],
    `data/iestades.yaml: shēma: /1/amatpersonas/0 must have required property 'avots'`);
});

test("neatbildēts `jautajums` bloķē merge", () => {
  assert.deepEqual(zinojumi(repo(solijums({ jautajums: "Vai dalīt?" }))), [
    `${F}: neatbildēts jautājums redaktoram: Vai dalīt?`,
  ]);
});

test("shēma: trūkst lauka, lieks lauks, nosaukums > 80 zīmēm", () => {
  const { parbaudams, ...bez } = SOLIJUMS;
  const kludas = zinojumi(repo({ [F]: stringify({ ...bez, nosaukums: "x".repeat(81), statuss: "Izpildīts" }) }));
  assert.deepEqual(kludas, [
    `${F}: shēma: / must have required property 'parbaudams'`,
    `${F}: shēma: / must NOT have additional properties`,
    `${F}: shēma: /nosaukums must NOT have more than 80 characters`,
  ]);
});

test("id = faila vārds, sākas ar Saraksta slug; mape = saraksts", () => {
  const cels = "data/solijumi/pro/jv-cits.yaml";
  assert.deepEqual(zinojumi(repo(solijums({ id: "pro-cits" }, cels))), [
    `${cels}: id "pro-cits" nesakrīt ar faila vārdu "jv-cits.yaml"`,
    `${cels}: saraksts "jv" nesakrīt ar mapi "pro"`,
    `${cels}: id jāsākas ar "jv-"`,
  ]);
});

test("Saraksta konfigurācija: nodaļai jābūt avotā, url = frontmatter", () => {
  const saraksti = structuredClone(SARAKSTI);
  saraksti[0].avoti[0].nodalas.push("2. Ārpolitika");
  saraksti[0].avoti[0].url = "https://cits.lv";
  saraksti[0].avoti[1].atbilst_cvk["4. Ekonomika"] = "4. Ekonomika";
  assert.deepEqual(zinojumi(repo({ "data/saraksti.yaml": stringify(saraksti) })), [
    `data/saraksti.yaml: jv cvk: url nesakrīt ar sources/cvk/09-jv.md frontmatter (https://www.vestnesis.lv/op/2026/176A.9)`,
    `data/saraksti.yaml: jv cvk: nodaļa "2. Ārpolitika" nav atrasta sources/cvk/09-jv.md`,
    `data/saraksti.yaml: jv paplasinata: nodaļa "4. Ekonomika" nav atrasta sources/paplasinata/jv.md`,
    `data/saraksti.yaml: jv paplasinata: "4. Ekonomika" → "4. Ekonomika" nav CVK nodaļa`,
  ]);
});

test("avots bez teksta faila — no tā citēt nevar", () => {
  const saraksti = structuredClone(SARAKSTI);
  delete saraksti[0].avoti[1].fails;
  assert.deepEqual(zinojumi(repo({ "data/saraksti.yaml": stringify(saraksti) })), [
    `${F}: avoti[1] (paplasinata): Sarakstam nav paplasinata avota teksta sources/`,
  ]);
});

// Notikumi un Statusa maiņas

const NOTIKUMS = {
  id: "2027-03-12-minimala-alga-likums-pienemts",
  datums: "2027-03-12",
  nosaukums: "Saeima galīgajā lasījumā pieņem minimālās algas likumu",
  apraksts: "Minimālā alga no 2028. gada — 50% no vidējās bruto darba samaksas.",
  avoti: [
    { url: "https://www.saeima.lv/lv/likumprojekti/123", veids: "saeima" },
    { url: "https://www.lsm.lv/raksts/1", veids: "zinas" },
  ],
  solijumi: [{ id: SOLIJUMS.id, virziens: "par", pamatojums: "Likums nosaka solīto 50%." }],
  balsojums: {
    saeima: 15,
    id: "4aebc7bc-8f18-4a64-9d01-910d22f4fe36",
    laiks: "2027-03-12T10:15:00",
    motivs: "Minimālās algas likums (12/Lp15), 3.lasījums",
    datu_avots: "https://data.gov.lv/dati/dataset/x/resource/y/download/15-vote.xml",
    kopa: { par: 52, pret: 30, atturas: 3 },
    frakcijas: {
      JV: { par: 25, pret: 0, atturas: 0, nebalsoja: 0 },
      bez_frakcijas: { par: 1, pret: 0, atturas: 0, nebalsoja: 1 },
    },
  },
};
const NF = `data/notikumi/${NOTIKUMS.id}.yaml`;
const SARAKSTI_AR_FRAKCIJU = stringify([{ ...SARAKSTI[0], frakcija: "JV" }]);
const MAINA = {
  datums: "2027-03-12",
  statuss: "izpildits",
  notikumi: [NOTIKUMS.id],
  pamatojums: "Likums pieņemts un izsludināts.",
};

const notikums = (izmainas, cels = NF) => ({ [cels]: stringify({ ...NOTIKUMS, ...izmainas }) });
const arNotikumu = (izmainas = {}) =>
  repo({ "data/saraksti.yaml": SARAKSTI_AR_FRAKCIJU, ...notikums({}), ...izmainas });

test("derīgs Notikums ar Statusa maiņu — nav kļūdu", () => {
  assert.deepEqual(zinojumi(arNotikumu(solijums({ statusa_mainas: [MAINA] }))), []);
});

test("Notikums: id = faila vārds, sākas ar datumu; vismaz viens oficiāls avots", () => {
  const cels = "data/notikumi/2027-03-12-cits.yaml";
  const avoti = [{ url: "https://www.lsm.lv/raksts/1", veids: "zinas" }];
  assert.deepEqual(zinojumi(arNotikumu({ [NF]: null, ...notikums({ datums: "2027-03-11", avoti }, cels) })), [
    `${cels}: id "${NOTIKUMS.id}" nesakrīt ar faila vārdu "2027-03-12-cits.yaml"`,
    `${cels}: id jāsākas ar datumu "2027-03-11-"`,
    `${cels}: vajag vismaz vienu oficiālu avotu (ne zinas)`,
    `${cels}: balsojuma datums 2027-03-12 nesakrīt ar datums 2027-03-11`,
  ]);
});

test("Notikums: Solījumam jāeksistē un neatkārtojas", () => {
  const p = NOTIKUMS.solijumi[0];
  const solijumi = [p, p, { id: "jv-nav", virziens: "pret", pamatojums: "x" }];
  assert.deepEqual(zinojumi(arNotikumu(notikums({ solijumi }))), [
    `${NF}: Solījums "${SOLIJUMS.id}" atkārtojas`,
    `${NF}: Solījums "jv-nav" nav data/solijumi/`,
  ]);
});

test("balsojums: 15. Saeimas frakcijai jābūt data/saraksti.yaml; viens balsojums — viens Notikums", () => {
  const cits = "data/notikumi/2027-03-12-otrs.yaml";
  const balsojums = { ...NOTIKUMS.balsojums, frakcijas: { SV: { par: 1, pret: 0, atturas: 0 } } };
  assert.deepEqual(zinojumi(arNotikumu({ ...notikums({ id: "2027-03-12-otrs", balsojums }, cits) })), [
    `${cits}: balsojums ${balsojums.id} jau ir Notikumā "${NOTIKUMS.id}"`,
    `${cits}: frakcija "SV" nav data/saraksti.yaml`,
  ]);
});

test("balsojums: 14. Saeimas frakcijas netiek kartētas uz Sarakstiem", () => {
  const balsojums = { ...NOTIKUMS.balsojums, saeima: 14, frakcijas: { ZZS: { par: 9, pret: 0, atturas: 0 } } };
  assert.deepEqual(zinojumi(arNotikumu(notikums({ balsojums }))), []);
});

test("Statusa maiņa: Notikumam jāeksistē un jāattiecas uz Solījumu, datums = Notikuma datums", () => {
  const { balsojums, ...bezBalsojuma } = NOTIKUMS;
  const cits = { ...bezBalsojuma, id: "2027-04-01-cits", datums: "2027-04-01" };
  cits.solijumi = [{ id: "jv-cits", virziens: "par", pamatojums: "x" }];
  const mainas = [
    { ...MAINA, notikumi: ["2027-01-01-nav"] },
    { ...MAINA, datums: "2027-04-01", statuss: "daleji-izpildits", notikumi: [cits.id] },
    { ...MAINA, datums: "2027-03-01", statuss: "izpildits" },
  ];
  const sakne = arNotikumu({
    ...solijums({ id: "jv-cits" }, "data/solijumi/jv/jv-cits.yaml"),
    [`data/notikumi/${cits.id}.yaml`]: stringify(cits),
    ...solijums({ statusa_mainas: mainas }),
  });
  assert.deepEqual(zinojumi(sakne), [
    `${F}: statusa_mainas[0]: Notikums "2027-01-01-nav" nav data/notikumi/`,
    `${F}: statusa_mainas[1]: Notikums "${cits.id}" neattiecas uz šo Solījumu`,
    `${F}: statusa_mainas[2]: datums 2027-03-01 nav neviena tā Notikuma datums`,
    `${F}: statusa_mainas[2]: datums 2027-03-01 agrāks par iepriekšējo (2027-04-01)`,
  ]);
});

test("Statusa maiņa: Statuss mainās; Nepārbaudāmam — nav; atpakaļ uz Nav vērtēts nevar", () => {
  const mainas = [MAINA, { ...MAINA }, { ...MAINA, statuss: "nav-vertets" }];
  assert.deepEqual(zinojumi(arNotikumu(solijums({ parbaudams: false, statusa_mainas: mainas }))), [
    `${F}: shēma: /statusa_mainas/2/statuss must be equal to one of the allowed values`,
  ]);
  assert.deepEqual(zinojumi(arNotikumu(solijums({ parbaudams: false, statusa_mainas: mainas.slice(0, 2) }))), [
    `${F}: Nepārbaudāmam solījumam nav Statusa maiņu`,
    `${F}: statusa_mainas[1]: Statuss "izpildits" nemainās`,
  ]);
});
