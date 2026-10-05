// Query parametri (location.search) bez DOM: kopīgi pārskata filtriem un Salīdzinājuma tēmai.

/** Parametra vērtība; trūkstošs vai tukšs — null. Ar `derigas` (Set) nezināmu vērtību (piem., novecojusi saite) neņem vērā. */
export function nolasitParametru(meklesana, nosaukums, derigas) {
  const v = new URLSearchParams(meklesana).get(nosaukums) || null;
  return v && derigas && !derigas.has(v) ? null : v;
}
