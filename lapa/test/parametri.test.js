import { test } from "node:test";
import assert from "node:assert/strict";
import { nolasitParametru } from "../klients/parametri.js";

test("nolasitParametru: vērtība no query; trūkstošs vai tukšs — null", () => {
  assert.equal(nolasitParametru("?saraksts=jv&tema=aizsardziba", "tema"), "aizsardziba");
  assert.equal(nolasitParametru("?tema=", "tema"), null);
  assert.equal(nolasitParametru("", "tema"), null);
});

test("nolasitParametru: ar derīgajām vērtībām nezināmu (piem., novecojusi saite) neņem vērā", () => {
  const derigas = new Set(["aizsardziba"]);
  assert.equal(nolasitParametru("?tema=aizsardziba", "tema", derigas), "aizsardziba");
  assert.equal(nolasitParametru("?tema=nav-tadas", "tema", derigas), null);
});
