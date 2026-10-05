import { test } from "node:test";
import assert from "node:assert/strict";
import { html, raw } from "../html.js";

test("escapē vērtības", () => {
  assert.equal(String(html`<p title="${'a"b'}">${"<b>&"}</p>`), '<p title="a&quot;b">&lt;b&gt;&amp;</p>');
});

test("ligzdoti šabloni, masīvi un raw netiek escapēti", () => {
  const li = ["ā", "<č>"].map((x) => html`<li>${x}</li>`);
  assert.equal(String(html`<ul>${li}${raw("<hr>")}</ul>`), "<ul><li>ā</li><li>&lt;č&gt;</li><hr></ul>");
});

test("null, undefined un false — tukšs", () => {
  assert.equal(String(html`${null}${undefined}${false}${0}`), "0");
});
