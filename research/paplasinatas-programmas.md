# Paplašināto programmu avoti — 15. Saeima (vēlēšanas 03.10.2026)

Ticket: "Atrast paplašināto programmu avotus". Researched 2026-10-04.
Method: fetched party sites, the official publisher (Latvijas Vēstnesis) and the Wayback Machine directly; downloaded PDFs to a scratch dir to count pages/words (not committed). Lengths are my own counts of extracted text and are approximate.

## Correction to the ticket premise: the CVK program limit is 10 000 characters, not 4000

- Saeimas vēlēšanu likums, 11. pants, 2. punkts (as amended by the law of 12.06.2025, in force 11.07.2025): the program "nedrīkst pārsniegt 10 000 iespiedzīmes". Source: https://likumi.lv/ta/id/35261-saeimas-velesanu-likums
- The parties say the same: JV calls the CVK version its "10 000 zīmju programma" (https://jaunavienotiba.lv/publiskojam-izversto-programmu-15-saeimas-velesanam/). Progresīvie use the same label on https://progresivie.lv/velesanas/programma.
- Every official program text I measured is about 9 900–10 100 characters without whitespace, or about 11 300–11 500 with spaces.

## Official CVK program texts (primary source that worked)

- **dati.cvk.lv still fails** from this machine (checked 2026-10-04). curl gives `SSL_ERROR_SYSCALL`, Python ssl gives `UNEXPECTED_EOF_WHILE_READING`, and WebFetch gives "Socket is closed". HTTP on port 80 only redirects to HTTPS.
- **Workaround:** Latvijas Vēstnesis published every registered list with its full "Priekšvēlēšanu programma" in issue Nr. 176A of 14.09.2026 (https://www.vestnesis.lv/laidiens/2026/09/14/nr/176A). These pages are HTML, the text extracts easily, and they fetch fine. The page for list N is `https://www.vestnesis.lv/op/2026/176A.N`.

| List | Nr. | LV official publication (CVK program text) | Program length (my count) | dati.cvk.lv slug (from search-engine index only, NOT fetched) |
|---|---|---|---|---|
| Suverēnā vara / Apv. Jaunlatvieši | 1 | https://www.vestnesis.lv/op/2026/176A.1 | ~1 420 words; 10 116 non-ws chars | `https://dati.cvk.lv/SV2026/kandidatu-saraksti/suverena-vara--apvieniba-jaunlatviesi/` |
| Nacionālā apvienība | 5 | https://www.vestnesis.lv/op/2026/176A.5 | ~1 430 words; 9 965 | only a district URL was indexed: `https://dati.cvk.lv/SV2026/kandidatu-saraksti/riga/nacionala-apvieniba-visu-latvijai-tevzemei-un-brivibailnnk/` |
| Apvienotais saraksts | 7 | https://www.vestnesis.lv/op/2026/176A.7 | ~1 290 words; 9 999 | **not found** |
| Latvija pirmajā vietā | 8 | https://www.vestnesis.lv/op/2026/176A.8 | ~1 460 words; 9 878 | `https://dati.cvk.lv/SV2026/kandidatu-saraksti/latvija-pirmaja-vieta/` |
| Jaunā VIENOTĪBA | 9 | https://www.vestnesis.lv/op/2026/176A.9 | ~1 355 words; 9 992 | `https://dati.cvk.lv/SV2026/kandidatu-saraksti/jauna-vienotiba/` |
| PROGRESĪVIE | 14 | https://www.vestnesis.lv/op/2026/176A.14 | ~1 360 words; 9 998 | `https://dati.cvk.lv/SV2026/kandidatu-saraksti/progresivie/` |

The list numbers and names come from the `<title>` of each 176A.N page. I could not open the dati.cvk.lv slugs because of the TLS failure, so they are unverified.

## Per list: is there an expanded program?

Summary: **only 2 of the 6 lists (JV, Progresīvie) published a full expanded program. LPV published one supplementary thematic (economic) program. For AS, NA and SV I found no expanded program.**

### Apvienotais saraksts (AS) — no expanded program found
- The program page is https://www.apvienotaissaraksts.lv/15-saeimas-velesanu-programma. It is HTML, about 1 285 words. I diffed it word by word against the official text (176A.7) and it is **100 % identical**, so this is the CVK program, not an expanded one.
- The known lead (https://www.apvienotaissaraksts.lv/zinas/apvienotais-saraksts-iesniedzis-15-saeimas-velesanu-kandidatu-sarakstus-un-velesanu-programmu) is a news item dated 05/07/2026. It summarises "desmit galvenajām ... prioritātēm" and links no other document.
- I checked the site's news list (https://www.apvienotaissaraksts.lv/zinas) and ran a web search. Neither turned up an expanded or extended program. **Not found ≠ proven absent.**

### Latvija pirmajā vietā (LPV) — no full expanded program; one supplementary economic program
- The CVK program is at https://latvijapirmajavieta.lv/programma-2026/. It is HTML, about 1 390 words, and matches 176A.8 100 %. WP API: published 2026-06-28, modified 2026-07-05.
- **The supplementary program is "LATVIJA PIRMAJĀ VIETĀ ekonomiskā programma 2026"** at https://latvijapirmajavieta.lv/latvija-pirmaja-vieta-ekonomiska-programma-2026/.
  - Format: HTML (includes a tax-rate table).
  - Length: about 2 800 words, 8 numbered chapters (taxes and pensions, demography, banks/PPP/EU funds, logistics, energy, high-value sectors, startups, public administration).
  - The text extracts easily.
  - WP API: published 2026-09-28 13:10, which is 5 days before the election.
- The WP media API shows no 2026 program PDF. The only 2026 PDF is a newspaper, `2026.04.18.-Slesera-avize.pdf`.
- `lpv.lv` does not resolve. The party's domain is latvijapirmajavieta.lv.

### Suverēnā vara / Apvienība Jaunlatvieši (SV) — no expanded program found (with a caveat)
- **The live site does not load from here.** suverenavara.lv fails with the same TLS error as dati.cvk.lv, and WebFetch also fails. Everything below comes from Wayback Machine snapshots.
- The CVK-length program is at https://suverenavara.lv/musu-piedavajums-tautai-15-saeimas-velesanas-programma/.
  - Snapshot: http://web.archive.org/web/20260826052714/https://suverenavara.lv/musu-piedavajums-tautai-15-saeimas-velesanas-programma/
  - HTML, about 1 300 words. The same text appears twice on the page (two blocks).
  - Post date 04.07.2026, `article:modified_time` 2026-08-13.
  - It matches the official 176A.1 text except for one bullet (the site has "nodrošināsim līdzfinansējumu bezmaksas ēdināšanai, bezmaksas sabiedriskajam transportam visiem skolēniem" where the official text has "nodrošināt atbalstu uzņēmumiem, kas investē jaunu tehnoloģisko produktu izstrādē, ražošanā"), plus the section numbering. About 1 290 of 1 305 words match.
- There is a second, longer page, https://suverenavara.lv/partijas-programma-15-saeima/.
  - Snapshot: http://web.archive.org/web/20261003083117/https://suverenavara.lv/partijas-programma-15-saeima/
  - HTML, about 2 200 words. Titled "Partijas "Suverēnā vara" programma.", with numbered points under Izglītība / Demogrāfija / Ekonomika / Veselība.
  - `modified_time` 2026-08-09.
  - **Unclear whether this counts as an expanded 15th Saeima program.** The slug says "15-saeima", but the heading is the generic party program, and it is in the name of the SV party only (not the SV/AJ alliance). It is not labelled "izvērstā" or "paplašinātā". Treat it as unverified until someone can read the live site.
- The Wayback crawl from June 2026 onward (CDX, `collapse=urlkey`) shows no program PDF.
- A Russian version exists at `/ru/musu-piedavajums-tautai-15-saeimas-velesanas-programma/`. I did not examine it.

### Nacionālā apvienība (NA) — no expanded program found
- https://nacionalaapvieniba.lv/programma/ is HTML, about 1 430 words, and matches 176A.5 **99.9 %**. WP API: created 2022-06-18, modified 2026-08-22. So this is the CVK program.
- The same text is embedded on https://nacionalaapvieniba.lv/15-saeimas-velesanas/ (WP modified 2026-07-20).
- WP API search found no post about an expanded program since 2026-05 and no 2026 PDF in the media library.

### Progresīvie — YES, expanded program ("Garā programma")
- **Expanded program:** https://progresivie.lv/velesanas/programma#gara-programma
  - It sits on the same HTML page as the CVK version (the "10 000 zīmju programma" section, `#10000`, which matches 176A.14 100 %).
  - Format: HTML (Squarespace). No PDF found; the only PDF linked is the EGP charter `/s/EZP-zala-harta-ENG.pdf`.
  - Length: about **16 000 words** (~134 000 chars), 14 numbered chapters, from "1. Ekonomiskās labklājības un izaugsmes programma" to "14. Taisnīga un atbildīga nodokļu sistēma".
  - Easily extractable: yes, one HTML page. The section starts at `id="gara-programma"`.
  - Date: no visible date. The Squarespace page JSON (`?format=json`) gives collection `updatedOn` 2026-07-04 17:14 UTC. This is page metadata only, not a confirmed publish date for the long section.
- Also published: an easy-language version at https://progresivie.lv/programma-viegla-valoda (HTML, about 1 700 words, with audio).

### Jaunā VIENOTĪBA (JV) — YES, expanded program ("izvērstā programma")
- **Announcement:** https://jaunavienotiba.lv/publiskojam-izversto-programmu-15-saeimas-velesanam/, dated 22.07.2026 (`article:published_time` 2026-07-22). It says the expanded program "veidota, papildinot Centrālajā vēlēšanu komisijā iesniegto 10 000 zīmju programmu" and covers 10 themes.
- **Expanded program PDF:** https://jaunavienotiba.lv/wp-content/uploads/2026/08/Jaunas-VIENOTIBAS-programma_gara_20072026.pdf
  - Format: PDF made with Word.
  - Length: **19 pages, about 9 400 words** (~81 000 chars).
  - The text layer extracts cleanly; every page has text.
  - Dates conflict: the filename says 20.07.2026, the PDF CreationDate is 2026-08-28, and the upload folder is 2026/08. So the file may have been replaced after the 22.07 announcement.
  - Each of the 10 chapters begins with the "10 000 zīmju programmas apsolījums" and then expands on it.
- **HTML version, per theme:** hub at https://jaunavienotiba.lv/programma-2026/ (page modified 2026-09-16). The hub shows the CVK text (~90 % word match with 176A.9; the extra words are navigation and "Izvērstā programmas sadaļa" link labels). Theme subpages hold the expanded text, e.g. https://jaunavienotiba.lv/programma-2026/3-finanses/.
  - Linked subpages: `drosiba-un-aizsardziba/`, `2-arpolitika-un-latviesi-pasaule/`, `3-finanses/`, `5-veseliba-labklajiba-un-demografija/`, `7-zinatne-inovacijas-un-tehnologijas/`, `8-izglitiba-latviesu-valoda-kultura-un-pilsoniska-sabiedriba/`.
  - I did not find links for themes 4, 6, 9 and 10 in the hub HTML.
- **Easy-language PDF:** https://jaunavienotiba.lv/wp-content/uploads/2026/09/STIPRA_LATVIJA_DROSA_EIROPA_ISA_VALODA_2026-09-09SEPT_00-45.pdf (6 pages, about 1 300 words, created 2026-09-09).
- The official CVK text itself points readers to jaunavienotiba.lv for "izvērsti uzdevumi katram solījumam un papildu prioritātes" (176A.9).
- Note: the old site www.vienotiba.lv does not have the 2026 program. Its https://www.vienotiba.lv/par-mums/programmas/ lists programs only up to 2022.

## Open items / unverified
- I could not reach the live dati.cvk.lv or suverenavara.lv. The slugs and the SV content come from the search index and Wayback only.
- I found no CVK slug for AS.
- The status of SV's longer "partijas-programma-15-saeima" page is unclear.
- Progresīvie's long program has no confirmed publish date.
