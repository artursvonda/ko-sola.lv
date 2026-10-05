// <ko-parskats>: pārskata (/) progresīvais uzlabojums. Statiskajā HTML redzamas visas rindas un nav filtru;
// komponents rāda filtrus, glabā stāvokli query parametros, slēpj rindas un pārrēķina skaitus.
// Platā ekrānā rindas klikšķis atver detaļu paneli ar pushState uz /solijumi/<id>/; citādi — parasta saite.
import "./parskats.css";
import { GRUPAS, nolasitFiltrus, atbilst, skaiti, progress, ierakstsNoDatiem, izvelesSaite } from "./filtri.js";
import { parskatsSaite } from "../lapas/saites.js";
import { ieladetPaneli } from "./panelis.js";
import { parastsKlikskis, iezimetAktualo } from "./dom.js";

const SANU_FILTRI = "(min-width: 64rem)"; // filtri sānu kolonnā, vienmēr atvērti
const PANELIS = "(min-width: 75rem)"; // detaļu panelis blakus tabulai
const STAVOKLIS = "ko-parskats";

class KoParskats extends HTMLElement {
  connectedCallback() {
    this.rindas = [...this.querySelectorAll("tbody tr[data-id]")].map((tr) => ({ tr, ieraksts: ierakstsNoDatiem(tr.dataset) }));
    this.izveles = [...this.querySelectorAll("a[data-grupa]")];
    this.derigas = Object.fromEntries(
      GRUPAS.map((g) => [g, new Set(this.izveles.filter((a) => a.dataset.grupa === g && a.dataset.vertiba).map((a) => a.dataset.vertiba))]),
    );
    this.panelis = this.dala("panelis");
    this.virsraksts = document.title;
    this.sanu = matchMedia(SANU_FILTRI);
    this.plats = matchMedia(PANELIS);

    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    this.sanu.addEventListener("change", this);
    window.addEventListener("popstate", this);

    this.izkartotFiltrus();
    this.atjaunot(nolasitFiltrus(location.search, this.derigas));
    history.replaceState(this.stavoklis(null), "");
  }

  disconnectedCallback() {
    this.sanu.removeEventListener("change", this);
    window.removeEventListener("popstate", this);
  }

  handleEvent(e) {
    if (e.type === "popstate") return this.atjaunotNoVestures(e.state);
    if (e.type === "change") return this.izkartotFiltrus();
    if (e.type === "keydown") return e.key === "Escape" && this.atverts && this.aizvert();
    if (e.type === "click") return this.klikskis(e);
  }

  /** Komponenta daļa pēc `data-k`. */
  dala(nosaukums) {
    return this.querySelector(`[data-k="${nosaukums}"]`);
  }

  stavoklis(panelis) {
    return { [STAVOKLIS]: true, meklesana: parskatsSaite(this.filtri).slice(1), panelis };
  }

  /** Filtri: sānos vienmēr atvērti; šaurā ekrānā — aizvērta izvēlne. */
  izkartotFiltrus() {
    this.dala("atvere").open = this.sanu.matches;
  }

  klikskis(e) {
    if (!parastsKlikskis(e)) return;
    const izvele = e.target.closest("a[data-grupa]");
    if (izvele) {
      e.preventDefault();
      return this.izveleties(izvele.dataset.grupa, izvele.dataset.vertiba || null);
    }
    if (e.target.closest('[data-k="aizvert"]')) return this.aizvert();
    const tr = e.target.closest("tbody tr[data-id]");
    if (!tr) return;
    const saite = tr.querySelector(".t-sol a");
    const uzSaites = e.target.closest("a") === saite;
    // Cits elements rindā (piem., abbr) — tāpat kā saite; teksta atlasīšana nav klikšķis.
    if (!uzSaites && (e.target.closest("a") || String(getSelection()))) return;
    if (!this.plats.matches) {
      if (!uzSaites) saite.click();
      return;
    }
    e.preventDefault();
    this.atvert(tr.dataset.id, saite.getAttribute("href"));
  }

  izveleties(grupa, vertiba) {
    const filtri = { ...this.filtri, [grupa]: vertiba };
    const url = izvelesSaite(this.filtri, grupa, vertiba);
    const bijaAtverts = this.atverts;
    this.slegtPaneli();
    this.atjaunot(filtri);
    // No paneļa URL (/solijumi/<id>/) atpakaļ uz pārskatu — aizstāj, lai „Atpakaļ” neved uz paneli.
    history[bijaAtverts ? "replaceState" : "pushState"](this.stavoklis(null), "", url);
    if (!this.sanu.matches) this.dala("atvere").open = false;
  }

