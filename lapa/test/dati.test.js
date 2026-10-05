import { test } from "node:test";
import assert from "node:assert/strict";
import { statuss, amatpersona, progress, frakcijasSaraksts, ieladetModeli } from "../dati.js";

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

test("progress: N bez Nepārbaudāmajiem", () => {
  const p = progress([{ statuss: "izpildits" }, { statuss: "nav-vertets" }, { statuss: "neparbaudams" }]);
  assert.equal(p.n, 2);
  assert.equal(p.skaits.izpildits, 1);
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
