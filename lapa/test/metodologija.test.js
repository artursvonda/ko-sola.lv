import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { metodologija } from "../lapas/metodologija.js";
import { sakums } from "../lapas/sakums.js";
import { solijums } from "../lapas/solijums.js";
import { salidzinajums } from "../lapas/salidzinajums.js";
import { avotuApraksts, avotuAsimetrija } from "../lapas/avoti.js";
import { kludasSaite } from "../lapas/saites.js";

const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05", atjaunoti: "2026-10-11" });
const sar = (slug) => m.saraksti.find((s) => s.slug === slug);
const teksts = (h) => String(h).replace(/<\/?(td|th|tr)\b[^>]*>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

test("avotu apraksts no data/saraksti.yaml: tikai CVK / + paplašinātā / + tematiska", () => {
  assert.equal(avotuApraksts(sar("na")), "CVK programma");
  assert.equal(avotuApraksts(sar("jv")), "CVK programma + paplašinātā programma");
  assert.equal(avotuApraksts(sar("lpv")), "CVK programma + tematiska paplašinātā programma (ekonomika)");
  assert.equal(
    avotuAsimetrija(m.saraksti),
    "visiem sarakstiem ir CVK programma (līdz 10 000 zīmēm), JV un PRO — arī paplašinātā, LPV — arī tematiska (ekonomika)",
  );
});

test("kļūdas saite: veidne; Solījumam — ID virsrakstā un aizpildīts lauks `solijums`", () => {
  const u = new URL(kludasSaite({ id: "jv-x" }));
  assert.equal(u.origin + u.pathname, "https://github.com/artursvonda/ko-sola.lv/issues/new");
  assert.equal(u.searchParams.get("template"), "kluda-solijuma.yml");
  assert.equal(u.searchParams.get("title"), "Kļūda: jv-x");
  assert.equal(u.searchParams.get("solijums"), "https://ko-sola.lv/solijumi/jv-x/");
  assert.deepEqual([...new URL(kludasSaite(null)).searchParams.keys()], ["template"]);
});

test("metodoloģija: 8 numurētas sadaļas, avotu tabula no datiem ar kopsummu", () => {
  const h = String(metodologija(m));
  assert.deepEqual(
    [...h.matchAll(/<h2 id="([a-z]+)-v">(\d)\./g)].map((x) => `${x[2]}${x[1]}`),
    ["1par", "2atlase", "3avoti", "4vertesana", "5ai", "6izdevejs", "7neitralitate", "8kludas"],
  );
  const tabula = h.match(/<table class="tabula avotu-tabula">[\s\S]*?<\/table>/)[0];
  const rindas = [...tabula.matchAll(/<tr>\s*<th scope="row"[^>]*>[\s\S]*?<\/tr>/g)].map((x) => teksts(x[0]).trim());
  assert.equal(rindas.length, m.saraksti.length + 1);
  const jv = m.solijumi.filter((s) => s.saraksts.slug === "jv");
  assert.equal(rindas.find((r) => r.startsWith("JV")), `JV · Jaunā VIENOTĪBA CVK programma + paplašinātā programma ${jv.length} ${jv.filter((s) => !s.parbaudams).length}`);
  assert.match(rindas.at(-1), new RegExp(`^Kopā ${m.solijumi.length} ${m.solijumi.filter((s) => !s.parbaudams).length}$`));
});

test("kājene visās lapās: Metodoloģija, kļūdas, GitHub, datu datums; nav cilnes „Metodoloģija”", () => {
  for (const h of [sakums(m), salidzinajums(m), metodologija(m), solijums(m.solijumi[0], m)].map(String)) {
    const kajene = h.match(/<footer class="kajene">[\s\S]*?<\/footer>/)[0];
    assert.match(kajene, /href="\/metodologija\/">Metodoloģija un izdevējs</);
    assert.match(kajene, /href="\/metodologija\/#kludas">Ziņot par kļūdu</);
    assert.match(kajene, /href="https:\/\/github.com\/artursvonda\/ko-sola.lv">Atvērtais kods un dati \(GitHub\)</);
    assert.match(kajene, /Dati atjaunoti <time datetime="2026-10-11">11\.10\.2026<\/time>/);
    assert.doesNotMatch(h.match(/<header[\s\S]*?<\/header>/)[0], /metodologija/);
  }
  assert.doesNotMatch(String(sakums({ ...m, atjaunoti: null })), /Dati atjaunoti/);
});

test("pārskats: avotu rinda katram Sarakstam, statiskajā HTML paslēpta", () => {
  const rindas = [...String(sakums(m)).matchAll(/<p class="avotu-rinda" data-k="avoti" data-saraksts="([a-z]+)" hidden>(.*?)<\/p>/g)];
  assert.deepEqual(rindas.map((x) => x[1]), m.saraksti.map((s) => s.slug));
  assert.equal(teksts(rindas.find((x) => x[1] === "lpv")[2]), "Avoti: CVK programma + tematiska paplašinātā programma (ekonomika) · Metodoloģija");
});

test("Solījuma lapa: „Ziņot par kļūdu” ar Solījuma ID", () => {
  const s = m.solijumi[0];
  const h = String(solijums(s, m));
  assert.ok(h.includes(`href="${kludasSaite(s).replaceAll("&", "&amp;")}">Ziņot par kļūdu</a>`));
});
