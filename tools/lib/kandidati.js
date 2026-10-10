// Grafika režīms: Notikumu kandidāti no oficiālajiem avotiem logā [no, lidz] (lēmums: "Statusa maiņas plūsma", #10).
// Tikai faktu saraksts — vai kandidāts skar kādu Solījumu, lemj /ai-parskats (un /notikums).
// Kandidāts: { avots, veids, datums, nosaukums, url, atslegas, unikals?, ...papildu }.
// `atslegas` — dublikātu meklēšanai Notikumu tekstā; `unikals` — atslēga apzīmē tieši šo faktu
// (citādi tā ir likumprojekta/projekta atslēga, un dublikāts ir tikai Notikums ar to pašu `datums`).
import { atkodet } from "./balsojums.js";

/** "09.10.2026" → "2026-10-09"; "" → "". */
const isoNoLv = (s) => (/^\d{2}\.\d{2}\.\d{4}$/.test(s ?? "") ? s.split(".").reverse().join("-") : "");
const logaa = (d, { no, lidz }) => d >= no && d <= lidz;

/**
 * Saeimas likumprojekti (`saeima.lv/lawdata.json`): iesniegšana, galīgais lasījums
 * (steidzamam — 2. lasījums), izsludināšana, noraidīšana.
 */
export function saeimasLikumprojekti(lawdata, logs) {
  const out = [];
  for (const l of Object.values(lawdata.laws ?? {})) {
    const pamats = { avots: "saeima", nosaukums: atkodet(l.name), atslegas: [l.id], likumprojekts: l.id, statuss: l.statuss };
    const steidzams = Number(l.steidzams) === 1;
    const notikumi = [
      ["iesniegts", isoNoLv(l.submission_date), { iesniedza: l.submitted_by }],
      ["galigais-lasijums", isoNoLv(steidzams ? l.second_reading_date : l.third_reading_date), { steidzams }],
      ["izsludinats", isoNoLv(l.published), {}],
      ["noraidits", l.statuss === "Likumprojekts noraidīts" ? isoNoLv(l.date) : "", {}],
    ];
    for (const [veids, datums, papildu] of notikumi) {
      if (datums && logaa(datums, logs)) out.push({ ...pamats, veids, datums, ...papildu });
    }
  }
  return out;
}

const LEMUMS = /\(\d+\/Lm\d+\)/;
const PROCEDURA_LEMUMAM = /iekļaušanu Saeimas sēdes darba kārtībā|nodošanu komisijām|atzīšanu par steidzamu/;

/** Saeimas lēmumu balsojumi (`/Lm`) no `parsetBalsojumus` rezultāta; likumprojekti — `saeimasLikumprojekti`. */
export function saeimasLemumi(balsojumi, logs, datuAvots) {
  return balsojumi
    .filter((b) => LEMUMS.test(b.motivs) && !PROCEDURA_LEMUMAM.test(b.motivs) && logaa(b.laiks.slice(0, 10), logs))
    .map((b) => ({
      avots: "saeima",
      veids: "lemums",
      datums: b.laiks.slice(0, 10),
      nosaukums: b.motivs,
      atslegas: [b.id],
      unikals: true,
      balsojums: b.id,
      kopa: b.kopa,
      datu_avots: datuAvots,
    }));
}

// Pašvaldību saistošie noteikumi u. c. — ne Saraksta Solījumu iznākums.
const PASVALDIBA = /dome|pašvaldība|novada|valstspilsētas/i;

/**
 * Latvijas Vēstneša laidiena lapa (`vestnesis.lv/laidiens/YYYY/MM/DD`) → sadaļas "Tiesību akti" publikācijas.
 * Dienā bez laidiena vietne rāda citu laidienu — tad `null`.
 */
export function vestnesaLaidiens(html, datums) {
  const lapasDatums = isoNoLv(html.match(/class='date'>[\s\S]*?(\d{2}\.\d{2}\.\d{4})/)?.[1]);
  if (lapasDatums !== datums) return null;
  const sakums = html.indexOf("<h1>Tiesību akti");
  if (sakums < 0) return [];
  const beigas = html.indexOf("<h1>", sakums + 4);
  const sadala = html.slice(sakums, beigas < 0 ? undefined : beigas);
  const out = [];
  for (const grupa of sadala.split("<div class='head").slice(1)) {
    const izdevejs = atkodet(grupa.match(/<h2[^>]*>([^<]*)<\/h2>/)?.[1] ?? "").trim();
    if (PASVALDIBA.test(izdevejs)) continue;
    const re = /<a href='(https:\/\/www\.vestnesis\.lv\/(op\/\d{4}\/[\w.]+))'[^>]*class='innerItem'[\s\S]*?<div class='title'>([\s\S]*?)<\/div>(?:\s*<div class='subTitle'>([\s\S]*?)<\/div>)?/g;
    for (const [, url, op, nosaukums, dokuments] of grupa.matchAll(re)) {
      out.push({
        avots: "vestnesis",
        veids: "publicets",
        datums,
        nosaukums: atkodet(nosaukums.replace(/\s+/g, " ")).trim(),
        url,
        atslegas: [op],
        unikals: true,
        izdevejs,
        dokuments: atkodet((dokuments ?? "").replace(/\s+/g, " ")).trim(),
      });
    }
  }
  return out;
}

/**
 * TAP atvērtie dati (`tap-publicetie-tiesibu-akti`, JSON:API) → projekti, kas iesniegti logā.
 * Pieņemšanas datuma datos nav; pieņemtos redz Vēstnesī vai MK protokolā.
 */
export function tapProjekti(json, logs) {
  const tipi = new Map((json.included ?? []).filter((x) => x.type === "legal_act_types").map((x) => [x.id, x.attributes.name]));
  return (json.data ?? [])
    .filter((a) => a.attributes.submitted_at && logaa(a.attributes.submitted_at.slice(0, 10), logs))
    .map((a) => ({
      avots: "mk",
      veids: "mk-projekts",
      datums: a.attributes.submitted_at.slice(0, 10),
      nosaukums: atkodet(a.attributes.name),
      url: a.links?.web,
      atslegas: [a.attributes.identificator, a.id].filter(Boolean),
      projekts: a.attributes.identificator,
      tips: tipi.get(a.relationships?.legal_act_type?.data?.id) ?? "",
      progress: a.attributes.progress_name,
      iestade: a.attributes.responsible_institution_name,
    }));
}

/**
 * Atzīmē kandidātus, kas jau ir Notikumā (`main` vai `notikums/*` zarā — arī atvērtā vai noraidītā PR).
 * @param notikumi [{ vieta, datums, teksts }] — `teksts` = viss YAML
 */
export function atzimetDublikatus(kandidati, notikumi) {
  return kandidati.map((k) => {
    const n = notikumi.find((n) => k.atslegas.some((a) => n.teksts.includes(a)) && (k.unikals || n.datums === k.datums));
    return n ? { ...k, jau_ir: n.vieta } : k;
  });
}
