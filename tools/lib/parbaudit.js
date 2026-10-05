// Datu pārbaude (CI): shēmas, tēmu un iestāžu slugi, citātu burtiskums pret sources/,
// Notikumi un Statusa maiņas (docs/statusi/notikumi.md).
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { lasitYaml, solijumuFaili, notikumuFaili, avotuLasitajs } from "./dati.js";
import { atrastCitatu } from "./avots.js";

const SHEMAS = join(dirname(fileURLToPath(import.meta.url)), "../../schemas");
const ajv = new Ajv2020({ allErrors: true });
const shema = (vards) => ajv.compile(JSON.parse(readFileSync(join(SHEMAS, vards), "utf8")));
const validet = {
  saraksti: shema("saraksti.schema.json"),
  temas: shema("temas.schema.json"),
  solijums: shema("solijums.schema.json"),
  notikums: shema("notikums.schema.json"),
};

const VIETAS_ATDALITAJS = " › ";
const ID_VARDI_MAX = 6;
const BEZ_FRAKCIJAS = "bez_frakcijas";

/** @returns {{ fails: string, zinojums: string }[]} */
export function parbaudit(sakne) {
  const kludas = [];
  const k = (fails, zinojums) => kludas.push({ fails, zinojums });

  const ielasit = (cels, validators) => {
    if (!existsSync(join(sakne, cels))) {
      k(cels, "fails nav atrasts");
      return null;
    }
    let dati;
    try {
      dati = lasitYaml(sakne, cels);
    } catch (e) {
      k(cels, `YAML kļūda: ${e.message.split("\n")[0]}`);
      return null;
    }
    if (validators && !validators(dati)) {
      for (const e of validators.errors) k(cels, `shēma: ${e.instancePath || "/"} ${e.message}`);
      return null;
    }
    return dati;
  };

  const temas = ielasit("data/temas.yaml", validet.temas) ?? [];
  const saraksti = ielasit("data/saraksti.yaml", validet.saraksti) ?? [];
  // data/iestades.yaml pilno shēmu nosaka "Iestāžu un amatpersonu dati" (#28); te vajag tikai slugus.
  const iestades = existsSync(join(sakne, "data/iestades.yaml")) ? ielasit("data/iestades.yaml") : null;

  const temuSlugi = new Set(temas.map((t) => t.slug));
  const iestazuSlugi = new Set((Array.isArray(iestades) ? iestades : []).map((i) => i?.slug).filter(Boolean));
  const avots = avotuLasitajs(sakne);
  const sarakstiPecSluga = new Map(saraksti.map((s) => [s.slug, s]));

  parbauditSarakstus(saraksti, avots, k);

  const solijumi = solijumuFaili(sakne);
  const notikumi = parbauditNotikumus(sakne, ielasit, new Set(solijumi.map((f) => f.vards)), saraksti, k);

  for (const f of solijumi) {
    const s = ielasit(f.cels, validet.solijums);
    if (!s) continue;
    const kf = (zinojums) => k(f.cels, zinojums);

    if (s.id !== f.vards) kf(`id "${s.id}" nesakrīt ar faila vārdu "${f.vards}.yaml"`);
    if (s.saraksts !== f.saraksts) kf(`saraksts "${s.saraksts}" nesakrīt ar mapi "${f.saraksts}"`);
    const saraksts = sarakstiPecSluga.get(s.saraksts);
    if (!saraksts) {
      kf(`saraksts "${s.saraksts}" nav data/saraksti.yaml`);
      continue;
    }
    if (!s.id.startsWith(`${s.saraksts}-`)) kf(`id jāsākas ar "${s.saraksts}-"`);
    else if (s.id.slice(s.saraksts.length + 1).split("-").length > ID_VARDI_MAX)
      kf(`id slugā vairāk par ${ID_VARDI_MAX} vārdiem`);

    parbauditSlugus(s.temas, temuSlugi, "tēma", "data/temas.yaml", kf);
    if (iestades === null) kf("data/iestades.yaml nav — Atbildīgo iestādi nevar pārbaudīt");
    else parbauditSlugus(s.iestades, iestazuSlugi, "iestāde", "data/iestades.yaml", kf);

    if ((s.jautajums ?? "").trim()) kf(`neatbildēts jautājums redaktoram: ${s.jautajums.trim()}`);
    parbauditStatusaMainas(s, notikumi, kf);

    const pirmaisCvk = s.avoti.findIndex((a) => a.veids === "cvk");
    if (pirmaisCvk > 0) kf("CVK citātam jābūt pirmajam avotos");

    s.avoti.forEach((a, i) => {
      const ka = (zinojums) => kf(`avoti[${i}] (${a.veids}): ${zinojums}`);
      const teksti = saraksts.avoti.filter((x) => x.veids === a.veids).map(avots).filter(Boolean);
      if (!teksti.length) return ka(`Sarakstam nav ${a.veids} avota teksta sources/`);
      const vietas = teksti.flatMap((t) => atrastCitatu(t, a.citats).map((v) => ({ ...v, arNodalam: arNodalam(t) })));
      if (!vietas.length) return ka(`citāts nav atrasts avotā burtiski: „${a.citats}”`);
      const nodala = a.vieta.split(VIETAS_ATDALITAJS)[0];
      if (vietas.every((v) => v.arNodalam) && !vietas.some((v) => v.nodala === nodala)) {
        const kur = [...new Set(vietas.map((v) => v.nodala ?? "ārpus nodaļām"))].join(", ");
        ka(`vieta "${a.vieta}" nesakrīt: citāts ir nodaļā "${kur}"`);
      }
    });
  }
  return kludas;
}

