// Detaļu paneļa saturs: daļas no paša Solījuma lapas HTML (/solijumi/<id>/), lai panelis un lapa nekad neatšķirtos.
// Paneli rāda tikai platā ekrānā ar JS; citādi rindas saite atver Solījuma lapu.

/** Selektori Solījuma lapā (lapa/lapas/solijums.js); lapa/test/sakums.test.js pārbauda, ka tie tur ir. */
export const PANELA_DALAS = {
  cels: "nav.cels",
  virsraksts: "h1",
  citats: "figure.citats.galvenais",
  josla: "dl.josla",
  laikaAss: "ol.laika-ass",
};

/** Īsā vēsture: jaunākie ieraksti (bez „Solīts” sākuma), pārējais — pilnajā lapā. */
const VESTURES_MAX = 3;

const el = (tags, klase, teksts) => {
  const e = document.createElement(tags);
  if (klase) e.className = klase;
  if (teksts != null) e.textContent = teksts;
  return e;
};

const saite = (href, teksts, klase) => {
  const a = el("a", klase, teksts);
  a.href = href;
  return a;
};

function isaVesture(ass, href) {
  const ol = ass.cloneNode(false);
  const visi = [...ass.children];
  const sakums = visi.find((li) => li.classList.contains("la-sakums"));
  const ieraksti = visi.filter((li) => li !== sakums);
  for (const li of ieraksti.slice(0, VESTURES_MAX)) {
    const k = li.cloneNode(true);
    // Balsojuma tabula un „Attiecas arī uz” — tikai pilnajā lapā.
    k.querySelectorAll(".balsojums, .la-citi").forEach((x) => x.remove());
    ol.append(k);
  }
  const atlikusi = ieraksti.length - VESTURES_MAX;
  if (atlikusi > 0) {
    const li = el("li", "la-vel");
    li.append(saite(`${href}#laika-ass`, `Vēl ${atlikusi} ${atlikusi === 1 ? "ieraksts" : "ieraksti"} pilnajā lapā`));
    ol.append(li);
  }
  if (sakums) ol.append(sakums.cloneNode(true));
  return ol;
}

/** Paneļa saturs no Solījuma lapas dokumenta. */
export function panelaSaturs(doc, href) {
  const d = Object.fromEntries(Object.entries(PANELA_DALAS).map(([k, s]) => [k, doc.querySelector(s)]));
  const frag = document.createDocumentFragment();

  const galva = el("div", "panelis-galva");
  const sar = el("p", "mono vajs");
  // Ceļš: „Solījumi › JV · Jaunā VIENOTĪBA” → tikai saraksts (no saīsinājuma līdz beigām).
  for (let n = d.cels?.querySelector("abbr"); n; n = n.nextSibling) sar.append(n.cloneNode(true));
  const aizvert = el("button", "panelis-aizvert");
  aizvert.type = "button";
  aizvert.dataset.k = "aizvert";
  aizvert.setAttribute("aria-label", "Aizvērt");
  aizvert.innerHTML = '<span aria-hidden="true">×</span>';
  galva.append(sar, aizvert);

  const h2 = el("h2", "panelis-virsraksts");
  h2.tabIndex = -1;
  h2.append(saite(href, d.virsraksts?.textContent ?? ""));

  frag.append(galva, h2);
  if (d.citats) frag.append(d.citats.cloneNode(true));
  if (d.josla) frag.append(d.josla.cloneNode(true));
  if (d.laikaAss) {
    frag.append(el("h3", "lbl", doc.getElementById("laika-ass")?.textContent ?? "Notikumi"), isaVesture(d.laikaAss, href));
  }
  const pilna = el("p", "panelis-pilna");
  pilna.append(saite(href, "Atvērt pilno solījuma lapu"));
  frag.append(pilna);
  return { saturs: frag, virsraksts: doc.title };
}

/** Ielādē Solījuma lapu un atgriež paneļa saturu. */
export async function ieladetPaneli(href, signal) {
  const atb = await fetch(href, { signal });
  if (!atb.ok) throw new Error(`${href}: ${atb.status}`);
  const doc = new DOMParser().parseFromString(await atb.text(), "text/html");
  return panelaSaturs(doc, href);
}
