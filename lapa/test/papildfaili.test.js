import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { lapas, papildFaili } from "../lapas/index.js";

const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05" });
const fails = (m, vards) => papildFaili(m, lapas(m)).find((f) => f.fails === vards)?.saturs;

test("sitemap.xml: visas lapas ar absolūtu URL, bez 404", () => {
  const s = fails(m, "sitemap.xml");
  assert.match(s, /<loc>https:\/\/ko-sola\.lv\/<\/loc>/);
  assert.match(s, /<loc>https:\/\/ko-sola\.lv\/metodologija\/<\/loc>/);
  for (const x of m.solijumi) assert.ok(s.includes(`<loc>https://ko-sola.lv/solijumi/${x.id}/</loc>`));
  assert.doesNotMatch(s, /404/);
  assert.equal(s.match(/<url>/g).length, lapas(m).length - 1);
});

test("_redirects: bez Pārvirzījumiem nav; Pārvirzījums — lapa ar un bez slīpsvītras un og.png, tikai statiski noteikumi", () => {
  assert.equal(fails(m, "_redirects"), undefined);
  const ar = { ...m, parvirzijumi: [{ no: "jv-vecais", uz: "jv-jaunais", iemesls: "dublikāts" }] };
  assert.equal(
    fails(ar, "_redirects"),
    "/solijumi/jv-vecais /solijumi/jv-jaunais/ 301\n/solijumi/jv-vecais/ /solijumi/jv-jaunais/ 301\n/solijumi/jv-vecais/og.png /solijumi/jv-jaunais/og.png 301\n",
  );
});

test("canonical: lapām ar ceļu — absolūts URL (filtru query parametri nav atsevišķas lapas)", () => {
  const sakums = lapas(m).find((l) => l.cels === "/");
  assert.match(sakums.html, /<link rel="canonical" href="https:\/\/ko-sola\.lv\/">/);
  assert.doesNotMatch(lapas(m).find((l) => l.cels === "/404").html, /canonical/);
});