  /** Atjauno rindas, progresu un skaitus pēc filtriem. */
  atjaunot(filtri) {
    this.filtri = filtri;
    const redzamas = [];
    for (const { tr, ieraksts } of this.rindas) {
      const ir = atbilst(ieraksts, filtri);
      tr.hidden = !ir;
      if (ir) redzamas.push(ieraksts);
    }
    this.dala("tukss").hidden = redzamas.length > 0;

    const p = progress(redzamas);
    this.dala("izpilditi").textContent = p.izpilditi;
    this.dala("n").textContent = p.n;
    for (const el of this.querySelectorAll(".progress [data-statuss]")) {
      const n = p.skaits[el.dataset.statuss];
      if (el.classList.contains("seg")) {
        el.style.flexGrow = n;
        el.hidden = n === 0;
      } else el.querySelector('[data-k="skaits"]').textContent = n;
    }
    this.dala("neparbaudami").hidden = p.neparbaudami === 0;
    this.dala("neparbaudami-n").textContent = p.neparbaudami;

    const skaitiPec = skaiti(this.rindas.map((x) => x.ieraksts), filtri);
    const nosaukumi = [];
    for (const a of this.izveles) {
      const { grupa, vertiba } = a.dataset;
      const n = skaitiPec[grupa][vertiba] ?? 0;
      const izveleta = (filtri[grupa] ?? "") === vertiba;
      a.querySelector('[data-k="skaits"]').textContent = n;
      a.classList.toggle("nulle", n === 0);
      a.href = izvelesSaite(filtri, grupa, vertiba || null);
      iezimetAktualo(a, izveleta);
      if (izveleta && (vertiba || grupa === "saraksts")) nosaukumi.push(a.dataset.nosaukums);
    }
    for (const el of this.querySelectorAll('[data-k="nosaukums"]')) el.textContent = nosaukumi.join(" · ");
  }

  get atverts() {
    return !this.panelis.hidden;
  }

  async atvert(id, href, { mainitUrl = true } = {}) {
    if (mainitUrl) history[this.atverts ? "replaceState" : "pushState"](this.stavoklis(id), "", href);
    this.iezimet(id);
    this.dala("zona").classList.add("ar-paneli");
    this.panelis.hidden = false;
    this.panelis.setAttribute("aria-busy", "true");
    this.panelis.replaceChildren(Object.assign(document.createElement("p"), { className: "vajs", textContent: "Ielādē…" }));
    this.ieladesPartraukt?.abort();
    const ac = (this.ieladesPartraukt = new AbortController());
    try {
      const { saturs, virsraksts } = await ieladetPaneli(href, ac.signal);
      if (ac.signal.aborted) return;
      this.panelis.replaceChildren(saturs);
      document.title = virsraksts;
    } catch (err) {
      if (ac.signal.aborted) return;
      const p = Object.assign(document.createElement("p"), { textContent: "Neizdevās ielādēt. " });
      p.append(Object.assign(document.createElement("a"), { href, textContent: "Atvērt solījuma lapu" }));
      this.panelis.replaceChildren(p);
    }
    this.panelis.removeAttribute("aria-busy");
    (this.panelis.querySelector(".panelis-virsraksts") ?? this.panelis).focus({ preventScroll: true });
  }

  /** Aizver paneli: ja to atvēra ar pushState — „Atpakaļ” (popstate aizver), citādi URL uz pārskatu. */
  aizvert() {
    const id = history.state?.panelis;
    if (id) history.back();
    else {
      this.slegtPaneli({ fokuss: true });
      history.replaceState(this.stavoklis(null), "", parskatsSaite(this.filtri));
    }
  }

  slegtPaneli({ fokuss = false } = {}) {
    if (!this.atverts) return;
    const id = this.izvelets;
    this.ieladesPartraukt?.abort();
    this.panelis.hidden = true;
    this.panelis.replaceChildren();
    this.dala("zona").classList.remove("ar-paneli");
    this.iezimet(null);
    document.title = this.virsraksts;
    if (fokuss && id) this.querySelector(`tr[data-id="${CSS.escape(id)}"] .t-sol a`)?.focus({ preventScroll: true });
  }

  iezimet(id) {
    this.izvelets = id;
    for (const { tr } of this.rindas) {
      const ir = tr.dataset.id === id;
      tr.classList.toggle("izvelets", ir);
      iezimetAktualo(tr.querySelector(".t-sol a"), ir);
    }
  }

  /** „Atpakaļ”/„Uz priekšu” pārlūkā. */
  atjaunotNoVestures(stavoklis) {
    const savs = stavoklis?.[STAVOKLIS];
    this.atjaunot(nolasitFiltrus(savs ? stavoklis.meklesana : location.search, this.derigas));
    const id = savs ? stavoklis.panelis : null;
    if (id && this.plats.matches) this.atvert(id, `/solijumi/${id}/`, { mainitUrl: false });
    // Šaurā ekrānā paneļa nav: URL jau ir Solījuma lapa — ielādē to.
    else if (id) location.reload();
    else this.slegtPaneli({ fokuss: true });
  }
}

customElements.define("ko-parskats", KoParskats);
