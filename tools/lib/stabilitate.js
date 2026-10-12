// Publicēto ID stabilitāte (#105). Publicēts = `main` (Workers Builds to izvieto ko-sola.lv).
// Salīdzina iepriekšējo stāvokli (git ref) ar darba koku: Solījuma ID nepazūd, ja nav Pārvirzījuma
// (data/parvirzijumi.yaml); Saraksta un Tēmas slugi (filtru un salīdzinājuma URL) nepazūd vispār.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { lasitYaml, solijumuFaili, PARVIRZIJUMI, SOLIJUMI } from "./dati.js";

const SARAKSTI = "data/saraksti.yaml";
const TEMAS = "data/temas.yaml";

const git = (sakne, ...args) =>
  execFileSync("git", ["-C", sakne, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });

const slugi = (saraksts) => new Set((saraksts ?? []).map((x) => x.slug));

/** ID stāvoklī `ref`: { solijumi: Map<id, cels>, saraksti: Set, temas: Set }. Nezināms ref — izņēmums. */
export function idNoGit(sakne, ref) {
  const commit = git(sakne, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`).trim();
  const yaml = (cels) => {
    try {
      return parse(git(sakne, "show", `${commit}:${cels}`));
    } catch {
      return null;
    }
  };
  const solijumi = new Map(
    git(sakne, "ls-tree", "-r", "--name-only", commit, "--", SOLIJUMI)
      .split("\n")
      .filter((c) => c.endsWith(".yaml"))
      .map((c) => [c.split("/").at(-1).replace(/\.yaml$/, ""), c]),
  );
  return { solijumi, saraksti: slugi(yaml(SARAKSTI)), temas: slugi(yaml(TEMAS)) };
}

/** Tie paši ID darba kokā + Pārvirzījumi. */
export function idDarbaKoka(sakne) {
  const lasit = (cels) => (existsSync(join(sakne, cels)) ? lasitYaml(sakne, cels) : null);
  return {
    solijumi: new Map(solijumuFaili(sakne).map((f) => [f.vards, f.cels])),
    saraksti: slugi(lasit(SARAKSTI)),
    temas: slugi(lasit(TEMAS)),
    parvirzijumi: new Set((lasit(PARVIRZIJUMI) ?? []).map((p) => p.no)),
  };
}

/** @returns {{ fails: string, zinojums: string }[]} */
export function parbauditStabilitati(ieprieks, tagad) {
  const kludas = [];
  for (const [id, cels] of ieprieks.solijumi)
    if (!tagad.solijumi.has(id) && !tagad.parvirzijumi.has(id))
      kludas.push({ fails: cels, zinojums: `publicēts Solījums "${id}" pazudis — ID nemaina; ja tiešām jāaizstāj, pievienot ${PARVIRZIJUMI}` });
  for (const [lauks, cels, ko] of [["saraksti", SARAKSTI, "Saraksta"], ["temas", TEMAS, "Tēmas"]])
    for (const slug of ieprieks[lauks])
      if (!tagad[lauks].has(slug)) kludas.push({ fails: cels, zinojums: `publicēts ${ko} slugs "${slug}" pazudis — slugs pēc publicēšanas nemainās` });
  return kludas;
}
