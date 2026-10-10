import { test } from "node:test";
import assert from "node:assert/strict";
import { atzimetDublikatus, saeimasLemumi, saeimasLikumprojekti, tapProjekti, vestnesaLaidiens } from "../lib/kandidati.js";

const LOGS = { no: "2026-10-03", lidz: "2026-10-16" };

// Saīsināts saeima.lv/lawdata.json (struktūra kā 14. Saeimas 2026. g.).
const lp = (id, l) => ({
  id,
  name: "Grozījumi Meža likumā",
  steidzams: 0,
  statuss: "Nodots atbildīgajai komisijai",
  date: "",
  submitted_by: "Ministru kabinets",
  submission_date: "",
  second_reading_date: "",
  third_reading_date: "",
  published: "",
  ...l,
});

test("lawdata: iesniegšana, galīgais lasījums (steidzamam — 2.), izsludināšana, noraidīšana logā", () => {
  const lawdata = {
    laws: {
      a: lp("1579/Lp14", { submission_date: "07.10.2026" }),
      b: lp("1380/Lp14", { steidzams: 1, second_reading_date: "08.10.2026", third_reading_date: "", published: "15.10.2026" }),
      c: lp("1372/Lp14", { second_reading_date: "08.10.2026", third_reading_date: "" }),
      d: lp("1200/Lp14", { statuss: "Likumprojekts noraidīts", date: "08.10.2026" }),
      e: lp("1100/Lp14", { submission_date: "01.10.2026", third_reading_date: "17.10.2026" }),
    },
  };
  const k = saeimasLikumprojekti(lawdata, LOGS).map((k) => [k.atslegas[0], k.veids, k.datums]);
  assert.deepEqual(k, [
    ["1579/Lp14", "iesniegts", "2026-10-07"],
    ["1380/Lp14", "galigais-lasijums", "2026-10-08"],
    ["1380/Lp14", "izsludinats", "2026-10-15"],
    ["1200/Lp14", "noraidits", "2026-10-08"],
  ]);
});

test("Saeimas lēmumi: tikai /Lm, bez procedūras", () => {
  const b = (id, motivs, laiks = "2026-10-08T10:00:00") => ({ id, laiks, motivs, kopa: { par: 50, pret: 1, atturas: 0 } });
  const k = saeimasLemumi(
    [
      b("1", "Par lēmuma projektu X (1124/Lm14) iekļaušanu Saeimas sēdes darba kārtībā"),
      b("2", "Par Saeimas paziņojumu par atbalstu Ukrainai (1130/Lm14)"),
      b("3", "Grozījumi Meža likumā (1579/Lp14), 3.lasījums"),
      b("4", "Par Saeimas paziņojumu (1131/Lm14)", "2026-09-17T10:00:00"),
    ],
    LOGS,
    "https://data.gov.lv/x-vote.xml",
  );
  assert.deepEqual(
    k.map((k) => [k.balsojums, k.datums, k.unikals]),
    [["2", "2026-10-08", true]],
  );
});

const laidiens = (datums) => `
<div class='center'><div class='date'><span class='lDay'>Otrdiena,</span> ${datums}.,&nbsp;</div></div>
<div class='taBlock new'><h1>Tiesību akti<div class='expand'>Izvērst</div></h1><div class='item'>
  <div class='head  '><h2 class=''>Ministru kabinets</h2></div>
  <div class='body '>
    <a href='https://www.vestnesis.lv/op/2026/192.1' class='innerItem' target='_blank'>
    <p class='opNr'>OP 2026/192.1</p>
      <div class='title'>
        Grozījumi Ministru kabineta noteikumos Nr. 537 &quot;Sadzīves atkritumu&quot;
      </div>
      <div class='subTitle'>Ministru kabineta noteikumi Nr. 597</div>
    </a>
  </div>
</div><div class='item'>
  <div class='head  '><h2 class=''>Ludzas novada dome</h2></div>
  <div class='body '>
    <a href='https://www.vestnesis.lv/op/2026/192.9' class='innerItem' target='_blank'>
      <div class='title'>Saistošie noteikumi</div>
    </a>
  </div>
</div></div>
<div class='taBlock'><h1>Oficiālie paziņojumi</h1>
  <a href='https://www.vestnesis.lv/op/2026/192.20' class='innerItem'><div class='title'>Paziņojums</div></a>
</div>`;

test("Vēstnesis: Tiesību akti bez pašvaldībām un paziņojumiem", () => {
  assert.deepEqual(vestnesaLaidiens(laidiens("06.10.2026"), "2026-10-06"), [
    {
      avots: "vestnesis",
      veids: "publicets",
      datums: "2026-10-06",
      nosaukums: 'Grozījumi Ministru kabineta noteikumos Nr. 537 "Sadzīves atkritumu"',
      url: "https://www.vestnesis.lv/op/2026/192.1",
      atslegas: ["op/2026/192.1"],
      unikals: true,
      izdevejs: "Ministru kabinets",
      dokuments: "Ministru kabineta noteikumi Nr. 597",
    },
  ]);
});

test("Vēstnesis: dienā bez laidiena (cits datums lapā) — null", () => {
  assert.equal(vestnesaLaidiens(laidiens("09.10.2026"), "2026-10-04"), null);
});

test("TAP: iesniegti logā, ar tipu un TA numuru", () => {
  const json = {
    data: [
      {
        id: "u1",
        attributes: { identificator: "26-TA-991", name: "Plāns 2026.&ndash;2027. gadam", progress_name: "Iesniegts", submitted_at: "2026-10-05T10:00:00+03:00", responsible_institution_name: "IZM" },
        relationships: { legal_act_type: { data: { id: "t1" } } },
        links: { web: "https://tapportals.mk.gov.lv/legal_acts/u1" },
      },
      { id: "u2", attributes: { identificator: "26-TA-1", name: "Vecs", submitted_at: "2026-09-01T10:00:00+03:00" } },
      { id: "u3", attributes: { identificator: "26-TA-2", name: "Bez datuma", submitted_at: null } },
    ],
    included: [{ type: "legal_act_types", id: "t1", attributes: { name: "Rīkojuma projekts" } }],
  };
  const [k, ...citi] = tapProjekti(json, LOGS);
  assert.equal(citi.length, 0);
  assert.deepEqual(
    [k.datums, k.nosaukums, k.atslegas, k.tips, k.progress],
    ["2026-10-05", "Plāns 2026.–2027. gadam", ["26-TA-991", "u1"], "Rīkojuma projekts", "Iesniegts"],
  );
});

test("dublikāti: unikāla atslēga jebkurā Notikumā; likumprojekta numurs — tikai ar to pašu datumu", () => {
  const kandidati = [
    { atslegas: ["1579/Lp14"], datums: "2026-10-07" },
    { atslegas: ["1579/Lp14"], datums: "2026-10-22" },
    { atslegas: ["op/2026/192.1"], datums: "2026-10-06", unikals: true },
  ];
  const notikumi = [
    { vieta: "data/notikumi/a.yaml", datums: "2026-10-07", teksts: "motivs: Grozījumi Meža likumā (1579/Lp14)" },
    { vieta: "origin/notikums/b:data/notikumi/b.yaml", datums: "2026-10-09", teksts: "url: https://www.vestnesis.lv/op/2026/192.1" },
  ];
  assert.deepEqual(
    atzimetDublikatus(kandidati, notikumi).map((k) => k.jau_ir),
    ["data/notikumi/a.yaml", undefined, "origin/notikums/b:data/notikumi/b.yaml"],
  );
});
