import { test } from "node:test";
import assert from "node:assert/strict";
import { sadalitAvotu, atrastCitatu } from "../lib/avots.js";

const CVK = `---
url: https://example.lv
---

Ievada teikums. Mēs gribam labu valsti.

1. Drošība

Nodrošināsim aizsardzības finansējumu 5% no IKP un attīstīsim
NATO klātbūtni. Stiprināsim robežu.

2. Finanses

Celsim minimālo algu līdz 50%.
`;

test("citātu atrod nodaļā, arī pāri rindu pārnesumam", () => {
  const avots = sadalitAvotu(CVK, { nodalas: ["1. Drošība", "2. Finanses"] });
  const vietas = atrastCitatu(avots, "attīstīsim NATO klātbūtni");
  assert.deepEqual(vietas.map((v) => v.nodala), ["1. Drošība"]);
});

test("nodaļas virsraksts rindkopas sākumā (PRO stils) — pārējā rindkopa pieder nodaļai", () => {
  const avots = sadalitAvotu("EKONOMIKA. Valstij jāatbalsta nozares.\n\n1. Noteiksim prioritāros sektorus.\n", {
    nodalas: ["EKONOMIKA"],
  });
  assert.deepEqual(atrastCitatu(avots, "Valstij jāatbalsta nozares.").map((v) => v.nodala), ["EKONOMIKA"]);
  assert.deepEqual(avots.vienibas[0], { ...avots.vienibas[0], k: "h", t: "EKONOMIKA." });
});

test("teksts pirms pirmās nodaļas un pēc `neizrakstit` virsraksta ir ārpus nodaļām", () => {
  const avots = sadalitAvotu(CVK + "\nMŪSU REDZĒJUMS\n\nMēs varam.\n", {
    nodalas: ["1. Drošība", "2. Finanses"],
    neizrakstit: ["MŪSU REDZĒJUMS"],
  });
  assert.equal(atrastCitatu(avots, "Ievada teikums.")[0].nodala, null);
  assert.equal(atrastCitatu(avots, "Mēs varam.")[0].nodala, null);
  assert.equal(atrastCitatu(avots, "Celsim minimālo algu")[0].nodala, "2. Finanses");
});

const PAP = `# 1. Drošība un aizsardzība

## 10 000 zīmju programmas apsolījums

Nodrošināsim aizsardzības finansējumu 5% no IKP.

## Apņemšanās un uzdevumi

• Stiprināsim valsts aizsardzības spējas, ik gadu ieguldot
aizsardzībā 5% no IKP
- Nodrošināsim aizsardzības finansējumu 5% no IKP.
`;

test("Markdown virsraksti: # = nodaļa, ## = sadaļa; punkti pāri rindām", () => {
  const avots = sadalitAvotu(PAP);
  const [v] = atrastCitatu(avots, "ik gadu ieguldot aizsardzībā 5% no IKP");
  assert.equal(v.nodala, "1. Drošība un aizsardzība");
  assert.deepEqual(v.sadalas, ["Apņemšanās un uzdevumi"]);
});

test("`izlaist` sadaļā (CVK kopija paplašinātajā) citātu neskaita", () => {
  const avots = sadalitAvotu(PAP, { izlaist: ["10 000 zīmju programmas apsolījums"] });
  const vietas = atrastCitatu(avots, "Nodrošināsim aizsardzības finansējumu 5% no IKP.");
  assert.deepEqual(vietas.map((v) => v.sadalas[0]), ["Apņemšanās un uzdevumi"]);
  assert.deepEqual(atrastCitatu(sadalitAvotu(PAP, { izlaist: ["1. Drošība un aizsardzība"] }), "5% no IKP"), []);
});

test("citāts nav avotā, ja atšķiras kaut viena zīme", () => {
  const avots = sadalitAvotu(CVK, { nodalas: ["1. Drošība"] });
  assert.deepEqual(atrastCitatu(avots, "Celsim minimālo algu līdz 55%"), []);
});

test("rinda, kas sākas ar domuzīmi, turpina punktu (PDF rindu pārnesums)", () => {
  const avots = sadalitAvotu("• Ieviesīsim piemaksu speciālistiem\n– policistiem un pedagogiem – , garantējot\npieejamību\n");
  assert.equal(avots.vienibas.length, 1);
  assert.equal(atrastCitatu(avots, "speciālistiem – policistiem un pedagogiem").length, 1);
});
