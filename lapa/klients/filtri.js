// Pārskata filtri bez DOM: query parsēšana, atbilstība, skaiti pa grupām un progress.
// Lieto gan serveris (sākotnējais HTML), gan <ko-parskats> (pārrēķins pēc filtra maiņas).
import { parskatsSaite } from "../lapas/saites.js";
import { nolasitParametru } from "./parametri.js";

/** Statusi pārskata leģendas secībā (B1): no izpildītā uz nevērtēto. */
export const STATUSU_SECIBA = ["izpildits", "daleji-izpildits", "procesa", "nav-izpildits", "nav-vertets", "neparbaudams"];

/** Filtru grupas = query parametri `/` lapā (pa vienai vērtībai: slug no data/*.yaml). */
export const GRUPAS = ["saraksts", "atbildigais", "tema"];

/** Bez filtriem: katra grupa — „Visi”. */
export const BEZ_FILTRIEM = Object.freeze(Object.fromEntries(GRUPAS.map((g) => [g, null])));

/** Grupa (query parametrs) → ieraksta lauks. Parametrs „atbildigais” (lasītāja vārds) filtrē Atbildīgās iestādes. */
const LAUKS = { saraksts: "saraksts", atbildigais: "iestades", tema: "tema" };

/**
 * `location.search` → { saraksts, atbildigais, tema }; trūkstošs vai tukšs — null.
 * Ar `derigas` ({ grupa: Set }) nezināmu vērtību (piem., novecojusi saite) neņem vērā.
 */
export function nolasitFiltrus(meklesana, derigas) {
  return Object.fromEntries(GRUPAS.map((g) => [g, nolasitParametru(meklesana, g, derigas?.[g])]));
}

const vertibas = (ieraksts, grupa) => [].concat(ieraksts[LAUKS[grupa]]);

/** Ieraksts → data-* atribūtu vērtības tabulas rindai (vairākas vērtības — atdalītas ar atstarpi, galvenā pirmā). */
export const datuAtributi = (ieraksts) => ({
  saraksts: ieraksts.saraksts,
  iestades: ieraksts.iestades.join(" "),
  tema: ieraksts.tema.join(" "),
  statuss: ieraksts.statuss,
});

/** Rindas `dataset` → ieraksts (pretējais datuAtributi). */
export const ierakstsNoDatiem = (d) => ({
  saraksts: d.saraksts,
  iestades: d.iestades.split(" "),
  tema: d.tema.split(" "),
  statuss: d.statuss,
});

/**
 * Vai ieraksts atbilst filtriem. Ieraksts: { saraksts, iestades: [galvenā, ...papildu], tema: [galvenā, ...papildu], statuss }.
 * Papildu Tēma un papildu iestāde atbilst tāpat kā galvenā (GLOSSARY: ietekmē filtrēšanu). `izlaist` — grupa, ko neņem vērā.
 */
export function atbilst(ieraksts, filtri, izlaist = null) {
  return GRUPAS.every((g) => g === izlaist || !filtri[g] || vertibas(ieraksts, g).includes(filtri[g]));
}

/**
 * Skaits blakus katrai filtra izvēlei: grupa ņem vērā pārējo grupu filtrus, ne savu.
 * Skaita pēc galvenās vērtības (papildu ietekmē tikai filtrēšanu, ne skaitīšanu); "" — „Visi”.
 */
export function skaiti(ieraksti, filtri) {
  return Object.fromEntries(
    GRUPAS.map((g) => {
      const skaits = { "": 0 };
      for (const ieraksts of ieraksti) {
        if (!atbilst(ieraksts, filtri, g)) continue;
        const galvena = vertibas(ieraksts, g)[0];
        skaits[""]++;
        skaits[galvena] = (skaits[galvena] ?? 0) + 1;
      }
      return [g, skaits];
    }),
  );
}

/** Saite uz izvēli grupā (null — „Visi”), pārējo grupu filtrus saglabājot. */
export const izvelesSaite = (filtri, grupa, vertiba) => parskatsSaite({ ...filtri, [grupa]: vertiba });

/** „X no N izpildīti”: N — bez Nepārbaudāmajiem; `skaits` pa Statusiem STATUSU_SECIBA secībā. */
export function progress(ieraksti) {
  const skaits = Object.fromEntries(STATUSU_SECIBA.map((k) => [k, 0]));
  for (const ieraksts of ieraksti) skaits[ieraksts.statuss]++;
  return { izpilditi: skaits.izpildits, n: ieraksti.length - skaits.neparbaudams, neparbaudami: skaits.neparbaudams, skaits };
}
