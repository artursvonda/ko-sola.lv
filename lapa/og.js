// Solījuma dalīšanās attēls (og.png, 1200×630): Saraksts, citāts vai nosaukums, Statuss ar formu, Atbildīgais.
// satori (elementi → SVG ar glifu kontūrām) + resvg (SVG → PNG). Fonti — tie paši @fontsource faili, ko lapa.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { STATUSI } from "./dati.js";

// Citāts, ja tas nav garāks; citādi redaktora nosaukums.
export const OG_CITATS_MAX = 120;
const PLATUMS = 1200;
const AUGSTUMS = 630;

// Grafīts (lapa/klients/stils.css).
const K = {
  bg: "#ffffff", surface: "#f4f5f7", line: "#e2e5e9", ink: "#16191d", muted: "#5a626b", accent: "#2a4a70",
  iz: "#1f3a5c", izT: "#ffffff", di: "#9fb3cc", diT: "#102033", pr: "#ecdcb8", prT: "#3b2c0b", ni: "#8a3f2e", nv: "#9aa1a9",
};

const require = createRequire(import.meta.url);
// latin-ext (š, ž, ģ, ķ, ļ, ņ, č) — atsevišķa saime, jo satori nemeklē trūkstošos glifus vienas saimes failos.
const fonts = (pakete, saime, svari) =>
  svari.flatMap((weight) =>
    ["latin", "latin-ext"].map((kopa) => ({
      name: kopa === "latin" ? saime : `${saime} Ext`,
      weight,
      style: "normal",
      data: readFileSync(require.resolve(`@fontsource/${pakete}/files/${pakete}-${kopa}-${weight}-normal.woff`)),
    })),
  );
const FONTI = [...fonts("ibm-plex-sans", "Plex Sans", [400, 500, 600]), ...fonts("ibm-plex-mono", "Plex Mono", [400, 600])];

const el = (type, style, ...children) => ({ type, props: { style: { display: "flex", ...style }, children } });

// Statusa pill ar formu, kā .st-* lapā.
const PILL = {
  izpildits: { bg: K.iz, fg: K.izT, punkts: { borderRadius: 999 } },
  "daleji-izpildits": { bg: K.di, fg: K.diT, punkts: { borderRadius: 999 } },
  procesa: { bg: K.pr, fg: K.prT, punkts: { borderRadius: 999 } },
  "nav-izpildits": { bg: K.bg, fg: K.ni, border: `3px solid ${K.ni}`, punkts: { transform: "rotate(45deg)", borderRadius: 2 } },
  "nav-vertets": { bg: K.bg, fg: K.muted, border: `2px solid ${K.nv}`, punkts: { height: 4, borderRadius: 0 } },
  neparbaudams: { bg: K.bg, fg: K.muted, border: `2px dashed ${K.nv}`, punkts: { background: "transparent", border: `2px dashed ${K.muted}`, borderRadius: 999 } },
};

function pill(statuss) {
  const p = PILL[statuss];
  return el(
    "div",
    { alignItems: "center", gap: 14, padding: "10px 26px 10px 20px", borderRadius: 999, background: p.bg, color: p.fg, ...(p.border && { border: p.border }), fontSize: 28, fontWeight: 600 },
    el("div", { width: 14, height: 14, background: p.fg, ...p.punkts }),
    STATUSI[statuss],
  );
}

function elements(s) {
  const citats = s.avoti[0].citats;
  const arCitatu = citats.length <= OG_CITATS_MAX;
  const teksts = arCitatu ? `„${citats}”` : s.nosaukums;
  const izmers = arCitatu ? (citats.length <= 60 ? 64 : 50) : 56;
  return el(
    "div",
    { width: PLATUMS, height: AUGSTUMS, flexDirection: "column", justifyContent: "space-between", padding: "56px 72px 60px", background: K.bg, color: K.ink, fontFamily: "Plex Sans, Plex Sans Ext" },
    el(
      "div",
      { justifyContent: "space-between", alignItems: "baseline", fontFamily: "Plex Mono, Plex Mono Ext", fontSize: 26, color: K.muted },
      el("div", { fontWeight: 600, color: K.ink }, "ko-sola", el("span", { color: K.accent }, ".lv")),
      el("div", {}, `${s.saraksts.saisinajums} · ${s.saraksts.isais_nosaukums}`),
    ),
    el(
      "div",
      { flexDirection: "column", gap: 20 },
      el("div", { fontSize: izmers, fontWeight: arCitatu ? 500 : 600, lineHeight: 1.2, letterSpacing: -0.5 }, teksts),
      arCitatu && el("div", { fontSize: 26, color: K.muted }, s.nosaukums),
    ),
    el(
      "div",
      { alignItems: "center", justifyContent: "space-between", gap: 32, paddingTop: 28, borderTop: `2px solid ${K.line}` },
      pill(s.statuss),
      el("div", { fontSize: 26, color: K.muted, textAlign: "right" }, `Atbildīgais: ${s.iestade.nosaukums}`),
    ),
  );
}

/** PNG buferis Solījumam (modeļa objekts no ieladetModeli). */
export async function ogAttels(s) {
  const svg = await satori(elements(s), { width: PLATUMS, height: AUGSTUMS, fonts: FONTI });
  return new Resvg(svg, { fitTo: { mode: "width", value: PLATUMS } }).render().asPng();
}
