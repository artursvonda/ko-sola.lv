import { test } from "node:test";
import assert from "node:assert/strict";
import { izveletaTema } from "../klients/tema.js";

const SLUGI = ["nodokli-un-budzets", "aizsardziba"];

test("izveletaTema: ?tema= ar zināmu slug", () => {
  assert.equal(izveletaTema("?tema=aizsardziba", SLUGI), "aizsardziba");
  assert.equal(izveletaTema("?saraksts=jv&tema=nodokli-un-budzets", SLUGI), "nodokli-un-budzets");
});

test("izveletaTema: bez parametra vai nezināma tēma — nav izvēles", () => {
  assert.equal(izveletaTema("", SLUGI), null);
  assert.equal(izveletaTema("?tema=", SLUGI), null);
  assert.equal(izveletaTema("?tema=nav-tadas", SLUGI), null);
});
