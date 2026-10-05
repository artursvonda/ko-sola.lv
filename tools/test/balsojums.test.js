import { test } from "node:test";
import assert from "node:assert/strict";
import { parsetBalsojumus, saeimaNoNosaukuma } from "../lib/balsojums.js";

// Saīsināts data.gov.lv `saeimas-sedes` *-vote.xml (struktūra kā 14. Saeimas 2026. g. failos).
const votes = (b) => `<VOTES>
    <VOTEISHIDDEN>${b.hidden ?? 0}</VOTEISHIDDEN>
    <VOTEISCANDIDATE>0</VOTEISCANDIDATE>
    <FRACTION>${b.frakcijas}</FRACTION>
    <RESULT>${b.rezultati}</RESULT>
    <VOTETIMESTAMP>17.09.2026 10:02:12</VOTETIMESTAMP>
    <VOTEMOTIVE>${b.motivs}</VOTEMOTIVE>
    <VOTING_ID>${b.id}</VOTING_ID>
    <VOTERESULT_ABSTAIN>1</VOTERESULT_ABSTAIN>
    <VOTERESULT_AGAINST>1</VOTERESULT_AGAINST>
    <VOTERESULT_FOR>2</VOTERESULT_FOR>
    ${b.komentars ? `<VOTE_COMMENT>${b.komentars}</VOTE_COMMENT>` : "<VOTE_COMMENT />"}
  </VOTES>`;

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<DKroot>
  <DK_ID>x</DK_ID>
  ${votes({ id: "reg", frakcijas: "JV#NA", rezultati: "Reģistrējies#Nereģistrējies", motivs: "Reģistrācija" })}
  ${votes({
    id: "a1",
    frakcijas: "JV# #JV#NA#PRO",
    rezultati: "Par#Par#Pret#Atturas#Nebalsoja",
    motivs: "Grozījumi likumā &quot;Par nodokļiem&quot; (1065/Lp14), 3.lasījums",
    komentars: "Deputāte kļūdījusies balsojumā.",
  })}
  ${votes({ id: "slepens", hidden: 1, frakcijas: "", rezultati: "", motivs: "Aizklāts" })}
</DKroot>`;

test("balsojums: frakciju skaits no deputātu ierakstiem, reģistrācija un aizklātie izlaisti", () => {
  assert.deepEqual(parsetBalsojumus(XML), [
    {
      id: "a1",
      laiks: "2026-09-17T10:02:12",
      motivs: 'Grozījumi likumā "Par nodokļiem" (1065/Lp14), 3.lasījums',
      kopa: { par: 2, pret: 1, atturas: 1 },
      frakcijas: {
        JV: { par: 1, pret: 1, atturas: 0, nebalsoja: 0 },
        NA: { par: 0, pret: 0, atturas: 1, nebalsoja: 0 },
        PRO: { par: 0, pret: 0, atturas: 0, nebalsoja: 1 },
        bez_frakcijas: { par: 1, pret: 0, atturas: 0, nebalsoja: 0 },
      },
      komentars: "Deputāte kļūdījusies balsojumā.",
    },
  ]);
});

test("balsojums: tukšs fails (sēde bez balsojumiem)", () => {
  assert.deepEqual(parsetBalsojumus("<DKroot><DK_ID>x</DK_ID><DK_STATUS>8</DK_STATUS></DKroot>"), []);
});

test("Saeimas numurs no resursa nosaukuma", () => {
  assert.equal(saeimaNoNosaukuma("14.Saeimas 2026.gada rudens sesija-2-vote"), 14);
  assert.equal(saeimaNoNosaukuma("cits"), null);
});
