import { test } from "node:test";
import assert from "node:assert/strict";
import { nolasitFiltrus, atbilst, skaiti, progress, izvelesSaite } from "../klients/filtri.js";
import { parskatsSaite } from "../lapas/saites.js";

const VISI = { saraksts: null, atbildigais: null, tema: null };
// Ieraksts: galvenā vērtība pirmā, tad papildu.
const jvAizs = { saraksts: "jv", atbildigais: ["am", "arm"], tema: ["aizsardziba", "arpolitika"], statuss: "procesa" };

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

const PARAUGS = [
  { saraksts: "jv", atbildigais: ["fm"], tema: ["nodokli"], statuss: "izpildits" },
  { saraksts: "jv", atbildigais: ["am", "fm"], tema: ["aizsardziba", "nodokli"], statuss: "procesa" },
  { saraksts: "as", atbildigais: ["fm"], tema: ["nodokli"], statuss: "neparbaudams" },
  { saraksts: "as", atbildigais: ["vm"], tema: ["veseliba"], statuss: "nav-vertets" },
];

test("skaiti: katra grupa ņem vērā pārējo grupu filtrus, skaita pēc galvenās vērtības", () => {
  const sk = skaiti(PARAUGS, { ...VISI, tema: "nodokli" });
  assert.deepEqual(sk.saraksts, { "": 3, jv: 2, as: 1 });
  // Otrajam ierakstam FM ir papildu iestāde: filtrē, bet neskaita.
  assert.deepEqual(sk.atbildigais, { "": 3, fm: 2, am: 1 });
  // Tēmas grupa neņem vērā pašas Tēmas filtru.
  assert.deepEqual(sk.tema, { "": 4, nodokli: 2, aizsardziba: 1, veseliba: 1 });
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

test("parskatsSaite: stabila parametru secība, tukšos izlaiž", () => {
  assert.equal(parskatsSaite({ tema: "aizsardziba", saraksts: "jv" }), "/?saraksts=jv&tema=aizsardziba");
  assert.equal(parskatsSaite({ saraksts: null, atbildigais: "fm", tema: "" }), "/?atbildigais=fm");
  assert.equal(parskatsSaite({}), "/");
});

test("izvelesSaite: maina vienu grupu, pārējās saglabā; null — „Visi”", () => {
  const f = { saraksts: "jv", atbildigais: null, tema: "aizsardziba" };
  assert.equal(izvelesSaite(f, "saraksts", "as"), "/?saraksts=as&tema=aizsardziba");
  assert.equal(izvelesSaite(f, "tema", null), "/?saraksts=jv");
});
