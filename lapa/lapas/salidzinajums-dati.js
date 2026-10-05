// Salīdzinājuma lapas dati: matrica saraksts × galvenā tēma un katras tēmas Solījumi pa sarakstiem.

/** Rinda katram Sarakstam (CVK secībā), šūna katrai Tēmai (taksonomijas secībā); n — pēc galvenās tēmas. */
export function matrica(m) {
  return m.saraksti.map((saraksts) => ({
    saraksts,
    sunas: m.temas.map((tema) => ({
      tema,
      n: m.solijumi.filter((s) => s.saraksts.slug === saraksts.slug && s.tema.slug === tema.slug).length,
    })),
  }));
}

/** Tēmas Solījumi katram Sarakstam (visi, CVK secībā): galvenie (skaitās matricā) un papildu (tikai atrodami). */
export function temasSaraksti(m, tema) {
  return m.saraksti.map((saraksts) => {
    const sava = m.solijumi.filter((s) => s.saraksts.slug === saraksts.slug);
    return {
      saraksts,
      galvenie: sava.filter((s) => s.tema.slug === tema),
      papildu: sava.filter((s) => s.papildu_temas.some((t) => t.slug === tema)),
    };
  });
}
