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

/** Publiskais repo: kods, dati, vēsture un kļūdu ziņojumi (GitHub issues). */
export const REPO = "https://github.com/artursvonda/ko-sola.lv";

/** Fails publiskajā repo (`main`), piem., `docs/statusi/vertesana.md`. */
export const repoFails = (cels) => `${REPO}/blob/main/${cels}`;

export const METODOLOGIJA = "/metodologija/";

/** Kļūdu ziņošanas veidne `.github/ISSUE_TEMPLATE/kluda-solijuma.yml`; Solījumam — ar ID virsrakstā un aizpildītu saiti. */
export function kludasSaite(solijums, saite = "https://ko-sola.lv") {
  const p = new URLSearchParams({ template: "kluda-solijuma.yml" });
  if (solijums) {
    p.set("title", `Kļūda: ${solijums.id}`);
    p.set("solijums", `${saite}/solijumi/${solijums.id}/`);
  }
  return `${REPO}/issues/new?${p}`;
}
