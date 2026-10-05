---
name: ko-sola.lv
description: Public tracker of what the lists elected to the 15th Saeima promised, set like a cited public record.
colors:
  paper: "#ffffff"
  surface: "#f4f5f7"
  hairline: "#e2e5e9"
  ink: "#16191d"
  muted: "#5a626b"
  accent: "#2a4a70"
  selection-wash: "#edf1f6"
  status-done: "#1f3a5c"
  status-done-text: "#ffffff"
  status-partial: "#9fb3cc"
  status-partial-text: "#102033"
  status-progress: "#ecdcb8"
  status-progress-line: "#c9b484"
  status-progress-text: "#3b2c0b"
  status-failed: "#8a3f2e"
  status-neutral-line: "#9aa1a9"
typography:
  display:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2.4vw, 2.375rem)"
    fontWeight: 500
    lineHeight: 1.22
    letterSpacing: "-0.012em"
  display-medium:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.6vw, 1.95rem)"
    fontWeight: 500
    lineHeight: 1.22
    letterSpacing: "-0.012em"
  display-small:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 1vw, 1.6rem)"
    fontWeight: 500
    lineHeight: 1.28
    letterSpacing: "-0.012em"
  title:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  citation:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\""
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.1em"
  pill:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  hairline: "1px"
  focus: "2px"
  round: "1e5px"
spacing:
  size-1: "0.25rem"
  size-2: "0.5rem"
  size-3: "1rem"
  size-4: "1.25rem"
  size-5: "1.5rem"
  size-6: "1.75rem"
  size-9: "4rem"
  size-10: "5rem"
components:
  pill-izpildits:
    backgroundColor: "{colors.status-done}"
    textColor: "{colors.status-done-text}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  pill-daleji-izpildits:
    backgroundColor: "{colors.status-partial}"
    textColor: "{colors.status-partial-text}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  pill-procesa:
    backgroundColor: "{colors.status-progress}"
    textColor: "{colors.status-progress-text}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  pill-nav-izpildits:
    textColor: "{colors.status-failed}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  pill-nav-vertets:
    textColor: "{colors.muted}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  pill-neparbaudams:
    textColor: "{colors.muted}"
    typography: "{typography.pill}"
    rounded: "{rounded.round}"
    padding: "3px 10px 3px 8px"
  nav-tab:
    textColor: "{colors.muted}"
    height: "52px"
  nav-tab-current:
    textColor: "{colors.ink}"
  citation-line:
    textColor: "{colors.muted}"
    typography: "{typography.citation}"
    padding: "0.5rem 0 0"
  table-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    padding: "10px 14px"
---

# Design System: ko-sola.lv

## Overview

**Creative North Star: "The Cited Record"**

Every page reads like an annotated public record: the list's own words set large, then a hairline and a monospace citation, then the ruled facts beside them. Paper-white ground, near-black ink, one dark slate-blue accent, and a monochrome rhythm of 1px rules do the structural work that cards and shadows do elsewhere. Density is that of a reference document, not a dashboard: one left-anchored reading column (44rem on the Solījums page, 1200px for tables), generous vertical gaps between sections, compact lines inside them.

Two typefaces from one family carry the whole system. IBM Plex Sans reads and speaks (body, titles, the quote as headline); IBM Plex Mono only cites (sources, dates, field labels, list abbreviations, the wordmark). Statuss is the only place the palette warms or saturates, and every Statuss also carries its own shape, so the record stays legible without colour. Lists are shown neutrally: abbreviation and name, never party colours.

The 1200×630 share card (OG image) is the same world at poster scale: same palette, same two faces, the pill with its shape, a hairline above the footer row.

**Key Characteristics:**
- Quote as headline: the source text, upright in ink at weight 500, is the largest type on the page.
- Hairline-ruled structure; no cards, no shadows for elevation.
- Mono is reserved for citation material.
- Statuss = colour + shape + word, always all three.
- One accent, used for links, focus, the hanging opening „ and the ".lv" in the wordmark.

## Colors

A cool graphite neutral range with one deep slate-blue accent; warmth and saturation appear only in the Statuss scale.

### Primary
- **Slate Ledger Blue** (`accent`): links (1px underline, 2px on hover while text turns ink), the 2px focus outline, the active tab underline, the hanging opening „ of every quote, ".lv" in the wordmark, the vote-details summary.

### Neutral
- **Paper** (`paper`): the page ground and the share-card ground.
- **Graphite Ink** (`ink`): body text, quotes, titles, and the heavier 1px top rule that opens a ruled band (Statuss band, Nesakritība note).
- **Pencil Grey** (`muted`): secondary text, labels, citation lines, breadcrumbs, inactive tabs.
- **Hairline** (`hairline`): every divider, table row rule, timeline spine, header bottom border.
- **Ledger Surface** (`surface`): table header cells only.
- **Selection Wash** (`selection-wash`): the brief `:target` highlight on a timeline entry; the selected filter option, the row open in the detail panel and the selected matrix column.

