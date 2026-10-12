import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { stringify } from "yaml";
import { idNoGit, idDarbaKoka, parbauditStabilitati } from "../lib/stabilitate.js";

const SARAKSTI = stringify([{ slug: "jv" }, { slug: "na" }]);
const TEMAS = stringify([{ slug: "drosiba" }, { slug: "veseliba" }]);
const S = (id) => [`data/solijumi/${id.split("-")[0]}/${id}.yaml`, stringify({ id })];

// Pagaidu git repo: `publicets` — commit (kā `main`), `izmainas` — darba kokā pēc tā (null — izdzēš).
function repo(izmainas = {}) {
  const sakne = mkdtempSync(join(tmpdir(), "ko-stabilitate-"));
  test.after(() => rmSync(sakne, { recursive: true, force: true }));
  const rakstit = (faili) => {
    for (const [cels, saturs] of Object.entries(faili)) {
      if (saturs === null) rmSync(join(sakne, cels));
      else {
        mkdirSync(join(sakne, dirname(cels)), { recursive: true });
        writeFileSync(join(sakne, cels), saturs);
      }
    }
  };
  const g = (...args) => execFileSync("git", ["-C", sakne, ...args], { stdio: "ignore" });
  g("init", "-q", "-b", "main");
  rakstit({ "data/saraksti.yaml": SARAKSTI, "data/temas.yaml": TEMAS, ...Object.fromEntries([S("jv-a"), S("na-b")]) });
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "publicēts");
  rakstit(izmainas);
  return sakne;
}

const zinojumi = (sakne) => parbauditStabilitati(idNoGit(sakne, "main"), idDarbaKoka(sakne)).map((k) => `${k.fails}: ${k.zinojums}`);

test("bez izmaiņām un ar jauniem ID — nav kļūdu", () => {
  assert.deepEqual(zinojumi(repo()), []);
  assert.deepEqual(zinojumi(repo(Object.fromEntries([S("jv-c")]))), []);
});

test("publicēts Solījums pazudis vai pārdēvēts — kļūda", () => {
  const sakne = repo({ "data/solijumi/jv/jv-a.yaml": null, ...Object.fromEntries([S("jv-a2")]) });
  assert.deepEqual(zinojumi(sakne), [
    'data/solijumi/jv/jv-a.yaml: publicēts Solījums "jv-a" pazudis — ID nemaina; ja tiešām jāaizstāj, pievienot data/parvirzijumi.yaml',
  ]);
});

test("pazudis Solījums ar Pārvirzījumu — atļauts", () => {
  const sakne = repo({
    "data/solijumi/jv/jv-a.yaml": null,
    "data/parvirzijumi.yaml": stringify([{ no: "jv-a", uz: "na-b", iemesls: "dublikāts" }]),
  });
  assert.deepEqual(zinojumi(sakne), []);
});

test("Saraksta vai Tēmas slugs pazudis — kļūda (Pārvirzījums uz tiem neattiecas)", () => {
  const sakne = repo({ "data/saraksti.yaml": stringify([{ slug: "jv" }]), "data/temas.yaml": stringify([{ slug: "drosiba" }, { slug: "veseliba-2" }]) });
  assert.deepEqual(zinojumi(sakne), [
    'data/saraksti.yaml: publicēts Saraksta slugs "na" pazudis — slugs pēc publicēšanas nemainās',
    'data/temas.yaml: publicēts Tēmas slugs "veseliba" pazudis — slugs pēc publicēšanas nemainās',
  ]);
});

test("nezināms ref — izņēmums", () => {
  assert.throws(() => idNoGit(repo(), "nav-tada"));
});
