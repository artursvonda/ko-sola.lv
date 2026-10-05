import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { sakums } from "../lapas/sakums.js";
import { solijums } from "../lapas/solijums.js";
import { ierakstsNoDatiem, nolasitFiltrus, grupa, skaiti } from "../klients/filtri.js";
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

test("progress: statusu joslas segmenti tajā pašā secībā kā leģenda zem tās (bez Nepārbaudāmā)", () => {
  const progress = lapa.match(/<section class="progress"[\s\S]*?<\/section>/)[0];
  const josla = [...progress.matchAll(/<span class="seg [^"]*" data-statuss="([^"]+)"/g)].map((x) => x[1]);
  const legenda = [...progress.matchAll(/<li data-statuss="([^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(josla, ["izpildits", "daleji-izpildits", "procesa", "nav-izpildits", "nav-vertets"]);
  assert.deepEqual(legenda, [...josla, "neparbaudams"]);
});

const atributi = (s) => Object.fromEntries([...s.matchAll(/data-([a-z]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
const rindas = [...lapa.matchAll(/<tr [^>]*?data-id="([^"]+)"([^>]*)>([\s\S]*?)<\/tr>/g)].map(([, id, attr, saturs]) => ({ id, attr, saturs }));

test("tabula: bez JS redzamas visas rindas, katrā saite uz Solījuma lapu", () => {
  assert.equal(rindas.length, 17);
  assert.ok(rindas.every((r) => !/\bhidden\b/.test(r.attr)));
  for (const r of rindas) assert.match(r.saturs, new RegExp(`<a href="/solijumi/${r.id}/"`));
});

test("tabula: rinda nes filtra datus ar papildu vērtībām, bet papildu nerāda („Saistīti arī” grupa to aizstāj)", () => {
  const r = rindas.find((x) => x.id === "jv-aizsardzibai-5-nato-klatbutne");
  assert.deepEqual(ierakstsNoDatiem(atributi(r.attr)), {
    saraksts: "jv",
    iestades: ["am", "arm"],
    tema: ["aizsardziba", "arpolitika"],
    statuss: "procesa",
  });
  assert.equal(teksts(r.saturs.match(/<td role="cell" class="t-sol">[\s\S]*?<\/td>/)[0]).trim(), "Aizsardzībai 5% no IKP un pastāvīga NATO klātbūtne Aizsardzība");
  assert.equal(teksts(r.saturs.match(/<td role="cell" class="t-atb">[\s\S]*?<\/td>/)[0]).trim(), "Aizsardzības ministrija");
  assert.doesNotMatch(r.saturs, /arī/);
});

test("tabula: „Saistīti arī (papildu)” — otra rindu grupa, statiskajā HTML tukša un paslēpta", () => {
  const papildu = lapa.match(/<tbody [^>]*data-k="papildu"[^>]*>([\s\S]*?)<\/tbody>/);
  assert.ok(papildu);
  assert.match(papildu[0], /^<tbody [^>]*\bhidden\b/);
  assert.match(teksts(papildu[1]), /Saistīti arī \(papildu\): 0/);
  assert.doesNotMatch(papildu[1], /data-id=/);
});

test("tukšs filtrs: „Ar šiem filtriem solījumu nav.” un saite „Notīrīt filtrus” uz /", () => {
  const tukss = lapa.match(/<p class="tukss" data-k="tukss" hidden>([\s\S]*?)<\/p>/);
  assert.ok(tukss);
  assert.equal(teksts(tukss[1]).trim(), "Ar šiem filtriem solījumu nav. Notīrīt filtrus");
  assert.match(tukss[1], /<a href="\/">Notīrīt filtrus<\/a>/);
});

const izvele = (grupa, vertiba) => {
  const a = lapa.match(new RegExp(`<li\\b([^>]*)><a [^>]*data-grupa="${grupa}" data-vertiba="${vertiba}"[^>]*>[\\s\\S]*?</a>`));
  return a && { a: a[0], teksts: teksts(a[0]).trim(), paslepta: /\bhidden\b/.test(a[1]) };
};
const redzamas = (grupa) =>
  [...lapa.matchAll(new RegExp(`<li>(<a [^>]*data-grupa="${grupa}" data-vertiba="[^"]+"[^>]*>[\\s\\S]*?</a>)`, "g"))].map((x) => teksts(x[1]).replace(/ \d+$/, "").trim());

test("filtri: Atbildīgie un Tēmas pēc nosaukuma (latviešu alfabēts), Saraksti pēc CVK numura", () => {
  assert.deepEqual(redzamas("saraksts"), ["Suverēnā vara", "Nacionālā apvienība", "Apvienotais saraksts", "Latvija pirmajā vietā", "Jaunā VIENOTĪBA", "Progresīvie"]);
  assert.deepEqual(redzamas("atbildigais"), [
    "Aizsardzības ministrija",
    "Ekonomikas ministrija",
    "Finanšu ministrija",
    "Iekšlietu ministrija",
    "Klimata un enerģētikas ministrija",
    "Labklājības ministrija",
    "Veselības ministrija",
  ]);
  assert.deepEqual(redzamas("tema"), [
    "Aizsardzība",
    "Ģimenes un demogrāfija",
    "Iekšējā drošība un tiesiskums",
    "Mājokļi",
    "Nodokļi un budžets",
    "Veselība",
    "Vide un klimats",
  ]);
});

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

test("filtri: skaita pēc galvenās; tikai papildu vērtība — paslēpta izvēle (derīga saitēs); Tēmas bez Solījumiem nav", () => {
  // FM: 7 galvenā, vēl 2 Solījumiem papildu iestāde.
  assert.equal(izvele("atbildigais", "fm").teksts, "Finanšu ministrija 7");
  assert.equal(izvele("atbildigais", "fm").paslepta, false);
  assert.match(izvele("atbildigais", "fm").a, /href="\/\?atbildigais=fm"/);
  assert.equal(izvele("atbildigais", "arm").teksts, "Ārlietu ministrija 0");
  assert.equal(izvele("atbildigais", "arm").paslepta, true);
  assert.equal(izvele("tema", "arpolitika").teksts, "Ārpolitika 0");
  assert.equal(izvele("tema", "arpolitika").paslepta, true);
  assert.equal(izvele("tema", "aizsardziba").teksts, "Aizsardzība 5");
  assert.equal(izvele("saraksts", "").paslepta, false);
  assert.equal(izvele("tema", "transports"), null);
});

test("virsraksti: h1 (izvēlētais filtrs) pirms filtru grupu h2", () => {
  const h1 = lapa.search(/<h1\b/);
  assert.ok(h1 >= 0);
  assert.ok(h1 < lapa.search(/<h2\b/));
  assert.equal(teksts(lapa.match(/<h1\b[\s\S]*?<\/h1>/)[0]).trim(), "Visi saraksti");
});

test("bez JS: <noscript> paziņo, ka filtri nedarbojas un redzami visi solījumi", () => {
  const ns = lapa.match(/<noscript>([\s\S]*?)<\/noscript>/);
  assert.ok(ns);
  assert.match(teksts(ns[1]), /Filtri darbojas tikai ar JavaScript — redzami visi solījumi\./);
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

test("Solījuma lapa „Visi … solījumi šajā tēmā (N)”: N = galvenās grupas rindas un izvēles skaits pārskatā", () => {
  // Fixtures nevienam Sarakstam nav vairāk par 3 solījumiem vienā tēmā — ceturto (ar papildu tēmām) pieliek tikai šim testam.
  const as = m.solijumi.find((x) => x.saraksts.slug === "as" && x.tema.slug === "nodokli-un-budzets");
  const ceturtais = { ...as, id: "as-papildu-tests" };
  // Šis AS Solījums tēmā nodokļi ir tikai papildu: pārskatā tas ir „Saistīti arī”, ne N.
  const papildu = { ...as, id: "as-papildu-tema", tema: m.temas[1], papildu_temas: [as.tema] };
  const m4 = { ...m, solijumi: [...m.solijumi, ceturtais, papildu] };
  const parskats = sakums(m4);
  const ieraksti = [...parskats.matchAll(/<tr [^>]*?data-id="[^"]+"([^>]*)>/g)].map((x) => ierakstsNoDatiem(atributi(x[1])));
  let saites = 0;
  for (const s of m4.solijumi) {
    for (const [, href, n] of solijums(s, m4).matchAll(/<a href="([^"]+)">Visi \w+ solījumi šajā tēmā \((\d+)\)<\/a>/g)) {
      saites++;
      const filtri = nolasitFiltrus(new URL(href.replaceAll("&amp;", "&"), "https://x").search);
      const galvena = ieraksti.filter((x) => grupa(x, filtri) === "galvena");
      assert.equal(galvena.length, Number(n), href);
      assert.equal(skaiti(ieraksti, filtri).tema[filtri.tema], Number(n), href);
      assert.ok(ieraksti.some((x) => grupa(x, filtri) === "papildu"), "papildu Solījums ir otrajā grupā");
    }
  }
  assert.ok(saites > 0);
});
