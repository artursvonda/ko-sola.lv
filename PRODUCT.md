# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decided in #1, #5 and #13 (`docs/lapa.md`):

- Vite + Web Components + Open Props.
- Content pages statically rendered to HTML at build time from `data/` YAML (SEO + OG per Solījums); server code on the same deploy reserved for later dynamic routes.
- Cloudflare Workers with static assets + Workers Builds; `main` → production, preview URL per PR.
- HTML: JS `html` tagged templates in `lapa/`, rendered by a Vite plugin; OG image per Solījums generated at build (`lapa/og.js`).

## Users

Primary: the general Latvian public (voters), mostly on phones, arriving from a link shared on social media or in news to a single Solījums or Saraksts. Their job is a quick check: what did this list promise, and did they do it?

## Product Purpose

ko-sola.lv is a public, Latvian-only tracker of the promises made by the six lists elected to the 15th Saeima (election 03.10.2026) and of their fulfilment over the Saeima term. It should make it easy to see what is being done, how much is done, and who is responsible (Atbildīgais: institution + official).

Launch destination (#1): all Solījumi from CVK and extended programs of the 6 elected lists, each with source quote, Tēma and Statuss (initially "Nav vērtēts"); filters by Saraksts and Tēma; a working status-update process (AI draft → editor approval, with date and evidence). Target: before the government is approved.

## Positioning

Independent, non-partisan personal project (privately run, not commissioned by any party, no external funding). The publisher is a member of "Kustība Par!", which cooperated with Progresīvie in the 2026 election; this is disclosed only on `/metodologija/` (intro sentence + section 6), never as a note on PRO Solījumi, and neutrality rests on general mechanisms applied to every list (#104). Differs from neighbouring trackers by covering the full CVK program and extended programs for every elected list, a verbatim cited source for every Solījums, an evidence-linked Statuss history, and an explicit Atbildīgais per promise.

Neighbours: Re:Check "Solīja, bet vai izdarīja?" (status scale is compatible); Re:Baltica already follows the government declaration and action plan, which is out of scope here.

## Operating Context

- Reader: opens one shared Solījums or Saraksts page, then may filter by Saraksts, Atbildīgais, Tēma, or compare lists within a Tēma.
- Editor: currently only @artursvonda. Interface is GitHub: AI draft = PR, approval = merge, history = git log. Data is one YAML file per Solījums (`data/solijumi/<saraksts>/<id>.yaml`); schema validated in CI. Admin UI only if non-technical editors join.
- Status maintenance runs for the whole 4-year term.

## Capabilities and Constraints

- Terminology: `GLOSSARY.md` is the glossary (Saraksts, Solījums, Nepārbaudāms solījums, Statuss, Statusa maiņa, Tēma, Galvenā/Papildu tēma, CVK programma, Paplašinātā programma, Publisks izteikums). Readers may see "partija" for Saraksts.
- Statuss scale: Nav vērtēts / Procesā / Izpildīts / Daļēji izpildīts / Nav izpildīts. Nepārbaudāmi solījumi are listed but not rated and excluded from progress totals.
- 19 flat Tēmas; each Solījums has exactly one Galvenā tēma and 0–2 Papildu tēmas.
- Solījums page shows all quotes with sources and any Nesakritība (#13, #8); the detail panel shows the Nesakritība too. No per-Saraksts Nesakritība counts or filter: they would reflect source asymmetry, not consistency (#97).
- Latvian only; no EN version.
- Out of scope: government declaration tracking, systematic Publisks izteikums collection, public status suggestions, subscriptions/notifications, user profiles (planned later; architecture allows).
- Methodology (#104): one page `/metodologija/` (8 sections, linked from a footer on every page, no header tab) summarising selection, sources, rating, AI role, publisher and conflict of interest, neutrality and error reporting, with links to `docs/ekstrakcija/metode.md` and `docs/statusi/vertesana.md`.
- Source asymmetry is disclosed, not hidden: only JV and PRO have a full extended program and LPV a thematic one (economy), so Solījumi counts reflect program length, not ambition. Shown as a generated per-list sources table on `/metodologija/`, one sources line on the overview filtered by Saraksts, and one line on `/salidzinajums/`.
- Error reports only via GitHub issues (form „Kļūda Solījumā”); each Solījums page links to it with the ID prefilled. AI drafts (extraction, Notikumu candidates) are disclosed; every change is editor-approved and public in git.
- Undecided: launch (indexing, final CVK results, ID stability, OG in production).

## Brand Commitments

- Name and domain: ko-sola.lv (registered 05.10.2026, DNS on Cloudflare, #4).
- Lists shown neutrally: abbreviation + name, no party colours.
- Visual direction already chosen in #7: B1 · Tabula ar atbildīgajiem, colour scheme Grafīts; prototype on branch `prototype/dizains` (`prototypes/dizains/Tabula.dc.html`). Visual details belong in DESIGN.md, not here.

## Evidence on Hand

- `sources/cvk/`: verbatim CVK program texts for all 6 elected lists from Latvijas Vēstnesis Nr. 176A (14.09.2026), with source URL and HTML SHA-256 in frontmatter.
- Elected lists (CVK provisional, 04.10.2026): AS 42, LPV 17, Suverēnā vara 15, NA 10, Progresīvie 9, JV 7. Verify final CVK results before publishing.
- Solījumi of all 6 lists extracted (#17–#22, #96); counts per list are generated on `/metodologija/`. Prototype statuses were invented; never show them as real. At launch every Statuss is "Nav vērtēts".
- No testimonials, press, partners, or usage numbers exist. Do not fabricate any.

## Product Principles

1. Every claim is sourced. Each Solījums carries a verbatim quote and source link; each Statusa maiņa a date, reasoning and evidence link. No invented facts.
2. Neutral by construction. No party colours or ranking language; asymmetries in sources are disclosed, not hidden.
3. Each shared page stands alone. A reader landing cold on one Solījums from a phone must get what was promised, by whom, its Statuss and who is responsible, without navigating elsewhere.
4. Clarity over completeness at first glance: done / how much / who is responsible, then detail on demand.

## Accessibility & Inclusion

- Target: WCAG 2.2 AA.
- Statuss is never conveyed by colour alone (#7 already distinguishes statuses by shape as well).
- Full Latvian diacritics support in all type and UI.
