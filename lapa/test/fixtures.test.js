import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parbaudit } from "../../tools/lib/parbaudit.js";

// Paraugdatiem jāiztur tā pati pārbaude kā data/ (citāti burtiski, shēmas, Statusa maiņas).
test("fixtures/ iztur npm run parbaude", () => {
  const sakne = mkdtempSync(join(tmpdir(), "ko-fixtures-"));
  try {
    cpSync("data", join(sakne, "data"), { recursive: true });
    cpSync("sources", join(sakne, "sources"), { recursive: true });
    cpSync("fixtures/data", join(sakne, "data"), { recursive: true });
    assert.deepEqual(parbaudit(sakne), []);
  } finally {
    rmSync(sakne, { recursive: true, force: true });
  }
});
