import { test } from "node:test";
import assert from "node:assert/strict";
import { nolasitFiltrus, atbilst, grupa, skaiti, progress, izvelesSaite, raditIzveli } from "../klients/filtri.js";

const VISI = { saraksts: null, atbildigais: null, tema: null };
// Ieraksts: galvenā vērtība pirmā, tad papildu.
const jvAizs = { saraksts: "jv", iestades: ["am", "arm"], tema: ["aizsardziba", "arpolitika"], statuss: "procesa" };

test("nolasitFiltrus: saraksts, atbildigais, tema no query; trūkstošie — null", () => {
  assert.deepEqual(nolasitFiltrus("?saraksts=jv&tema=aizsardziba"), { saraksts: "jv", atbildigais: null, tema: "aizsardziba" });
  assert.deepEqual(nolasitFiltrus(""), { saraksts: null, atbildigais: null, tema: null });
  assert.deepEqual(nolasitFiltrus("?atbildigais=&cits=x"), { saraksts: null, atbildigais: null, tema: null });
});

test("nolasitFiltrus: nezināmu vērtību neņem vērā, ja dotas derīgās", () => {
  const derigas = { saraksts: new Set(["jv", "as"]), atbildigais: new Set(["fm"]), tema: new Set(["veseliba"]) };
  assert.deepEqual(nolasitFiltrus("?saraksts=xx&atbildigais=fm&tema=veseliba", derigas), { saraksts: null, atbildigais: "fm", tema: "veseliba" });
});

test("atbilst: papildu Tēma un papildu iestāde arī atbilst filtram", () => {
  assert.equal(atbilst(jvAizs, VISI), true);
  assert.equal(atbilst(jvAizs, { ...VISI, saraksts: "jv", tema: "arpolitika" }), true);
  assert.equal(atbilst(jvAizs, { ...VISI, atbildigais: "arm" }), true);
  assert.equal(atbilst(jvAizs, { ...VISI, saraksts: "as" }), false);
  assert.equal(atbilst(jvAizs, { ...VISI, tema: "veseliba" }), false);
});

test("grupa: galvenā — atbilst ar galvenajām vērtībām; papildu — tikai ar papildu; citādi null", () => {
  // jvAizs: galvenā Tēma aizsardziba, papildu arpolitika; galvenā iestāde am, papildu arm.
  assert.equal(grupa(jvAizs, VISI), "galvena");
  assert.equal(grupa(jvAizs, { ...VISI, saraksts: "jv", tema: "aizsardziba" }), "galvena");
  assert.equal(grupa(jvAizs, { ...VISI, tema: "arpolitika" }), "papildu");
  assert.equal(grupa(jvAizs, { ...VISI, tema: "aizsardziba", atbildigais: "arm" }), "papildu");
  assert.equal(grupa(jvAizs, { ...VISI, saraksts: "as" }), null);
  assert.equal(grupa(jvAizs, { ...VISI, tema: "veseliba" }), null);
});

const PARAUGS = [
  { saraksts: "jv", iestades: ["fm"], tema: ["nodokli"], statuss: "izpildits" },
  { saraksts: "jv", iestades: ["am", "fm"], tema: ["aizsardziba", "nodokli"], statuss: "procesa" },
  { saraksts: "as", iestades: ["fm"], tema: ["nodokli"], statuss: "neparbaudams" },
  { saraksts: "as", iestades: ["vm"], tema: ["veseliba"], statuss: "nav-vertets" },
];

test("skaiti: katra grupa ņem vērā pārējo grupu filtrus pēc galvenās vērtības (= galvenās grupas lielums)", () => {
  const sk = skaiti(PARAUGS, { ...VISI, tema: "nodokli" });
  // Otrajam ierakstam nodokļi ir papildu Tēma: tas ir „Saistīti arī”, ne skaitā.
  assert.deepEqual(sk.saraksts, { "": 2, jv: 1, as: 1 });
  assert.deepEqual(sk.atbildigais, { "": 2, fm: 2 });
  // Tēmas grupa neņem vērā pašas Tēmas filtru.
  assert.deepEqual(sk.tema, { "": 4, nodokli: 2, aizsardziba: 1, veseliba: 1 });
  // Otrajam ierakstam FM ir papildu iestāde.
  assert.deepEqual(skaiti(PARAUGS, { ...VISI, atbildigais: "fm" }).tema, { "": 2, nodokli: 2 });
});

test("skaiti: izvēles skaits = galvenās grupas rindu skaits pēc tās izvēles", () => {
  const filtri = { ...VISI, tema: "nodokli" };
  for (const [g, vertiba] of [["saraksts", "jv"], ["saraksts", "as"], ["atbildigais", "fm"], ["tema", "nodokli"]]) {
    const izvelets = { ...filtri, [g]: vertiba };
    assert.equal(skaiti(PARAUGS, filtri)[g][vertiba], PARAUGS.filter((x) => grupa(x, izvelets) === "galvena").length, `${g}=${vertiba}`);
  }
});

test("progress: N bez Nepārbaudāmajiem; skaiti B1 leģendas secībā", () => {
  const p = progress(PARAUGS);
  assert.equal(p.izpilditi, 1);
  assert.equal(p.n, 3);
  assert.equal(p.neparbaudami, 1);
  assert.deepEqual(Object.entries(p.skaits), [
    ["izpildits", 1],
    ["daleji-izpildits", 0],
    ["procesa", 1],
    ["nav-izpildits", 0],
    ["nav-vertets", 1],
    ["neparbaudams", 1],
  ]);
  assert.equal(progress([]).n, 0);
});

test("izvelesSaite: maina vienu grupu, pārējās saglabā; null — „Visi”", () => {
  const f = { saraksts: "jv", atbildigais: null, tema: "aizsardziba" };
  assert.equal(izvelesSaite(f, "saraksts", "as"), "/?saraksts=as&tema=aizsardziba");
  assert.equal(izvelesSaite(f, "tema", null), "/?saraksts=jv");
});

test("raditIzveli: izvēle ar 0 paslēpta, izņemot izvēlēto un „Visi…”", () => {
  assert.equal(raditIzveli({ vertiba: "na", skaits: 0, izveleta: false }), false);
  assert.equal(raditIzveli({ vertiba: "na", skaits: 0, izveleta: true }), true);
  assert.equal(raditIzveli({ vertiba: "na", skaits: 3, izveleta: false }), true);
  assert.equal(raditIzveli({ vertiba: "", skaits: 0, izveleta: false }), true);
});
