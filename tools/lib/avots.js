// Avota teksts (sources/**/*.md) → vienības (virsraksti, teikumi, punkti) ar nodaļu un sadaļu,
// lai pārbaudītu citātu burtiskumu un pārskatā rādītu pārklājumu.

export const norm = (s) => s.replace(/\s+/g, " ").trim();

const PUNKTS = /^[•*-]\s+/;
// Domuzīme sāk punktu tikai rindkopas sākumā; citur tā ir PDF rindas pārnesums.
const DOMUZIMES_PUNKTS = /^–\s+/;
const MD_VIRSRAKSTS = /^(#{1,6})\s+(.*)$/;
const TEIKUMA_ROBEZA = /(?<=[.!?])\s+(?=\p{Lu})/u;

function bezFrontmatter(teksts) {
  const m = teksts.match(/^---\n[\s\S]*?\n---\n/);
  return m ? teksts.slice(m[0].length) : teksts;
}

// Rindkopas: tukša rinda vai jauns punkts sāk jaunu; citas rindas turpina iepriekšējo.
function rindkopas(teksts) {
  const out = [];
  let cur = null;
  const flush = () => {
    if (cur) out.push({ ...cur, t: norm(cur.t) });
    cur = null;
  };
  for (const rinda of bezFrontmatter(teksts).split("\n")) {
    const s = rinda.trim();
    if (!s) {
      flush();
      continue;
    }
    const md = s.match(MD_VIRSRAKSTS);
    if (md) {
      flush();
      out.push({ k: "md", limenis: md[1].length, t: norm(md[2]) });
      continue;
    }
    const punkts = s.match(PUNKTS) ?? (cur ? null : s.match(DOMUZIMES_PUNKTS));
    if (punkts) {
      flush();
      cur = { k: "b", t: s.slice(punkts[0].length) };
      continue;
    }
    if (cur) cur.t += " " + s;
    else cur = { k: "p", t: s };
  }
  flush();
  return out;
}

// Īsa rindkopa bez beigu pieturzīmes — apakšsadaļas virsraksts (piem., "Militārā aizsardzība").
const irSadalasVirsraksts = (t) => t.length < 100 && !/[.!?:;,]$/.test(t);

/**
 * @param {string} teksts avota faila saturs
 * @param {object} cfg avota konfigurācija no data/saraksti.yaml:
 *   nodalas — nodaļu virsraksti (rindkopa = virsraksts vai sākas ar "virsraksts ");
 *   neizrakstit — virsraksti, kas sāk tekstu ārpus nodaļām (piem., noslēgums);
 *   izlaist — sadaļas, kas nav šī avota teksts (citātus tajās neskaita);
 *   nav_jaizraksta — sadaļas, kuras nav jāizraksta (pārskatā pelēkas).
 */
export function sadalitAvotu(teksts, cfg = {}) {
  const nodalas = cfg.nodalas ?? [];
  const neizrakstit = cfg.neizrakstit ?? [];
  const izlaist = new Set(cfg.izlaist ?? []);
  const navJaizraksta = new Set(cfg.nav_jaizraksta ?? []);

  const vienibas = [];
  let nodala = null;
  let sadalas = [];
  let pilns = "";
  const pievienot = (k, t) => {
    if (!t) return;
    if (pilns) pilns += " ";
    const atzimes = [nodala, ...sadalas];
    vienibas.push({
      k,
      t,
      nodala,
      sadalas: [...sadalas],
      sakums: pilns.length,
      beigas: pilns.length + t.length,
      izlaists: atzimes.some((a) => izlaist.has(a)),
      navJaizraksta: atzimes.some((a) => navJaizraksta.has(a) || izlaist.has(a)),
    });
    pilns += t;
  };
  // Virsraksta garums rindkopas sākumā: "V", "V." vai "V. teksts…" / "V teksts…"; 0, ja nesakrīt.
  const virsraksts = (t, v) =>
    t === v || t.startsWith(v + " ") ? v.length : t === v + "." || t.startsWith(v + ". ") ? v.length + 1 : 0;

  for (const r of rindkopas(teksts)) {
    if (r.k === "md") {
      if (r.limenis === 1) {
        nodala = r.t;
        sadalas = [];
      } else {
        sadalas = [...sadalas.slice(0, r.limenis - 2), r.t];
      }
      pievienot("h", r.t);
      continue;
    }
    if (r.k === "p") {
      const v = nodalas.find((n) => virsraksts(r.t, n));
      const arpus = v ? null : neizrakstit.find((n) => virsraksts(r.t, n));
      if (v || arpus) {
        const garums = virsraksts(r.t, v ?? arpus);
        nodala = v ?? null;
        sadalas = [];
        pievienot("h", r.t.slice(0, garums));
        r.t = r.t.slice(garums).trim();
        if (!r.t) continue;
      } else if (irSadalasVirsraksts(r.t)) {
        sadalas = [r.t];
        pievienot("h", r.t);
        continue;
      }
    }
    if (r.k === "b") pievienot("b", r.t);
    else for (const s of r.t.split(TEIKUMA_ROBEZA)) pievienot("s", s);
  }
  return { vienibas, pilns };
}

/** Visas citāta vietas avotā (pēc atstarpju normalizācijas), izņemot `izlaist` sadaļas. */
export function atrastCitatu(avots, citats) {
  const c = norm(citats);
  const vietas = [];
  if (!c) return vietas;
  for (let i = avots.pilns.indexOf(c); i >= 0; i = avots.pilns.indexOf(c, i + 1)) {
    const v = avots.vienibas.find((u) => u.sakums <= i && i < u.beigas);
    if (!v || v.izlaists) continue;
    vietas.push({ nodala: v.nodala, sadalas: v.sadalas, sakums: i, beigas: i + c.length });
  }
  return vietas;
}