/** @returns {Map<string, object>} derīgie Notikumi pēc id */
function parbauditNotikumus(sakne, ielasit, solijumuId, saraksti, k) {
  const notikumi = new Map();
  const frakcijas = new Set(saraksti.map((s) => s.frakcija).filter(Boolean));
  const balsojumi = new Map();
  for (const f of notikumuFaili(sakne)) {
    const n = ielasit(f.cels, validet.notikums);
    if (!n) continue;
    const kf = (zinojums) => k(f.cels, zinojums);
    notikumi.set(n.id, n);

    if (n.id !== f.vards) kf(`id "${n.id}" nesakrīt ar faila vārdu "${f.vards}.yaml"`);
    if (!n.id.startsWith(`${n.datums}-`)) kf(`id jāsākas ar datumu "${n.datums}-"`);
    if (!n.avoti.some((a) => a.veids !== "zinas")) kf("vajag vismaz vienu oficiālu avotu (ne zinas)");

    const redzeti = new Set();
    for (const { id } of n.solijumi) {
      if (redzeti.has(id)) kf(`Solījums "${id}" atkārtojas`);
      redzeti.add(id);
      if (!solijumuId.has(id)) kf(`Solījums "${id}" nav data/solijumi/`);
    }

    const b = n.balsojums;
    if (b) {
      if (b.laiks.slice(0, 10) !== n.datums) kf(`balsojuma datums ${b.laiks.slice(0, 10)} nesakrīt ar datums ${n.datums}`);
      if (balsojumi.has(b.id)) kf(`balsojums ${b.id} jau ir Notikumā "${balsojumi.get(b.id)}"`);
      balsojumi.set(b.id, n.id);
      // Frakcija ↔ Saraksts tikai 15. Saeimā; nezināms kods = jāpapildina data/saraksti.yaml `frakcija`.
      if (b.saeima === 15)
        for (const kods of Object.keys(b.frakcijas))
          if (kods !== BEZ_FRAKCIJAS && !frakcijas.has(kods)) kf(`frakcija "${kods}" nav data/saraksti.yaml`);
    }

    if ((n.jautajums ?? "").trim()) kf(`neatbildēts jautājums redaktoram: ${n.jautajums.trim()}`);
  }
  return notikumi;
}

