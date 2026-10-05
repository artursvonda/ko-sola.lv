import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { matrica, temasSaraksti } from "../lapas/salidzinajums-dati.js";
import { salidzinajums } from "../lapas/salidzinajums.js";

const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05" });

test("matrica: rindas — saraksti CVK numuru secībā, kolonnas — visas 19 tēmas taksonomijas secībā", () => {
  const rindas = matrica(m);
  assert.deepEqual(
    rindas.map((r) => r.saraksts.saisinajums),
    ["SV", "NA", "AS", "LPV", "JV", "PRO"],
  );
  for (const r of rindas) {
    assert.equal(r.sunas.length, 19);
    assert.equal(r.sunas[0].tema.slug, "nodokli-un-budzets");
    assert.equal(r.sunas[18].tema.slug, "demokratija-un-cilvektiesibas");
  }
});

test("matrica: skaita tikai pēc galvenās tēmas (papildu tēma neskaitās)", () => {
  const suna = (sar, tema) => matrica(m).find((r) => r.saraksts.saisinajums === sar).sunas.find((s) => s.tema.slug === tema).n;
  assert.equal(suna("AS", "nodokli-un-budzets"), 3);
  assert.equal(suna("NA", "nodokli-un-budzets"), 0);
  assert.equal(suna("NA", "aizsardziba"), 1);
  // jv-aizsardzibai-5-nato-klatbutne: galvenā aizsardzība, papildu ārpolitika
  assert.equal(suna("JV", "aizsardziba"), 1);
  assert.equal(suna("JV", "arpolitika"), 0);
});

test("temasSaraksti: visi 6 saraksti CVK secībā, arī bez solījumiem tēmā", () => {
  const t = temasSaraksti(m, "aizsardziba");
  assert.deepEqual(t.map((x) => x.saraksts.saisinajums), ["SV", "NA", "AS", "LPV", "JV", "PRO"]);
  assert.deepEqual(t.find((x) => x.saraksts.saisinajums === "AS").galvenie, []);
  assert.deepEqual(
    t.find((x) => x.saraksts.saisinajums === "JV").galvenie.map((s) => s.id),
    ["jv-aizsardzibai-5-nato-klatbutne"],
  );
});

test("temasSaraksti: Solījumi ar šo papildu tēmu — atsevišķi no galvenajiem", () => {
  const jv = temasSaraksti(m, "arpolitika").find((x) => x.saraksts.saisinajums === "JV");
  assert.deepEqual(jv.galvenie, []);
  assert.deepEqual(jv.papildu.map((s) => s.id), ["jv-aizsardzibai-5-nato-klatbutne"]);
  const na = temasSaraksti(m, "aizsardziba").find((x) => x.saraksts.saisinajums === "NA");
  assert.deepEqual(na.papildu, []);
});

const lapa = salidzinajums(m);
const sadala = (slug) => lapa.match(new RegExp(`<section[^>]*id="${slug}"[\\s\\S]*?</section>`))?.[0];

test("lapa: matricas rindas ir saraksti, kolonnu galvenes — tēmu saites", () => {
  const galva = lapa.match(/<thead>[\s\S]*?<\/thead>/)[0];
  assert.match(galva, /<a href="\/salidzinajums\/\?tema=nodokli-un-budzets#nodokli-un-budzets"[^>]*>Nodokļi un budžets<\/a>/);
  assert.equal(galva.match(/<a /g).length, 19);
  const rindas = [...lapa.matchAll(/<tr>\s*<th scope="row"><abbr title="[^"]+">(\w+)<\/abbr>/g)].map((x) => x[1]);
  assert.deepEqual(rindas, ["SV", "NA", "AS", "LPV", "JV", "PRO"]);
});

test("lapa: šūna ar solījumiem ir saite uz tēmu; tukšā — bez saites", () => {
  assert.match(lapa, /<td[^>]*><a href="\/salidzinajums\/\?tema=nodokli-un-budzets#nodokli-un-budzets" aria-label="Apvienotais saraksts, Nodokļi un budžets: 3">3<\/a><\/td>/);
  const naRinda = lapa.match(/<tr>\s*<th scope="row"><abbr title="[^"]+">NA<\/abbr>[\s\S]*?<\/tr>/)[0];
  assert.equal(naRinda.match(/<a /g).length, 1); // tikai aizsardzība
});

test("lapa bez JS: visas 19 tēmas statiskajā HTML ar enkuru, katrā visi 6 saraksti", () => {
  for (const t of m.temas) assert.ok(sadala(t.slug), `nav sadaļas ${t.slug}`);
  const a = sadala("aizsardziba");
  assert.match(a, /<h2[^>]*>Aizsardzība <span[^>]*>— visi saraksti blakus<\/span><\/h2>/);
  assert.equal(a.match(/<h3/g).length, 6);
  assert.match(a, /<a href="\/solijumi\/jv-aizsardzibai-5-nato-klatbutne\/">/);
  assert.match(a, /Šajā tēmā solījumu nav/); // AS
});

test("lapa: Solījums ar papildu tēmu redzams arī tajā tēmā, ar norādi uz galveno", () => {
  const a = sadala("arpolitika");
  assert.match(a, /<a href="\/solijumi\/jv-aizsardzibai-5-nato-klatbutne\/">/);
  assert.match(a, /Galvenā tēma: <a href="\/salidzinajums\/\?tema=aizsardziba#aizsardziba">Aizsardzība<\/a>/);
});

test("lapa: papildu Solījumi zem virsraksta „Saistīti arī (papildu): N” (kā pārskatā), pēc galvenajiem", () => {
  const jv = sadala("arpolitika").match(/<div class="blakus-saraksts">\s*<h3><abbr [^>]*>JV<\/abbr>[\s\S]*?<\/div>/)[0];
  assert.match(jv, /<p class="lbl[^"]*">Saistīti arī \(papildu\): 1<\/p>\s*<ul>[\s\S]*jv-aizsardzibai-5-nato-klatbutne/);
  // Bez papildu Solījumiem virsraksta nav.
  assert.doesNotMatch(sadala("aizsardziba"), /Saistīti arī/);
});

test("lapa: „Rādīt visas tēmas” — saite uz /salidzinajums/, statiskajā HTML paslēpta (bez JS visas tēmas jau redzamas)", () => {
  assert.match(lapa, /<p class="visas-temas" data-k="visas" hidden><a href="\/salidzinajums\/">Rādīt visas tēmas<\/a><\/p>/);
});

test("Solījuma lapa: saite uz salīdzinājumu ved uz tēmas enkuru (arī bez JS)", async () => {
  const { solijums } = await import("../lapas/solijums.js");
  const s = m.solijumi.find((x) => x.id === "jv-aizsardzibai-5-nato-klatbutne");
  const h = solijums(s, m);
  assert.match(h, /href="\/salidzinajums\/\?tema=aizsardziba#aizsardziba"/);
  assert.doesNotMatch(h, /href="\/salidzinajums\/\?tema=[^"#]+"/);
});
