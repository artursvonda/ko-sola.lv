# Redaktora pārbaude — v0 (PROTOTIPS)

Viens Saraksts = viens PR ar `data/solijumi/<saraksts>/*.yaml`. Pārbaudi `parskats.html` (avots ↔ Solījumi blakus).

1. **Pārklājums.** Pārskatā nav neiekrāsotu "Apņemšanās un uzdevumi" punktu vai CVK teikumu, vai katram ir iemesls `_kopsavilkums.md`.
2. **Citāti.** Skripts apstiprina, ka katrs citāts burtiski ir avotā (automātiski; PR nevar merge, ja nav).
3. **Granularitāte.** Neviens Solījums nesatur divas darbības, kurām varētu būt atšķirīgi statusi; nav divu Solījumu, kas vienmēr saņemtu vienu statusu.
4. **Apvienošana.** Abu avotu Solījumos iznākums tiešām ir tas pats; `piezimes` norādītas mēra/stipruma atšķirības.
5. **Pārbaudāmība.** Katram Nepārbaudāmam — izlasi citātu: vai tiešām nav konkrēta mēra? Robežgadījumiem ir iemesls.
6. **Nosaukums.** Neitrāls, ar mēru, bez partijas retorikas; saprotams bez citāta.
7. **Tēmas.** Galvenā tēma = ko mainīs lasītājam, nevis programmas nodaļa.
8. **`jautajums`** — visi atrisināti un lauks iztukšots pirms merge.
