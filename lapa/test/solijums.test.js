import { test } from "node:test";
import assert from "node:assert/strict";
import { ieladetModeli } from "../dati.js";
import { solijums } from "../lapas/solijums.js";

const m = ieladetModeli({ sakne: ".", datuSakne: "fixtures", sodien: "2026-10-05" });
const atrast = (id) => m.solijumi.find((x) => x.id === id);
const lapa = (s, modelis = m) => String(solijums(s, modelis));
/** Frakciju balsojuma tabulas rindu virsraksti (`<th scope="row">…</th>`). */
const frakcijuRindas = (h) => [...h.matchAll(/<th scope="row"[^>]*>(.*?)<\/th>/g)].map((x) => x[1]);
/** Rindu virsrakstu `title` (frakcijas kods); bez tā — null. */
const frakcijuKodi = (h) => [...h.matchAll(/<th scope="row"(?: title="([^"]*)")?>/g)].map((x) => x[1] ?? null);

test("Frakciju balsojums 14. Saeimā: frakciju kodi datu secībā, nevis Saraksti, ar paskaidrojumu", () => {
  const h = lapa(atrast("as-mun-likme-10-fiziskam-personam"));
  assert.deepEqual(frakcijuRindas(h), ["JV", "ZZS", "NA", "AS", "LPV", "PRO", "Bez frakcijas"]);
  assert.match(h, /<p class="vajs">Balsojums 14\. Saeimā\. Tās frakcijas nav tas pats, kas 2026\. gada vēlēšanu Saraksti\.<\/p>/);
});

test("Frakciju balsojums 15. Saeimā: tikai Saraksts CVK secībā, kods — title; nezināmie pēc tiem, „Bez frakcijas” pēdējā", () => {
  const kodi = { jv: "JVF", na: "NAF", sv: "SVF" };
  const m15 = { ...m, saraksti: m.saraksti.map((sr) => ({ ...sr, frakcija: kodi[sr.slug] })) };
  const s = atrast("as-mun-likme-10-fiziskam-personam");
  const balss = { par: 1, pret: 0, atturas: 0 };
  const s15 = {
    ...s,
    notikumi: s.notikumi.map((n) => ({
      ...n,
      balsojums: n.balsojums && {
        ...n.balsojums,
        saeima: 15,
        frakcijas: { JVF: balss, bez_frakcijas: balss, XYZ: balss, NAF: balss, SVF: balss },
      },
    })),
  };
  const h = lapa(s15, m15);
  assert.deepEqual(frakcijuRindas(h).map((x) => x.replace(/<abbr [^>]*>(\w+)<\/abbr>.*/, "$1")), ["SV", "NA", "JV", "XYZ", "Bez frakcijas"]);
  assert.deepEqual(frakcijuKodi(h), ["SVF", "NAF", "JVF", null, null]);
  assert.doesNotMatch(h, /Tās frakcijas nav tas pats/);
});

test("Frakciju balsojums 15. Saeimā: frakcija → Saraksts pēc data/saraksti.yaml `frakcija`", () => {
  // data/saraksti.yaml vēl nav `frakcija` vērtību — modelis ar izdomātiem kodiem tikai šim testam.
  const kodi = { jv: "JVF", na: "NAF" };
  const m15 = { ...m, saraksti: m.saraksti.map((sr) => ({ ...sr, frakcija: kodi[sr.slug] })) };
  const s = atrast("as-mun-likme-10-fiziskam-personam");
  const s15 = {
    ...s,
    notikumi: s.notikumi.map((n) => ({
      ...n,
      balsojums: n.balsojums && {
        ...n.balsojums,
        saeima: 15,
        frakcijas: {
          NAF: { par: 11, pret: 0, atturas: 0 },
          JVF: { par: 22, pret: 0, atturas: 0, nebalsoja: 1 },
          bez_frakcijas: { par: 0, pret: 3, atturas: 2 },
        },
      },
    })),
  };
  const h = lapa(s15, m15);
  assert.deepEqual(frakcijuRindas(h), [
    '<abbr title="Nacionālā apvienība &quot;Visu Latvijai!&quot;–&quot;Tēvzemei un Brīvībai/LNNK&quot;">NA</abbr> · Nacionālā apvienība',
    '<abbr title="Jaunā VIENOTĪBA">JV</abbr> · Jaunā VIENOTĪBA',
    "Bez frakcijas",
  ]);
  assert.doesNotMatch(h, /Tās frakcijas nav tas pats/);
});

test("saites uz filtrētu pārskatu: Saraksts ceļā, Atbildīgais un Tēma joslā — arī papildu", () => {
  const h = lapa(atrast("as-majoklu-garantijas-regionos"));
  assert.match(h, /<nav class="cels"[^>]*><a href="\/">Solījumi<\/a> <span aria-hidden="true">›<\/span> <a href="\/\?saraksts=as"><abbr [^>]*>AS<\/abbr> · Apvienotais saraksts<\/a><\/nav>/);
  assert.match(h, /<a href="\/\?atbildigais=em">Ekonomikas ministrija<\/a>/);
  assert.match(h, /Arī: <a href="\/\?atbildigais=varam">Viedās administrācijas un reģionālās attīstības ministrija<\/a>/);
  assert.match(h, /<a href="\/\?tema=majokli">Mājokļi<\/a>/);
  assert.match(h, /arī <a href="\/\?tema=regioni-un-pasvaldibas">Reģioni un pašvaldības<\/a>/);
});

test("saites uz filtrētu pārskatu: vairākas papildu iestādes atdalītas ar komatu", () => {
  const s = atrast("as-majoklu-garantijas-regionos");
  const h = lapa({ ...s, papildu_iestades: m.iestades.filter((i) => i.slug === "varam" || i.slug === "fm") });
  assert.match(h, /Arī: <a href="\/\?atbildigais=fm">[^<]+<\/a>, <a href="\/\?atbildigais=varam">/);
});

test("citi saraksti tēmā: „Visi … solījumi šajā tēmā” ved uz pārskatu ar Sarakstu un Tēmu", () => {
  // Fixtures nevienam Sarakstam nav vairāk par 3 solījumiem vienā tēmā — ceturto pieliek tikai šim testam.
  const as = m.solijumi.filter((x) => x.saraksts.slug === "as" && x.tema.slug === "nodokli-un-budzets");
  assert.equal(as.length, 3);
  const m4 = { ...m, solijumi: [...m.solijumi, { ...as[0], id: "as-papildu-tests" }] };
  const h = lapa(atrast("jv-parads-zem-55-no-ikp"), m4);
  assert.match(h, /<a href="\/\?saraksts=as&amp;tema=nodokli-un-budzets">Visi AS solījumi šajā tēmā \(4\)<\/a>/);
});
