// Izvēlētā Tēma no query (?tema=<slug>); tikai zināmi slugi, citādi null (rāda visas tēmas).
export function izveletaTema(search, slugi) {
  const tema = new URLSearchParams(search).get("tema");
  return tema && slugi.includes(tema) ? tema : null;
}
