// npm run parbaude — pārbauda data/ (shēmas, slugi, citāti pret sources/, Notikumi). Kļūdas → izejas kods 1.
import { parbaudit } from "./lib/parbaudit.js";
import { solijumuFaili, notikumuFaili } from "./lib/dati.js";

const sakne = process.cwd();
const kludas = parbaudit(sakne);
for (const k of kludas) console.log(`${k.fails}: ${k.zinojums}`);
console.log(`${solijumuFaili(sakne).length} Solījumi, ${notikumuFaili(sakne).length} Notikumi, ${kludas.length} kļūdas`);
process.exit(kludas.length ? 1 : 0);
