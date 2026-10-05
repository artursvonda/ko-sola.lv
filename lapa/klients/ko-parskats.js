// <ko-parskats>: pārskata (/) progresīvais uzlabojums. Statiskajā HTML redzamas visas rindas un nav filtru;
// komponents rāda filtrus, glabā stāvokli query parametros, slēpj rindas un pārrēķina skaitus.
// Platā ekrānā rindas klikšķis atver detaļu paneli ar pushState uz /solijumi/<id>/; citādi — parasta saite.
import "./parskats.css";
import { GRUPAS, nolasitFiltrus, atbilst, skaiti, progress, ierakstsNoDatiem, izvelesSaite } from "./filtri.js";
import { parskatsSaite } from "../lapas/saites.js";
import { ieladetPaneli } from "./panelis.js";

const SANU_FILTRI = "(min-width: 64rem)"; // filtri sānu kolonnā, vienmēr atvērti
const PANELIS = "(min-width: 75rem)"; // detaļu panelis blakus tabulai
const STAVOKLIS = "ko-parskats";

const parastsKlikskis = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

class KoParskats extends HTMLElement {
  connectedCallback() {
    this.rindas = [...this.querySelectorAll("tbody tr[data-id]")].map((tr) => ({ tr, r: ierakstsNoDatiem(tr.dataset) }));
    this.izveles = [...this.querySelectorAll("a[data-grupa]")];
    this.derigas = Object.fromEntries(
      GRUPAS.map((g) => [g, new Set(this.izveles.filter((a) => a.dataset.grupa === g && a.dataset.vertiba).map((a) => a.dataset.vertiba))]),
    );
    this.k = (k) => this.querySelector(`[data-k="${k}"]`);
    this.panelis = this.k("panelis");
    this.virsraksts = document.title;
    this.sanu = matchMedia(SANU_FILTRI);
    this.plats = matchMedia(PANELIS);

    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    this.sanu.addEventListener("change", this);
    window.addEventListener("popstate", this);

    this.atvere();
    this.atjaunot(nolasitFiltrus(location.search, this.derigas));
    history.replaceState(this.stavoklis(null), "");
  }

  disconnectedCallback() {
    this.sanu.removeEventListener("change", this);
    window.removeEventListener("popstate", this);
  }

  handleEvent(e) {
    if (e.type === "popstate") return this.vesture(e.state);
    if (e.type === "change") return this.atvere();
    if (e.type === "keydown") return e.key === "Escape" && this.atverts && this.aizvert();
    if (e.type === "click") return this.klikskis(e);
  }

  stavoklis(panelis) {
    return { [STAVOKLIS]: true, meklesana: parskatsSaite(this.filtri).slice(1), panelis };
  }

  /** Filtri: sānos vienmēr atvērti; šaurā ekrānā — aizvērta izvēlne. */
  atvere() {
    this.k("atvere").open = this.sanu.matches;
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
    if (!this.sanu.matches) this.k("atvere").open = false;
  }

  /** Atjauno rindas, progresu un skaitus pēc filtriem. */
  atjaunot(filtri) {
    this.filtri = filtri;
    const redzamas = [];
    for (const { tr, r } of this.rindas) {
      const ir = atbilst(r, filtri);
      tr.hidden = !ir;
      if (ir) redzamas.push(r);
    }
    this.k("tukss").hidden = redzamas.length > 0;

    const p = progress(redzamas);
    this.k("izpilditi").textContent = p.izpilditi;
    this.k("n").textContent = p.n;
    for (const el of this.querySelectorAll(".progress [data-statuss]")) {
      const n = p.skaits[el.dataset.statuss];
      if (el.classList.contains("seg")) {
        el.style.flexGrow = n;
        el.hidden = n === 0;
      } else el.querySelector('[data-k="skaits"]').textContent = n;
    }
    this.k("neparbaudami").hidden = p.neparbaudami === 0;
    this.k("neparbaudami-n").textContent = p.neparbaudami;

    const sk = skaiti(this.rindas.map((x) => x.r), filtri);
    const nosaukumi = [];
    for (const a of this.izveles) {
      const { grupa, vertiba } = a.dataset;
      const n = sk[grupa][vertiba] ?? 0;
      const izveleta = (filtri[grupa] ?? "") === vertiba;
      a.querySelector('[data-k="skaits"]').textContent = n;
      a.classList.toggle("nulle", n === 0);
      a.href = izvelesSaite(filtri, grupa, vertiba || null);
      if (izveleta) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      if (izveleta && (vertiba || grupa === "saraksts")) nosaukumi.push(a.dataset.nosaukums);
    }
    for (const el of this.querySelectorAll('[data-k="nosaukums"]')) el.textContent = nosaukumi.join(" · ");
  }

  get atverts() {
    return !this.panelis.hidden;
  }

  async atvert(id, href, { vesture = true } = {}) {
    if (vesture) history[this.atverts ? "replaceState" : "pushState"](this.stavoklis(id), "", href);
    this.iezimet(id);
    this.k("zona").classList.add("ar-paneli");
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
    this.k("zona").classList.remove("ar-paneli");
    this.iezimet(null);
    document.title = this.virsraksts;
    if (fokuss && id) this.querySelector(`tr[data-id="${CSS.escape(id)}"] .t-sol a`)?.focus({ preventScroll: true });
  }

  iezimet(id) {
    this.izvelets = id;
    for (const { tr } of this.rindas) {
      const ir = tr.dataset.id === id;
      tr.classList.toggle("izvelets", ir);
      const a = tr.querySelector(".t-sol a");
      if (ir) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  }

  /** „Atpakaļ”/„Uz priekšu” pārlūkā. */
  vesture(st) {
    const filtri = nolasitFiltrus(st?.[STAVOKLIS] ? st.meklesana : location.search, this.derigas);
    this.atjaunot(filtri);
    const id = st?.[STAVOKLIS] ? st.panelis : null;
    if (id && this.plats.matches) this.atvert(id, `/solijumi/${id}/`, { vesture: false });
    // Šaurā ekrānā paneļa nav: URL jau ir Solījuma lapa — ielādē to.
    else if (id) location.reload();
    else this.slegtPaneli({ fokuss: true });
  }
}

customElements.define("ko-parskats", KoParskats);
