// npm run --silent balsojums -- <YYYY-MM-DD> [meklējums] [--visi]
// → Notikuma `balsojums` YAML no Saeimas sēžu atvērtajiem datiem (data.gov.lv `saeimas-sedes`).
// meklējums: VOTING_ID vai teksta daļa no balsojuma motīva (piem., "1065/Lp14").
// Procedūras balsojumus (priekšlikumi, steidzamība) izlaiž, ja nav --visi vai VOTING_ID.
// Bez meklējuma vai ar vairākiem atbilstošiem — saraksts; YAML tikai, ja atbilst tieši viens.
import { parseArgs } from "node:util";
import { Document } from "yaml";
import { parsetBalsojumus, saeimaNoNosaukuma } from "./lib/balsojums.js";

const DATU_KOPA = "https://data.gov.lv/dati/api/3/action/package_show?id=saeimas-sedes";
const UA = { "User-Agent": "ko-sola.lv (+https://github.com/artursvonda/ko-sola.lv)" };
// Fails parādās dažas dienas pēc sēdes; logs ar rezervi.
const LOGS_DIENAS = 30;

const PROCEDURA = /^Par (priekšlikumu|likumprojekta atzīšanu par steidzamu)\b/;

const { values: opc, positionals } = parseArgs({ allowPositionals: true, options: { visi: { type: "boolean" } } });
const [datums, meklejums = ""] = positionals;
if (!/^\d{4}-\d{2}-\d{2}$/.test(datums ?? "")) {
  console.error("Lietošana: npm run --silent balsojums -- <YYYY-MM-DD> [VOTING_ID | motīva daļa] [--visi]");
  process.exit(2);
}

async function lejupieladet(url, veids) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return veids === "json" ? r.json() : r.text();
}

const lidz = new Date(Date.parse(datums) + LOGS_DIENAS * 864e5).toISOString().slice(0, 10);
const { result } = await lejupieladet(DATU_KOPA, "json");
const faili = result.resources
  .filter((r) => r.name.endsWith("-vote") && r.created.slice(0, 10) >= datums && r.created.slice(0, 10) <= lidz)
  .sort((a, b) => (a.created < b.created ? -1 : 1));

const q = meklejums.toLowerCase();
const pecId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meklejums);
const atrasti = [];
for (const f of faili) {
  const saeima = saeimaNoNosaukuma(f.name);
  for (const b of parsetBalsojumus(await lejupieladet(f.url))) {
    if (b.laiks.slice(0, 10) !== datums) continue;
    if (pecId ? b.id !== meklejums : !b.motivs.toLowerCase().includes(q)) continue;
    if (!pecId && !opc.visi && PROCEDURA.test(b.motivs)) continue;
    atrasti.push({ saeima, ...b, datu_avots: f.url });
  }
}

atrasti.sort((a, b) => (a.laiks < b.laiks ? -1 : 1));
if (atrasti.length === 1) {
  const { saeima, id, laiks, motivs, datu_avots, kopa, frakcijas, komentars } = atrasti[0];
  const balsojums = { saeima, id, laiks, motivs, datu_avots, kopa, frakcijas, ...(komentars && { komentars }) };
  const doc = new Document({ balsojums });
  const b = doc.get("balsojums");
  b.get("kopa").flow = true;
  for (const { value } of b.get("frakcijas").items) value.flow = true;
  process.stdout.write(doc.toString({ lineWidth: 0 }));
} else {
  console.error(
    atrasti.length
      ? `${atrasti.length} balsojumi — precizē ar VOTING_ID vai garāku motīva daļu:`
      : `Nav balsojumu ${datums}${q ? ` ar "${meklejums}"` : ""} (${faili.length} faili ${datums}…${lidz}).`,
  );
  for (const b of atrasti) console.error(`  ${b.id}  ${b.laiks.slice(11)}  ${b.kopa.par}/${b.kopa.pret}/${b.kopa.atturas}  ${b.motivs}`);
  process.exit(1);
}