function parbauditStatusaMainas(s, notikumi, kf) {
  const mainas = s.statusa_mainas ?? [];
  if (mainas.length && !s.parbaudams) kf("Nepārbaudāmam solījumam nav Statusa maiņu");
  mainas.forEach((m, i) => {
    const km = (zinojums) => kf(`statusa_mainas[${i}]: ${zinojums}`);
    const datumi = [];
    for (const id of m.notikumi) {
      const n = notikumi.get(id);
      if (!n) km(`Notikums "${id}" nav data/notikumi/`);
      else if (!n.solijumi.some((x) => x.id === s.id)) km(`Notikums "${id}" neattiecas uz šo Solījumu`);
      else datumi.push(n.datums);
    }
    if (datumi.length === m.notikumi.length && !datumi.includes(m.datums))
      km(`datums ${m.datums} nav neviena tā Notikuma datums`);
    const ieprieks = mainas[i - 1];
    if (ieprieks && m.datums < ieprieks.datums) km(`datums ${m.datums} agrāks par iepriekšējo (${ieprieks.datums})`);
    if (ieprieks && m.statuss === ieprieks.statuss) km(`Statuss "${m.statuss}" nemainās`);
  });
}

const arNodalam = (avots) => avots.vienibas.some((u) => u.nodala !== null);

function parbauditSlugus(lauks, atlautie, ko, kur, kf) {
  const visi = [lauks.galvena, ...(lauks.papildu ?? [])];
  for (const slug of visi) if (!atlautie.has(slug)) kf(`${ko} "${slug}" nav ${kur}`);
  if ((lauks.papildu ?? []).includes(lauks.galvena)) kf(`galvenā ${ko} "${lauks.galvena}" atkārtota papildu`);
}

function parbauditSarakstus(saraksti, avots, k) {
  const F = "data/saraksti.yaml";
  const redzeti = new Set();
  for (const s of saraksti) {
    if (redzeti.has(s.slug)) k(F, `saraksts "${s.slug}" atkārtojas`);
    redzeti.add(s.slug);
    const cvk = s.avoti.filter((a) => a.veids === "cvk");
    if (cvk.length !== 1) k(F, `${s.slug}: jābūt tieši vienam cvk avotam`);
    const cvkNodalas = new Set(cvk.flatMap((a) => a.nodalas ?? []));

    for (const a of s.avoti) {
      const kur = `${s.slug} ${a.veids}`;
      if (!a.fails) continue;
      const t = avots(a);
      if (!t) {
        k(F, `${kur}: fails ${a.fails} nav atrasts`);
        continue;
      }
      if (t.frontmatter?.url && t.frontmatter.url !== a.url)
        k(F, `${kur}: url nesakrīt ar ${a.fails} frontmatter (${t.frontmatter.url})`);
      const virsraksti = t.vienibas.filter((u) => u.k === "h");
      for (const n of a.nodalas ?? [])
        if (!virsraksti.some((u) => u.nodala === n)) k(F, `${kur}: nodaļa "${n}" nav atrasta ${a.fails}`);
      for (const n of a.neizrakstit ?? [])
        if (!virsraksti.some((u) => u.nodala === null && u.t.startsWith(n)))
          k(F, `${kur}: virsraksts "${n}" nav atrasts ${a.fails}`);
      for (const n of [...(a.izlaist ?? []), ...(a.nav_jaizraksta ?? [])])
        if (!virsraksti.some((u) => u.t === n)) k(F, `${kur}: sadaļa "${n}" nav atrasta ${a.fails}`);
      for (const [pap, c] of Object.entries(a.atbilst_cvk ?? {})) {
        if (!virsraksti.some((u) => u.nodala === pap)) k(F, `${kur}: nodaļa "${pap}" nav atrasta ${a.fails}`);
        if (!cvkNodalas.has(c)) k(F, `${kur}: "${pap}" → "${c}" nav CVK nodaļa`);
      }
    }
  }
}
