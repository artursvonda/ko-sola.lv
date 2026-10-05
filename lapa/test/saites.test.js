import { test } from "node:test";
import assert from "node:assert/strict";
import { parskatsSaite } from "../lapas/saites.js";

test("parskatsSaite: filtrēts pārskats ar parametriem secībā saraksts, atbildigais, tema", () => {
  assert.equal(parskatsSaite({ tema: "aizsardziba", saraksts: "jv" }), "/?saraksts=jv&tema=aizsardziba");
  assert.equal(parskatsSaite({ tema: "veseliba", atbildigais: "vm", saraksts: "na" }), "/?saraksts=na&atbildigais=vm&tema=veseliba");
  assert.equal(parskatsSaite({ atbildigais: "fm" }), "/?atbildigais=fm");
});

test("parskatsSaite: tukšus filtrus izlaiž; bez filtriem — pārskats", () => {
  assert.equal(parskatsSaite({ saraksts: "jv", atbildigais: "", tema: undefined }), "/?saraksts=jv");
  assert.equal(parskatsSaite({}), "/");
  assert.equal(parskatsSaite(), "/");
});
