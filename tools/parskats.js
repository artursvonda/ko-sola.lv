// npm run parskats -- <saraksts> ["<CVK nodaļa>" | "Ārpus CVK nodaļām"] [--kopsavilkums <fails>] [--bazes-zars <zars>]
// → parskats/<saraksts>[-<nodaļa>].html: avots blakus Solījumiem, pārklājums, citātu pārbaude, atsauksmes.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { lasitYaml, solijumuFaili, avotuLasitajs, SOLIJUMI } from "./lib/dati.js";
import { atrastCitatu } from "./lib/avots.js";
import { parbaudit } from "./lib/parbaudit.js";

export const ARPUS_CVK = "Ārpus CVK nodaļām";

const { values: opc, positionals } = parseArgs({
  allowPositionals: true,
  options: { kopsavilkums: { type: "string" }, "bazes-zars": { type: "string", default: "origin/main" } },
});
const [slug, nodala] = positionals;
const sakne = process.cwd();
const saraksts = lasitYaml(sakne, "data/saraksti.yaml").find((s) => s.slug === slug);
if (!saraksts) {
  console.error(`Lietošana: npm run parskats -- <saraksts> ["<CVK nodaļa>" | "${ARPUS_CVK}"]`);
  process.exit(2);
}
const cvk = saraksts.avoti.find((a) => a.veids === "cvk");
if (nodala && nodala !== ARPUS_CVK && !cvk.nodalas?.includes(nodala)) {
  console.error(`Nodaļa "${nodala}" nav ${slug} CVK nodaļās:\n  ${cvk.nodalas.join("\n  ")}\n  ${ARPUS_CVK}`);
  process.exit(2);
}

// Kura avota vienība ietilpst šajā izpildē (§0 metode.md).
function tverums(a, u) {
  if (!nodala) return true;
  if (a.veids === "cvk") return nodala !== ARPUS_CVK && u.nodala === nodala;
  const kartesana = a.atbilst_cvk ?? {};
  if (nodala === ARPUS_CVK) return u.nodala !== null && !(u.nodala in kartesana);
  return kartesana[u.nodala] === nodala;
}

const lasit = avotuLasitajs(sakne);
const sol = solijumuFaili(sakne)
  .filter((f) => f.saraksts === slug)
  .map((f) => {
    try {
      return lasitYaml(sakne, f.cels);
    } catch {
      return null; // YAML kļūdu rāda kļūdu sarakstā
    }
  })
  .filter((s) => s?.id && Array.isArray(s.avoti));

const avoti = saraksts.avoti
  .map((a) => ({ a, t: lasit(a) }))
  .filter(({ t }) => t)
  .map(({ a, t }) => {
    const vienibas = t.vienibas.map((u) => ({ ...u, ids: [], q: [] }));
    for (const s of sol)
      for (const c of s.avoti.filter((x) => x.veids === a.veids))
        for (const v of atrastCitatu(t, c.citats))
          for (const u of vienibas)
            if (u.sakums < v.beigas && v.sakums < u.beigas) {
              if (!u.ids.includes(s.id)) u.ids.push(s.id);
              u.q.push([Math.max(v.sakums, u.sakums) - u.sakums, Math.min(v.beigas, u.beigas) - u.sakums, s.id]);
            }
    const redzamas = vienibas.filter((u) => tverums(a, u));
    return {
      virsraksts: a.veids === "cvk" ? "CVK programma" : `Paplašinātā programma · ${a.url}`,
      vienibas: redzamas.map(({ k, t, ids, q, navJaizraksta }) => ({ k, t, ids, q, pelecs: navJaizraksta })),
    };
  });

function mainitiZara() {
  const mape = `${SOLIJUMI}/${slug}`;
  const git = (...a) => execFileSync("git", a, { cwd: sakne, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const faili = new Set();
  try {
    git("diff", "--name-only", `${opc["bazes-zars"]}...HEAD`, "--", mape).split("\n").forEach((f) => faili.add(f));
  } catch {
    console.warn(`(nevarēja salīdzināt ar ${opc["bazes-zars"]}; "Šajā zarā" rāda tikai necommitotās izmaiņas)`);
  }
  try {
    git("status", "--porcelain", "--untracked-files=all", "--", mape)
      .split("\n")
      .forEach((r) => faili.add(r.slice(3)));
  } catch {}
  return [...faili].filter((f) => f.endsWith(".yaml")).map((f) => f.split("/").at(-1).replace(/\.yaml$/, ""));
}

const redzamieIds = new Set(avoti.flatMap((a) => a.vienibas.flatMap((u) => u.ids)));
const zara = new Set(mainitiZara());
const kludas = parbaudit(sakne)
  .filter((k) => k.fails.startsWith(`${SOLIJUMI}/${slug}/`) || k.fails === "data/saraksti.yaml")
  .map((k) => `${k.fails}: ${k.zinojums}`);

const dati = {
  title: `${saraksts.isais_nosaukums} · ${nodala ?? "visas nodaļas"}`,
  prefikss: `${slug}-`,
  sol: sol.filter((s) => redzamieIds.has(s.id) || zara.has(s.id)).map((s) => ({ ...s, zara: zara.has(s.id) })),
  avoti,
  kludas,
  summary: opc.kopsavilkums && existsSync(opc.kopsavilkums) ? readFileSync(opc.kopsavilkums, "utf8") : "",
};

const tpl = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "parskats.tpl.html"), "utf8");
const vards = nodala ? `${slug}-${nodala.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` : slug;
const izeja = join(sakne, "parskats", `${vards}.html`);
mkdirSync(dirname(izeja), { recursive: true });
writeFileSync(izeja, tpl.replace("/*DATI*/null", JSON.stringify(dati).replace(/</g, "\\u003c")));
console.log(`${dati.sol.length} Solījumi (${zara.size} šajā zarā), ${kludas.length} kļūdas → ${izeja}`);
