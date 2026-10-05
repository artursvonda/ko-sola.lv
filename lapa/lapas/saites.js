// Kopīgās saites starp lapām. Pārskata filtri — query parametros (docs/lapa.md).

/** Filtrēts pārskats: `/?saraksts=jv&tema=aizsardziba` (tukšos izlaiž; secība saraksts, atbildigais, tema). */
export function parskatsSaite({ saraksts, atbildigais, tema } = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ saraksts, atbildigais, tema })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `/?${s}` : "/";
}
