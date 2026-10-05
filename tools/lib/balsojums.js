// Saeimas sēžu atvērtie dati (data.gov.lv `saeimas-sedes`, CC0): balsojumu XML → Notikuma `balsojums`.
// Fails "<N>.Saeimas <sesija>-<sēde>-vote": <VOTES> katram balsojumam; deputātu lauki atdalīti ar "#",
// FRACTION " " = deputāts bez frakcijas. Tukšs fails (tikai DK_ID) = sēdē nebija balsojumu.

const REZULTATI = { Par: "par", Pret: "pret", Atturas: "atturas", Nebalsoja: "nebalsoja" };
export const BEZ_FRAKCIJAS = "bez_frakcijas";

const ENTITIJAS = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const atkodet = (t) =>
  t.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(Number(e[1] === "x" ? `0${e.slice(1)}` : e.slice(1))) : (ENTITIJAS[e] ?? m),
  );

const lauks = (bloks, tags) => {
  const m = bloks.match(new RegExp(`<${tags}>([\\s\\S]*?)</${tags}>`));
  return m ? atkodet(m[1]).trim() : "";
};

/** "10.09.2026 15:33:30" → "2026-09-10T15:33:30" */
const laiks = (t) => t.replace(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}:\d{2}:\d{2})$/, "$3-$2-$1T$4");

/** Saeimas numurs no resursa nosaukuma ("14.Saeimas 2026.gada rudens sesija-2-vote" → 14). */
export const saeimaNoNosaukuma = (nosaukums) => Number(nosaukums.match(/^(\d+)\.\s*Saeimas/)?.[1]) || null;

/**
 * Visi atklātie deputātu balsojumi failā (bez reģistrācijas, aizklātajiem un kandidātu balsojumiem).
 * @returns {{ id, laiks, motivs, kopa, frakcijas, komentars? }[]}
 */
export function parsetBalsojumus(xml) {
  return xml
    .split("<VOTES>")
    .slice(1)
    .filter((b) => lauks(b, "VOTEISHIDDEN") !== "1" && lauks(b, "VOTEISCANDIDATE") !== "1")
    .map((b) => {
      const frakcijas = lauks(b, "FRACTION").split("#");
      const rezultati = lauks(b, "RESULT").split("#");
      if (frakcijas.length !== rezultati.length) throw new Error(`${lauks(b, "VOTING_ID")}: FRACTION/RESULT garums atšķiras`);
      if (rezultati.some((r) => !(r in REZULTATI))) return null; // reģistrācija u.c.
      const pecFrakcijas = {};
      rezultati.forEach((r, i) => {
        const kods = frakcijas[i].trim() || BEZ_FRAKCIJAS;
        pecFrakcijas[kods] ??= { par: 0, pret: 0, atturas: 0, nebalsoja: 0 };
        pecFrakcijas[kods][REZULTATI[r]]++;
      });
      const komentars = lauks(b, "VOTE_COMMENT");
      return {
        id: lauks(b, "VOTING_ID"),
        laiks: laiks(lauks(b, "VOTETIMESTAMP")),
        motivs: lauks(b, "VOTEMOTIVE"),
        kopa: {
          par: Number(lauks(b, "VOTERESULT_FOR")),
          pret: Number(lauks(b, "VOTERESULT_AGAINST")),
          atturas: Number(lauks(b, "VOTERESULT_ABSTAIN")),
        },
        frakcijas: Object.fromEntries(Object.entries(pecFrakcijas).sort(([a], [b]) => (a < b ? -1 : 1))),
        ...(komentars && { komentars }),
      };
    })
    .filter(Boolean);
}
