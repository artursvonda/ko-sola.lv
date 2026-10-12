// npm run stabilitate [-- <ref>] — publicētie ID (Solījumi, Saraksti, Tēmas) nepazūd salīdzinājumā ar <ref>.
// Noklusējums HEAD^1: CI PR merge commit pirmais vecāks = `main`; push uz `main` — iepriekšējais `main`.
// Lokāli pret `main`: npm run stabilitate -- origin/main
import { idNoGit, idDarbaKoka, parbauditStabilitati } from "./lib/stabilitate.js";

const sakne = process.cwd();
const ref = process.argv[2] ?? "HEAD^1";
let ieprieks;
try {
  ieprieks = idNoGit(sakne, ref);
} catch {
  console.log(`git ref "${ref}" nav atrasts (seklā klonā vajag vēsturi: actions/checkout fetch-depth: 0)`);
  process.exit(1);
}
const kludas = parbauditStabilitati(ieprieks, idDarbaKoka(sakne));
for (const k of kludas) console.log(`${k.fails}: ${k.zinojums}`);
console.log(`pret ${ref}: ${ieprieks.solijumi.size} publicēti Solījumi, ${kludas.length} kļūdas`);
process.exit(kludas.length ? 1 : 0);
