# Redaktora pārbaude

Viena izpilde (viena CVK nodaļa) = viens PR ar `data/solijumi/<saraksts>/*.yaml`. Pārbaudi pārskatā (`npm run parskats`, sk. `izpilde.md`: avots blakus Solījumiem) un pret kopsavilkumu PR aprakstā.

1. **Pārklājums.** Katrs nodaļas CVK teikums un katrs atbilstošais paplašinātās programmas "Apņemšanās un uzdevumi" punkts ir vai nu izrakstīts, vai kopsavilkumā ar iemeslu.
2. **Citāti.** Automātiska pārbaude: katrs citāts burtiski ir avotā (pēc atstarpju normalizācijas). PR nevar merge, ja nav.
3. **Granularitāte.** Neviens Solījums nesatur darbības, kurām varētu būt atšķirīgi statusi; nav divu Solījumu, kas vienmēr saņemtu vienu statusu; nav dublikātu ar iepriekšējo izpilžu Solījumiem.
4. **Nesakritība.** Abu avotu Solījumos `nesakritiba` aizpildīta, ja formulējums atšķiras pēc stipruma, mēra vai rādītāja; nosaukums lieto CVK mēru.
5. **Pārbaudāmība.** Katram Nepārbaudāmam: vai tiešām nav konkrēta objekta vai mēra? Katram Pārbaudāmam: vai var pateikt, kas būtu "izpildīts"?
6. **Nosaukums.** Neitrāls, ar mēru, bez partijas retorikas; saprotams bez citāta.
7. **Tēmas.** Galvenā tēma = ko mainīs lasītājam, nevis programmas nodaļa.
8. **Atbildīgā iestāde.** Galvenā = iestāde, kuras kompetencē ir iznākums (ne Saraksta ministrs); papildu tikai starpnozaru Solījumiem.
9. **`jautajums`** — visi atrisināti un lauks iztukšots pirms merge.
