// Repo datu ielāde: data/*.yaml, Solījumi, Notikumi un avotu teksti (sources/).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { sadalitAvotu } from "./avots.js";

export const SOLIJUMI = "data/solijumi";
export const NOTIKUMI = "data/notikumi";
/** Galvenā iestāde, kamēr Atbildīgā iestāde nav noteikta (GLOSSARY.md "Neskaidra Atbildīgā iestāde"). */
export const NESKAIDRA_IESTADE = "neskaidrs";
/** Vērtēšanas perioda sākums (GLOSSARY.md): agrāks Notikums ir tikai konteksts, Statusu nemaina. */
export const VELESANU_DIENA = "2026-10-03";

export function lasitYaml(sakne, cels) {
  return parse(readFileSync(join(sakne, cels), "utf8"));
}

export function frontmatter(teksts) {
  const m = teksts.match(/^---\n([\s\S]*?)\n---\n/);
  return m ? parse(m[1]) : null;
}

/** Visi Solījumu faili: [{ cels, saraksts (mape), vards (bez .yaml) }]. */
export function solijumuFaili(sakne) {
  const dir = join(sakne, SOLIJUMI);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => {
      const dalas = f.split("/");
      return {
        cels: `${SOLIJUMI}/${f}`,
        saraksts: dalas.length === 2 ? dalas[0] : null,
        vards: dalas.at(-1).replace(/\.yaml$/, ""),
      };
    });
}

/** Visi Notikumu faili: [{ cels, vards (bez .yaml) }]. */
export function notikumuFaili(sakne) {
  const dir = join(sakne, NOTIKUMI);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => ({ cels: `${NOTIKUMI}/${f}`, vards: f.replace(/\.yaml$/, "") }));
}

/** Saraksta avota teksts, sadalīts vienībās (kešots pēc faila). */
export function avotuLasitajs(sakne) {
  const kesa = new Map();
  return (avots) => {
    if (!avots.fails) return null;
    if (!kesa.has(avots.fails)) {
      const cels = join(sakne, avots.fails);
      if (!existsSync(cels)) kesa.set(avots.fails, null);
      else {
        const teksts = readFileSync(cels, "utf8");
        kesa.set(avots.fails, { ...sadalitAvotu(teksts, avots), frontmatter: frontmatter(teksts) });
      }
    }
    return kesa.get(avots.fails);
  };
}
