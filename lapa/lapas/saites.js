// Saites uz filtrētu pārskatu (`/`). Parametru vārdi un vērtības (slug no data/*.yaml) — kopīgi ar pārskata filtriem.

/** `/?saraksts=<slug>&atbildigais=<iestādes slug>&tema=<slug>`; tukšos izlaiž, secība nemainīga. */
export function parskatsSaite({ saraksts, atbildigais, tema } = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ saraksts, atbildigais, tema })) if (v) p.set(k, v);
  const q = p.toString();
  return q ? `/?${q}` : "/";
}
