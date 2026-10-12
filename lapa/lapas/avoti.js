// Saraksta izmantotie avoti lasītājam — no data/saraksti.yaml (pārskata avotu rinda, Salīdzinājums, Metodoloģija).

/** Viens avots: „CVK programma” / „paplašinātā programma” / „tematiska paplašinātā programma (<tēma>)”. */
export function avotaNosaukums(a) {
  if (a.veids === "cvk") return "CVK programma";
  return a.tematiska ? `tematiska paplašinātā programma (${a.tematiska})` : "paplašinātā programma";
}

/** Visi Saraksta avoti, piem., „CVK programma + paplašinātā programma”. */
export const avotuApraksts = (saraksts) => saraksts.avoti.map(avotaNosaukums).join(" + ");

const saisinajumi = (xi) => xi.map((s) => s.saisinajums).join(xi.length === 2 ? " un " : ", ");

/**
 * Viena rinda lasītājam par avotu asimetriju, piem., „visiem sarakstiem ir CVK programma (līdz 10 000 zīmēm),
 * JV un PRO — arī paplašinātā, LPV — arī tematiska (ekonomika)”.
 */
export function avotuAsimetrija(saraksti) {
  const ar = (f) => saraksti.filter((s) => s.avoti.some((a) => a.veids === "paplasinata" && f(a)));
  const pilna = ar((a) => !a.tematiska);
  const tematiskas = Map.groupBy(ar((a) => a.tematiska), (s) => s.avoti.find((a) => a.tematiska).tematiska);
  return [
    "visiem sarakstiem ir CVK programma (līdz 10 000 zīmēm)",
    ...(pilna.length ? [`${saisinajumi(pilna)} — arī paplašinātā`] : []),
    ...[...tematiskas].map(([tema, xi]) => `${saisinajumi(xi)} — arī tematiska (${tema})`),
  ].join(", ");
}
