import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import { statuss, amatpersona, frakcijasSaraksts, sisSaeimasBalsojums, ieladetModeli } from "../dati.js";

test("statuss: pēdējā Statusa maiņa, citādi Nav vērtēts; Nepārbaudāmam — neparbaudams", () => {
  assert.equal(statuss({ parbaudams: true }), "nav-vertets");
  assert.equal(statuss({ parbaudams: true, statusa_mainas: [{ statuss: "procesa" }, { statuss: "izpildits" }] }), "izpildits");
  assert.equal(statuss({ parbaudams: false, statusa_mainas: [] }), "neparbaudams");
});

test("amatpersona: kas amatā dotajā datumā (lidz ieskaitot)", () => {
  const i = {
    amatpersonas: [
      { vards: "A", no: "2026-05-28", lidz: "2026-11-20" },
      { vards: "B", no: "2026-11-21" },
    ],
  };
  assert.equal(amatpersona(i, "2026-11-20").vards, "A");
  assert.equal(amatpersona(i, "2026-11-21").vards, "B");
  assert.equal(amatpersona(i, "2026-05-01"), null);
});

test("modelis no fixtures: saites starp Solījumiem, Notikumiem un iestādēm", () => {
  const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05" });
  const s = m.solijumi.find((x) => x.id === "as-mun-likme-10-fiziskam-personam");
  assert.equal(s.statuss, "izpildits");
  assert.equal(s.saraksts.saisinajums, "AS");
  assert.equal(s.iestade.slug, "fm");
  assert.ok(s.amatpersona.vards);
  assert.equal(s.notikumi[0].virziens, "par");
  assert.equal(s.statusa_mainas[0].notikumi[0].id, "2026-10-22-paraugs-mun-likuma-grozijumi");
  assert.match(s.avoti[0].url, /^https:\/\/www\.vestnesis\.lv\//);
});

test("frakcijasSaraksts: 15. Saeimā kods → Saraksts pēc `frakcija`; 14. Saeimā un bez frakcijas — neviens", () => {
  const jv = { slug: "jv", saisinajums: "JV", frakcija: "JV" };
  const na = { slug: "na", saisinajums: "NA", frakcija: "NA!" };
  const saraksti = [jv, na, { slug: "sv", saisinajums: "SV" }];
  assert.equal(frakcijasSaraksts({ saeima: 15 }, "NA!", saraksti), na);
  assert.equal(frakcijasSaraksts({ saeima: 15 }, "JV", saraksti), jv);
  assert.equal(frakcijasSaraksts({ saeima: 15 }, "bez_frakcijas", saraksti), null);
  assert.equal(frakcijasSaraksts({ saeima: 15 }, "ZZS", saraksti), null);
  assert.equal(frakcijasSaraksts({ saeima: 14 }, "JV", saraksti), null);
});

test("sisSaeimasBalsojums: tikai 15. Saeimas (kurā ievēlēti šie Saraksti) balsojums", () => {
  assert.equal(sisSaeimasBalsojums({ saeima: 15 }), true);
  assert.equal(sisSaeimasBalsojums({ saeima: 14 }), false);
});

test("neskaidra galvenā iestāde: iestāde „Neskaidrs” bez Amatpersonas, ir filtra iestāžu sarakstā", () => {
  const sakne = mkdtempSync(join(tmpdir(), "ko-sola-"));
  cpSync("fixtures/data", join(sakne, "data"), { recursive: true });
  const cels = join(sakne, "data/solijumi/as/as-mun-likme-10-fiziskam-personam.yaml");
  writeFileSync(cels, stringify({ ...parse(readFileSync(cels, "utf8")), iestades: { galvena: "neskaidrs", papildu: [] } }));
  try {
    const m = ieladetModeli({ sakne: ".", datuSakne: sakne, sodien: "2026-10-05" });
    const s = m.solijumi.find((x) => x.id === "as-mun-likme-10-fiziskam-personam");
    assert.equal(s.iestade.slug, "neskaidrs");
    assert.equal(s.iestade.nosaukums, "Neskaidrs");
    assert.equal(s.amatpersona, null);
    assert.ok(m.iestades.includes(s.iestade));
  } finally {
    rmSync(sakne, { recursive: true, force: true });
  }
});