### Statuss scale
- **Izpildīts** (`status-done` / `status-done-text`): filled dark navy pill, round dot.
- **Daļēji izpildīts** (`status-partial` / `status-partial-text`): filled pale slate pill, round dot; also the text-selection colour.
- **Procesā** (`status-progress` / `status-progress-text`, `status-progress-line` for its timeline node border): filled parchment pill, round dot.
- **Nav izpildīts** (`status-failed`): outlined in brick red, diamond marker; the same red marks a "pret solīto" Notikums.
- **Nav vērtēts** and **Nepārbaudāms** (`muted` text, `status-neutral-line` outline): outlined grey, a dash marker and a dashed outline + hollow dashed dot respectively. `status-neutral-line` also draws the citation-line separators, timeline node rings and sub-list dashes.

### Named Rules
**The One Accent Rule.** Slate Ledger Blue is the only non-Statuss hue. It marks what is clickable or quoted, nothing else.

**The Neutral Lists Rule.** Saraksti never get a colour. They are identified by abbreviation and name in mono.

**The Colour Is Never Alone Rule.** Every Statuss pill and timeline node pairs its colour with a distinct shape (circle, diamond, dash, dashed ring) and its word.

## Typography

**Display Font:** IBM Plex Sans (with system-ui stack)
**Body Font:** IBM Plex Sans
**Label/Mono Font:** IBM Plex Mono (with monospace-code stack), tabular numerals

**Character:** A sober civic grotesque paired with its own typewriter mono; the mono reads as footnote and docket stamp, the sans as the voice of the record. Both are self-hosted with latin-ext for Latvian diacritics.

