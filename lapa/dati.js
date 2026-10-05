// Lapas datu modelis: data/*.yaml + Solījumi un Notikumi, ar atvasinātu Statusu un Amatpersonu.
// Solījumus un Notikumus var ņemt no citas saknes (KO_DATI=fixtures izstrādei), pārējo — vienmēr no data/.
import { lasitYaml, solijumuFaili, notikumuFaili } from "../tools/lib/dati.js";

export const STATUSI = {
  "nav-vertets": "Nav vērtēts",
  procesa: "Procesā",
  izpildits: "Izpildīts",
  "daleji-izpildits": "Daļēji izpildīts",
  "nav-izpildits": "Nav izpildīts",
  neparbaudams: "Nepārbaudāms",
};

/** Pašreizējais Statuss: pēdējā Statusa maiņa; bez tām — Nav vērtēts; Nepārbaudāmam — neparbaudams. */
export function statuss(s) {
  if (!s.parbaudams) return "neparbaudams";
  return s.statusa_mainas?.at(-1)?.statuss ?? "nav-vertets";
}

/** Amatpersona, kas datumā `d` (YYYY-MM-DD) vada iestādi; null, ja neviena. */
export function amatpersona(iestade, d) {
  return iestade.amatpersonas.find((a) => a.no <= d && (!a.lidz || d <= a.lidz)) ?? null;
}

/** Skaits pa Statusiem; `n` — Pārbaudāmie (Nepārbaudāmie N neiekļauti). */
export function progress(solijumi) {
  const skaits = Object.fromEntries(Object.keys(STATUSI).map((k) => [k, 0]));
  for (const s of solijumi) skaits[s.statuss]++;
  return { n: solijumi.length - skaits.neparbaudams, skaits };
}

export function ieladetModeli({ sakne, datuSakne = sakne, sodien = new Date().toISOString().slice(0, 10) }) {
  const saraksti = lasitYaml(sakne, "data/saraksti.yaml").sort((a, b) => a.nr - b.nr);
  const temas = lasitYaml(sakne, "data/temas.yaml");
  const iestades = lasitYaml(sakne, "data/iestades.yaml");
  const sarakstsPec = new Map(saraksti.map((s) => [s.slug, s]));
  const temaPec = new Map(temas.map((t) => [t.slug, t]));
  const iestadePec = new Map(iestades.map((i) => [i.slug, i]));

  const notikumi = notikumuFaili(datuSakne)
    .map((f) => lasitYaml(datuSakne, f.cels))
    .sort((a, b) => a.datums.localeCompare(b.datums));
  const notikumsPec = new Map(notikumi.map((n) => [n.id, n]));

  const solijumi = solijumuFaili(datuSakne).map((f) => {
    const s = lasitYaml(datuSakne, f.cels);
    const iestade = iestadePec.get(s.iestades.galvena);
    const ap = amatpersona(iestade, sodien);
    return {
      ...s,
      statuss: statuss(s),
      saraksts: sarakstsPec.get(s.saraksts),
      tema: temaPec.get(s.temas.galvena),
      papildu_temas: (s.temas.papildu ?? []).map((t) => temaPec.get(t)),
      iestade,
      papildu_iestades: (s.iestades.papildu ?? []).map((i) => iestadePec.get(i)),
      amatpersona: ap && { ...ap, saraksts: ap.saraksts && sarakstsPec.get(ap.saraksts) },
      avoti: s.avoti.map((a) => ({ ...a, url: sarakstsPec.get(s.saraksts).avoti.find((x) => x.veids === a.veids)?.url })),
      notikumi: notikumi.flatMap((n) =>
        n.solijumi.filter((x) => x.id === s.id).map((x) => ({ ...n, virziens: x.virziens, pamatojums: x.pamatojums })),
      ),
      statusa_mainas: (s.statusa_mainas ?? []).map((m) => ({ ...m, notikumi: m.notikumi.map((id) => notikumsPec.get(id)) })),
    };
  });
  solijumi.sort((a, b) => a.saraksts.nr - b.saraksts.nr || a.id.localeCompare(b.id));

  return { saraksti, temas, iestades, solijumi, notikumi, sodien };
}
