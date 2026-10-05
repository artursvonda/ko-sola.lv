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

// Minimāls repo pagaidu mapē; `izmainas` pārraksta vai izdzēš (null) failus.
function repo(izmainas = {}) {
  const sakne = mkdtempSync(join(tmpdir(), "ko-sola-"));
  const faili = {
    "data/temas.yaml": stringify([
      { slug: "ekonomika-un-darbs", nosaukums: "Ekonomika un darbs", ietver: "" },
      { slug: "nodokli-un-budzets", nosaukums: "Nodokļi un budžets", ietver: "" },
    ]),
    "data/iestades.yaml": stringify([{ slug: "lm" }, { slug: "fm" }]),
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

test("bez data/iestades.yaml Solījumu nevar pārbaudīt", () => {
  assert.deepEqual(zinojumi(repo({ "data/iestades.yaml": null })), [
    `${F}: data/iestades.yaml nav — Atbildīgo iestādi nevar pārbaudīt`,
  ]);
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
