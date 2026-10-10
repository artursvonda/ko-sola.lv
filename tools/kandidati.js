// npm run --silent kandidati -- [--no YYYY-MM-DD] [--lidz YYYY-MM-DD] [--bez-zariem]
// → JSON: Notikumu kandidāti no oficiālajiem avotiem (grafika režīms, /ai-parskats). Logs pēc noklusējuma —
// pēdējās 14 dienas, ne agrāk par Vērtēšanas perioda sākumu. Dublikāti (`jau_ir`) pret data/notikumi/
// un `notikums/*` zariem (atvērti vai noraidīti PR). Avoti un robots.txt: docs/statusi/notikumi.md.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { parsetBalsojumus } from "./lib/balsojums.js";
import { NOTIKUMI, VELESANU_DIENA, notikumuFaili } from "./lib/dati.js";
import { atzimetDublikatus, saeimasLemumi, saeimasLikumprojekti, tapProjekti, vestnesaLaidiens } from "./lib/kandidati.js";

const UA = { "User-Agent": "ko-sola.lv (+https://github.com/artursvonda/ko-sola.lv)" };
const LOGS_DIENAS = 14;
const LAWDATA = "https://www.saeima.lv/lawdata.json";
const SAEIMAS_SEDES = "https://data.gov.lv/dati/api/3/action/package_show?id=saeimas-sedes";
const TAP = "https://data.gov.lv/dati/api/3/action/package_show?id=tap-publicetie-tiesibu-akti";
const VESTNESIS = (d) => `https://www.vestnesis.lv/laidiens/${d.replaceAll("-", "/")}`;
const VESTNESIS_PAUZE_MS = 1500; // robots.txt Crawl-delay: 1

const { values: opc } = parseArgs({
  options: { no: { type: "string" }, lidz: { type: "string" }, "bez-zariem": { type: "boolean" } },
});
const diena = (ms) => new Date(ms).toISOString().slice(0, 10);
const lidz = opc.lidz ?? diena(Date.now());
const no = opc.no ?? [diena(Date.parse(lidz) - (LOGS_DIENAS - 1) * 864e5), VELESANU_DIENA].sort().at(-1);
if (![no, lidz].every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) || no > lidz) {
  console.error("Lietošana: npm run --silent kandidati -- [--no YYYY-MM-DD] [--lidz YYYY-MM-DD] [--bez-zariem]");
  process.exit(2);
}
const logs = { no, lidz };

async function lejupieladet(url, veids) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return veids === "json" ? r.json() : r.text();
}
const pauze = (ms) => new Promise((r) => setTimeout(r, ms));
const dienas = [];
for (let t = Date.parse(no); t <= Date.parse(lidz); t += 864e5) dienas.push(diena(t));

const avoti = [];
const kandidati = [];
/** Viena avota kļūda neaptur pārējos; tā redzama `avoti` un kopsavilkumā. */
async function avots(nosaukums, fn) {
  try {
    const piezime = await fn();
    avoti.push({ avots: nosaukums, ok: true, ...(piezime && { piezime }) });
  } catch (e) {
    avoti.push({ avots: nosaukums, ok: false, kluda: e.message });
  }
}

await avots("saeima.lv/lawdata.json", async () => {
  kandidati.push(...saeimasLikumprojekti(await lejupieladet(LAWDATA, "json"), logs));
});

await avots("data.gov.lv saeimas-sedes (lēmumi)", async () => {
  const { result } = await lejupieladet(SAEIMAS_SEDES, "json");
  // Fails parādās ~1 dienu pēc sēdes.
  const faili = result.resources.filter((r) => r.name.endsWith("-vote") && r.created.slice(0, 10) >= no);
  for (const f of faili) kandidati.push(...saeimasLemumi(parsetBalsojumus(await lejupieladet(f.url)), logs, f.url));
  return `${faili.length} balsojumu faili`;
});

await avots("data.gov.lv tap-publicetie-tiesibu-akti", async () => {
  const { result } = await lejupieladet(TAP, "json");
  const menesi = [...new Set(dienas.map((d) => d.slice(0, 7)))];
  const trukst = [];
  for (const m of menesi) {
    const f = result.resources.find((r) => r.url.includes(`legal_acts_${m}-01-`));
    if (!f) trukst.push(m);
    else kandidati.push(...tapProjekti(await lejupieladet(f.url, "json"), logs));
  }
  return trukst.length ? `nav mēneša faila: ${trukst.join(", ")} (MK projektus skati Vēstnesī / MK protokolos)` : undefined;
});

await avots("vestnesis.lv laidieni", async () => {
  let laidieni = 0;
  for (const [i, d] of dienas.entries()) {
    if (i) await pauze(VESTNESIS_PAUZE_MS);
    const akti = vestnesaLaidiens(await lejupieladet(VESTNESIS(d)), d);
    if (akti) (laidieni++, kandidati.push(...akti));
  }
  return `${laidieni} laidieni`;
});

// Esošie Notikumi: darba koks + `notikums/*` zari.
const notikumi = notikumuFaili(".").map((f) => {
  const teksts = readFileSync(f.cels, "utf8");
  return { vieta: f.cels, datums: String(parse(teksts)?.datums ?? ""), teksts };
});
if (!opc["bez-zariem"]) {
  const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    git("fetch", "--quiet", "--prune", "origin", "+refs/heads/notikums/*:refs/remotes/origin/notikums/*");
    for (const zars of git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/notikums/").split("\n").filter(Boolean)) {
      for (const cels of git("ls-tree", "--name-only", zars, `${NOTIKUMI}/`).split("\n").filter((c) => c.endsWith(".yaml"))) {
        const teksts = git("show", `${zars}:${cels}`);
        notikumi.push({ vieta: `${zars}:${cels}`, datums: String(parse(teksts)?.datums ?? ""), teksts });
      }
    }
  } catch (e) {
    avoti.push({ avots: "git notikums/* zari", ok: false, kluda: e.message.split("\n")[0] });
  }
}

const rezultats = atzimetDublikatus(kandidati, notikumi).sort((a, b) =>
  a.datums < b.datums ? -1 : a.datums > b.datums ? 1 : a.avots < b.avots ? -1 : a.avots > b.avots ? 1 : 0,
);
process.stdout.write(JSON.stringify({ logs, avoti, kandidati: rezultats }, null, 1) + "\n");
const jauIr = rezultats.filter((k) => k.jau_ir).length;
console.error(
  `${no}…${lidz}: ${rezultats.length} kandidāti (${jauIr} jau ir Notikumā); ` +
    avoti.map((a) => `${a.avots} ${a.ok ? "ok" : `KĻŪDA: ${a.kluda}`}${a.piezime ? ` (${a.piezime})` : ""}`).join("; "),
);
