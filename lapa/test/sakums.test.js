import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { sakums } from "../lapas/sakums.js";
import { solijums } from "../lapas/solijums.js";
import { ierakstsNoDatiem } from "../klients/filtri.js";
import { PANELA_DALAS } from "../klients/panelis.js";

// Paraugdati: 17 Solījumi, 1 Nepārbaudāms; izpildīti 3, daļēji 1, procesā 2, nav izpildīts 1, nav vērtēti 9.
const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05" });
const lapa = sakums(m);
// Redzamais teksts: bloka elementi atdala vārdus, rindiņas elementi — ne.
const teksts = (h) =>
  String(h)
    .replace(/<\/?(p|li|td|th|tr|div|section|h\d)\b[^>]*>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ");

test("pārskats: progress „X no N izpildīti” bez Nepārbaudāmajiem", () => {
  const progress = lapa.match(/<section class="progress"[\s\S]*?<\/section>/)[0];
  assert.match(teksts(progress), /3 no 16 solījumiem izpildīti/);
  assert.match(teksts(progress), /Nepārbaudāmie \(1\) kopskaitā nav iekļauti/);
  assert.match(teksts(progress), /Izpildīts 3 Daļēji izpildīts 1 Procesā 2 Nav izpildīts 1 Nav vērtēts 9 Nepārbaudāms 1/);
});

const atributi = (s) => Object.fromEntries([...s.matchAll(/data-([a-z]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
const rindas = [...lapa.matchAll(/<tr [^>]*?data-id="([^"]+)"([^>]*)>([\s\S]*?)<\/tr>/g)].map(([, id, attr, saturs]) => ({ id, attr, saturs }));

test("tabula: bez JS redzamas visas rindas, katrā saite uz Solījuma lapu", () => {
  assert.equal(rindas.length, 17);
  assert.ok(rindas.every((r) => !/\bhidden\b/.test(r.attr)));
  for (const r of rindas) assert.match(r.saturs, new RegExp(`<a href="/solijumi/${r.id}/"`));
});

test("tabula: rinda nes filtra datus ar papildu vērtībām; papildu rāda kā „arī”", () => {
  const r = rindas.find((x) => x.id === "jv-aizsardzibai-5-nato-klatbutne");
  assert.deepEqual(ierakstsNoDatiem(atributi(r.attr)), {
    saraksts: "jv",
    atbildigais: ["am", "arm"],
    tema: ["aizsardziba", "arpolitika"],
    statuss: "procesa",
  });
  assert.match(teksts(r.saturs), /Aizsardzība · arī Ārpolitika/);
  assert.match(teksts(r.saturs), /Aizsardzības ministrija arī: ĀM/);
});

const izvele = (grupa, vertiba) => {
  const a = lapa.match(new RegExp(`<a [^>]*data-grupa="${grupa}" data-vertiba="${vertiba}"[^>]*>[\\s\\S]*?</a>`));
  return a && { a: a[0], teksts: teksts(a[0]).trim() };
};

test("filtri: Saraksts / Atbildīgais / Tēma — saites ar skaitiem; sākumā izvēlēts „Visi”", () => {
  assert.match(lapa, /<ko-parskats>[\s\S]*<\/ko-parskats>/);
  assert.equal(izvele("saraksts", "").teksts, "Visi saraksti 17");
  assert.match(izvele("saraksts", "").a, /aria-current="true"/);
  assert.equal(izvele("saraksts", "as").teksts, "Apvienotais saraksts 8");
  assert.match(izvele("saraksts", "as").a, /href="\/\?saraksts=as"/);
  assert.doesNotMatch(izvele("saraksts", "as").a, /aria-current/);
  assert.equal(izvele("atbildigais", "").teksts, "Visi 17");
  assert.equal(izvele("tema", "").teksts, "Visas tēmas 17");
});

test("filtri: skaita pēc galvenās; tikai papildu vērtība ir izvēle ar 0; Tēmas bez Solījumiem nerāda", () => {
  // FM: 7 galvenā, vēl 2 Solījumiem papildu iestāde.
  assert.equal(izvele("atbildigais", "fm").teksts, "Finanšu ministrija 7");
  assert.match(izvele("atbildigais", "fm").a, /href="\/\?atbildigais=fm"/);
  assert.equal(izvele("atbildigais", "arm").teksts, "Ārlietu ministrija 0");
  assert.equal(izvele("tema", "arpolitika").teksts, "Ārpolitika 0");
  assert.equal(izvele("tema", "aizsardziba").teksts, "Aizsardzība 5");
  assert.equal(izvele("tema", "transports"), null);
});

test("detaļu panelis: tukšs un paslēpts statiskajā HTML (bez JS — rindas saite)", () => {
  assert.match(lapa, /<aside class="panelis" aria-label="Izvēlētais solījums" data-k="panelis" tabindex="-1" hidden><\/aside>/);
});

test("Solījuma lapa satur daļas, ko panelis ņem no tās: virsraksts, citāts ar avotu, josla, laika ass", () => {
  const s = m.solijumi.find((x) => x.id === "jv-aizsardzibai-5-nato-klatbutne");
  const h = solijums(s, m);
  for (const selektors of Object.values(PANELA_DALAS)) {
    // Selektori ir formā "elements.klase.klase"; HTML pārbauda, ka tāds elements ar šīm klasēm ir.
    const [el, ...klases] = selektors.split(".");
    const re = klases.length
      ? new RegExp(`<${el}\\b[^>]*class="[^"]*${klases.map((k) => `\\b${k}\\b[^"]*`).join("")}"`)
      : new RegExp(`<${el}\\b`);
    assert.match(h, re, selektors);
  }
});
