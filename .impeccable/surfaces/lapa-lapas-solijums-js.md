---
version: 1
slug: "lapa-lapas-solijums-js"
primary_target: "lapa/lapas/solijums.js"
related_targets: []
---

# Solījuma lapa (`/solijumi/<id>/`)

Mode: Read. Visitor arrives cold from a shared link, mostly on a phone, and must learn what was promised, by whom, its Statuss and who is responsible without navigating elsewhere.

Scope: `lapa/lapas/solijums.js`, its CSS in `lapa/klients/stils.css`, per-Solījums OG image (1200×630, generated at build). B1 detail panel later reuses the same pieces.

Confirmed decisions (shape, 2026-10-05):
- Lead quote = `avoti[0]` (CVK first when present, CI enforces); other quotes listed below with `vieta`; Nesakritība as a note between them, with "Statusu vērtē pēc CVK programmas".
- `h1` = editor `nosaukums`; the quote is a `blockquote` set as the visual headline.
- One timeline, newest first: Statusa maiņas and Notikumi interleaved; a Statusa maiņa names its Notikumi; Notikums shows par/pret by shape + word, its sources, Frakciju balsojums, and "attiecas arī uz" links. Nepārbaudāms: Notikumi only.
- Atbildīgais = Atbildīgā iestāde + current Amatpersona (data/iestades.yaml).
- Below: other Solījumi of this Saraksts in the Galvenā tēma; all other Sarakstu Solījumi in that Tēma, in CVK number order.
- OG card: quote when ≤120 chars, otherwise the title.
- Never shown: `piezimes`, `jautajums`.

Build decisions (craft, 2026-10-05; not yet reviewed by the editor):
- Band also carries a full-width Tēma row (Galvenā + Papildu tēmas): Tēma is one of the reader's filters and drives both link sections below.
- Timeline ends with a "Solīts" origin node (lead source + its publication, e.g. Latvijas Vēstnesis Nr. 176A, 14.09.2026) so the record starts where the promise was made.
- Other lists in the Tēma: shape answer was "all 6 lists, fixed order, with links"; each list shows up to 3 Solījumi plus a "Visi … (N)" link to the comparison; lists with none collapse into one line.
- Timeline node grammar: Statusa maiņa = status shape (circle family / diamond), Notikums = triangle (par up, ink; pret down, red-brown), origin = hollow square.

Open: domain (#4) for absolute OG URLs; methodology page.

## Direction contract

THESIS: The Saraksts's own words are the headline; ko-sola.lv only annotates them. Refuses the fact-check default (editor headline + big verdict badge) and the B1 panel's small grey italic quote.

OWN-WORLD: B1 · Grafīts. White ground, #f4f5f7 surface, ink #16191d, accent #2a4a70, hairline #e2e5e9; IBM Plex Sans for reading and the quote (upright, ink, 500), Plex Mono only for citations, dates and field labels; status pills distinguished by shape. Signature: the citation line — a hairline-ruled mono line under every quote (source · vieta · publication) like a legal citation, with an accent-coloured hanging „ opening each quote.

STORY: Reader sees exactly what the Saraksts wrote and where, then where it stands and who is accountable, then the dated, evidence-linked record, then what else this list and the others promise on the same Tēma.

FIRST VIEWPORT: (390px) B1 header; breadcrumb row "Solījumi › JV · Jaunā VIENOTĪBA" in mono; h1 title at 1.125rem/600; lead quote 1.5–2rem by length with hanging accent „; citation line; two-cell band Statuss (pill + "kopš") | Atbildīgais (iestāde + Amatpersona), ruled, not a card. Band always inside the first phone viewport, even for 230-char quotes.

FORM: "Citāts kā virsraksts", position 4 of 7 on the ranked surface list; seed key ddb107f1.

SIGNATURE INTERACTION / MOTION: The timeline is a ruled spine; Statusa maiņa nodes carry the status shape, Notikums nodes the par/pret shape. Clicking a Notikums reference from a Statusa maiņa scrolls to and briefly marks that Notikums (`:target` highlight, reduced-motion safe). No other motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
