# Avoti

Programmu teksti, pret kuriem `npm run parbaude` pārbauda Solījumu citātus burtiski (pēc atstarpju normalizācijas). Avots tiek reģistrēts `data/saraksti.yaml` (`avoti[].fails`); bez faila no avota citēt nevar.

- `cvk/` — CVK programmas (sk. `cvk/README.md`).
- `paplasinata/<saraksts>.md` — Paplašinātās programmas, viens fails uz avotu.

## Paplašinātās programmas fails

Teksts burtiski no avota (HTML vai PDF teksta slānis). Pievieno tikai struktūru:

```markdown
---
saraksts: Jaunā VIENOTĪBA
avota_veids: Paplašinātā programma
url: https://…              # = data/saraksti.yaml avoti[].url
ieguts: 2026-10-06
formats: PDF                # PDF | HTML
sha256: …                   # lejupielādētā faila
---

# 1. Drošība un aizsardzība

## Apņemšanās un uzdevumi

• Stiprināsim valsts aizsardzības spējas, …
```

- `#` — nodaļa (tieši kā avotā); `##`, `###` — sadaļas. Teksta rindas nemaina.
- Punkts sākas ar `•`, `-` vai `*`; rinda bez tā turpina iepriekšējo punktu vai rindkopu (PDF rindu pārnesumi ir atļauti). Tukša rinda beidz rindkopu.
- Lapu numurus, galvenes un kājenes izņem.

Pēc pievienošanas `data/saraksti.yaml` šim avotam aizpilda:

- `fails`;
- `atbilst_cvk` — katra paplašinātās nodaļa → CVK nodaļa, kuras izpildē to apstrādā (metode §0); nodaļas bez CVK atbilsmes neieraksta (tās apstrādā izpildē "Ārpus CVK nodaļām");
- `izlaist` — sadaļas, kas nav šī avota teksts, piem., JV "10 000 zīmju programmas apsolījums" (CVK kopija);
- `nav_jaizraksta` — sadaļas, kuras metode neizraksta, piem., "Pamatojums", "Prioritātes".
