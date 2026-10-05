// Saites uz filtrētu pārskatu (`/`) un Salīdzinājuma tēmu. Parametru vārdi un vērtības (slug no data/*.yaml) — kopīgi ar klienta filtriem.

/** `/?saraksts=<slug>&atbildigais=<iestādes slug>&tema=<slug>`; tukšos izlaiž, secība nemainīga. */
export function parskatsSaite({ saraksts, atbildigais, tema } = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ saraksts, atbildigais, tema })) if (v) p.set(k, v);
  const q = p.toString();
  return q ? `/?${q}` : "/";
}

/** Salīdzinājuma tēma: ?tema= (<ko-salidzinajums> rāda tikai to) + #enkurs (bez JS — visas tēmas statiskajā HTML, docs/lapa.md). */
export const temaSaite = (slug) => `/salidzinajums/?tema=${slug}#${slug}`;