### Hierarchy
- **Display** (500, three length-driven steps from `display` down to `display-small`, 1.22–1.28, -0.012em): the lead quote only. Step chosen by quote length (≤90 / ≤180 / longer characters); the quote is never truncated. `text-wrap: pretty`.
- **Title** (600, 1.125rem, 1.35 / 1.3): the page h1 (editor's title, deliberately smaller than the quote) and section h2s, `text-wrap: balance`.
- **Body** (400, 16px, 1.5; band and list rows at 1.4): reading text, timeline entries, related-list rows. Secondary quotes set at 1.0625rem.
- **Body small** (400, 14px): "kopš" lines, Amatpersona rows, sources, vote details.
- **Citation** (mono 400, 12–13px, muted): citation lines, timeline dates, breadcrumb. The first citation segment (source) is 600, uppercase, 0.06em.
- **Label** (mono 600, 11px, 0.1em, uppercase, muted): field labels for data (Statuss, Atbildīgais, Tēma, Nesakritība note). Table headers use the same size and tracking in sans 400.
- **Wordmark** (mono 600, 18px): "ko-sola" in ink, ".lv" in accent.

### Named Rules
**The Mono Cites Rule.** Plex Mono is for sources, dates, numbers, abbreviations and field labels. Never set reading prose or a quote in mono.

**The Quote Outranks The Title Rule.** Where a quote leads a page it is upright, ink, weight 500 and larger than the h1; never italic, never grey, never shrunk to a caption.

## Layout

A single left-anchored column inside `main` (max 1200px, padding 1.5rem sides, 5rem bottom); the Solījums article narrows to 44rem. Spacing comes from Open Props sizes: 0.25 / 0.5 / 1 / 1.25 / 1.5 / 1.75rem within components, 4rem (`size-9`) between page sections. The header is a wrapping flex row (wordmark + tabs) with a hairline bottom.

The Statuss band is a two-column grid (equal on phones, 1 : 1.4 from 48rem) with a full-width Tēma row beneath. On a 390px phone the band sits inside the first viewport, even under a long quote. Lists of related Solījumi are flex rows: title left, pill right, baseline-aligned, wrapping on narrow screens. Wide tables scroll horizontally in their own container.

## Elevation & Depth

Flat. Depth is expressed by rules, not shadows: 1px hairlines divide, a 1px ink rule opens a band, the surface tint marks table headers. `box-shadow` appears only as an inset outline on outlined pills and inside the `:target` highlight animation (a horizontal wash extension), never as a lift.

### Named Rules
**The Ruled, Not Carded Rule.** Groupings are bands between rules. No boxes, no rounded containers, no drop shadows; a note (Nesakritība) is a ruled band, not an alert box.

## Shapes

Square, ruled geometry; the only rounded forms are the fully round Statuss pills and the round timeline nodes. Corners elsewhere are 0, with 1px radius softening on diamond and square markers and 2px on the focus outline. The recurring silhouettes are semantic: circle family = Statuss maiņa at a rated Statuss, diamond = Nav izpildīts, dash = Nav vērtēts, dashed ring = Nepārbaudāms or no entry, up-triangle in ink = Notikums par, down-triangle in brick red = Notikums pret, hollow square = the "Solīts" origin.

## Components

### Statuss pill
Compact, round and shape-coded; the system's one chip.
- **Shape:** fully round (`rounded.round`), 7px marker before the word, 6px gap, 12px/600 text, nowrap.
- **Filled:** Izpildīts, Daļēji izpildīts, Procesā.
- **Outlined:** Nav izpildīts (1.5px inset brick outline, diamond), Nav vērtēts (1px inset grey outline, 2px dash), Nepārbaudāms (1px dashed grey border, italic, hollow dashed dot).
- **States:** static; no hover.
- Same grammar at 28px on the share card.

### Citation line (signature)
A hairline, then mono 12px muted segments separated by grey middots: source (uppercase 600, linked when a URL exists) · vieta · publikācija. Sits under every quote, like a reference in a legal text. The quote above it opens with a „ in accent hanging outside the left text edge.

### Statuss band
A definition list ruled with a 1px ink top and hairline bottom; cells divided by a hairline. Label (mono) over value. Holds the pill + "kopš" date, Atbildīgais (iestāde bold, Amatpersona on two muted lines so narrow cells break between lines, not mid-line), and a full-width Tēma row.

### Timeline (laika ass)
One 1px hairline spine at the left; an 11px node per entry carrying the shape grammar above; mono 12px date line ("datums · Statusa maiņa / Notikums · par/pret solīto"). Newest first, ending in the "Solīts" origin. A linked entry receives a 2.4s selection-wash fade on `:target` (cubic-bezier(.16, 1, .3, 1)); under reduced motion the wash is static. Vote details sit in a disclosure with a CSS chevron that rotates in 0.2s, opening a mono tabular table.

### Navigation
Header tabs: sans 500, muted, 52px tall, 2px transparent bottom border; current page in ink with an accent underline. Breadcrumb: mono 13px muted with a › separator.

### Links
Accent, 1px underline offset .18em; hover turns ink with a 2px underline. Focus: 2px accent outline, 2px offset.

### Tables
Full-width, collapsed; uppercase 11px tracked sans headers on the surface tint; 10px 14px cells divided by hairlines. Comparison matrix: mono, fully hairline-gridded, centred.

### Overview (Pārskats)
The one page wider than the table column: `main` widens to 90rem.
- **Breakpoints:** from 64rem the filters are a 15rem sticky sidebar (hairline right rule), always open; from 75rem a row opens a 24rem sticky detail panel beside the table (ink top rule, no box).
- **Narrow filters:** one collapsed disclosure row, „Filtri · <selection>”: Label + current selection, ink top rule, hairline bottom, the CSS chevron of the vote details.
- **Selected filter:** selection wash (`--sel`), weight 600, 2px accent left border. Options with 0 are not listed, except the selected one.
- **Navigation-style links (exception to Links):** filter options and matrix headers/cells are navigation, not prose links: ink or muted, no underline; underline on hover and `:focus-visible` (plus the focus outline).
- **Stacked rows on phone** (below 48rem): each row is a two-tier grid, Saraksts + title on top, Atbildīgais and pill below, hairline between rows; the header row is visually hidden.
- **Papildu group:** under a filter, matches by a papildu Tēma or iestāde follow the galvenā rows under a 1px ink rule and the Label „Saistīti arī (papildu): N”. Counts and progress cover the galvenā rows only, so a number always matches the rows it sits above. The Salīdzinājums tēma sections use the same Label.

## Do's and Don'ts

### Do:
- **Do** set the source quote as the headline: Plex Sans 500, ink, upright, sized by length, with the hanging accent „.
- **Do** put a citation line under every quote: hairline, mono 12px, source · vieta · publikācija.
- **Do** group facts into bands between 1px rules (ink rule on top for a primary band, hairlines elsewhere).
- **Do** show every Statuss as colour + shape + word, in pills and in timeline nodes alike.
- **Do** keep Plex Mono for dates, sources, numbers, abbreviations and field labels, with tabular numerals.
- **Do** keep motion to state feedback (the `:target` wash, the disclosure chevron) and honour `prefers-reduced-motion`.

### Don't:
- **Don't** give Saraksti colours or rank them visually; abbreviation + name only.
- **Don't** wrap content in cards, rounded containers or drop shadows; use rules.
- **Don't** set a source quote as a small grey italic caption; quotes stay upright, ink, Plex Sans.
- **Don't** introduce a second accent hue outside the Statuss scale.
- **Don't** convey Statuss by colour alone.
