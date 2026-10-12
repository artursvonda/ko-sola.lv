// „Dati atjaunoti <datums>” kājenē: pēdējās datu izmaiņas commit datums no git build laikā.
import { execFileSync } from "node:child_process";

const git = (sakne, ...args) => execFileSync("git", ["-C", sakne, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * Pēdējā commit datums (YYYY-MM-DD), kas mainīja `cels` (piem., `data`); null, ja nav zināms.
 * Seklā klonā (CI var klonēt ar --depth) vēsture nepilna — vispirms mēģina to ielādēt; ja neizdodas, null:
 * robežas commit izskatās kā viss `data/` mainīts tajā, un datums būtu jaunāks par patieso.
 */
export function pedejaIzmaina(sakne, cels) {
  try {
    if (git(sakne, "rev-parse", "--is-shallow-repository") === "true") {
      try {
        git(sakne, "fetch", "--quiet", "--unshallow");
      } catch {
        return null;
      }
    }
    return git(sakne, "log", "-1", "--format=%cs", "--", cels) || null;
  } catch {
    return null;
  }
}
