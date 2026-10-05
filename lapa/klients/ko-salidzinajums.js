// <ko-salidzinajums>: progresīvais uzlabojums /salidzinajums/ lapai (light DOM).
// Bez JS visas tēmas ir lapā un saites ved uz #enkuru; ar JS ?tema= rāda tikai izvēlēto tēmu un iezīmē tās kolonnu.
import { izveletaTema } from "./tema.js";
import { parastsKlikskis, iezimetAktualo } from "./dom.js";

class KoSalidzinajums extends HTMLElement {
  connectedCallback() {
    this.sadalas = [...this.querySelectorAll(".tema-sadala")];
    this.slugi = this.sadalas.map((s) => s.dataset.tema);
    this.addEventListener("click", this);
    window.addEventListener("popstate", this);
    this.radit(izveletaTema(location.search, this.slugi), { ritinat: location.hash !== "" });
  }

  disconnectedCallback() {
    window.removeEventListener("popstate", this);
  }

  handleEvent(e) {
    if (e.type === "popstate") return this.radit(izveletaTema(location.search, this.slugi), { ritinat: false });
    if (e.defaultPrevented || !parastsKlikskis(e)) return;
    const a = e.target.closest("a[href]");
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
    if (a.closest('[data-k="visas"]')) {
      // „Rādīt visas tēmas”: visas sadaļas; fokuss paliek pie līdz šim izvēlētās tēmas (saite pati paslēpjas).
      e.preventDefault();
      const bija = this.tema;
      history.pushState(null, "", a.href);
      this.radit(null, { ritinat: false });
      return this.uzSadalu(bija, { ritinat: true, fokuss: true });
    }
    const tema = izveletaTema(a.search, this.slugi);
    if (!tema) return;
    e.preventDefault();
    history.pushState(null, "", a.href);
    this.radit(tema, { ritinat: true, fokuss: true });
  }

  radit(tema, { ritinat, fokuss = false }) {
    this.tema = tema;
    for (const s of this.sadalas) s.hidden = tema !== null && s.dataset.tema !== tema;
    this.querySelector('[data-k="visas"]').hidden = tema === null;
    for (const el of this.querySelectorAll(".matrica [data-tema]")) el.classList.toggle("izvelets", el.dataset.tema === tema);
    for (const a of this.querySelectorAll(".matrica thead a")) iezimetAktualo(a, a.closest("[data-tema]").dataset.tema === tema);
    this.uzSadalu(tema, { ritinat, fokuss });
  }

  /** Ritina līdz tēmas sadaļai, ja tā nav redzama, un (ja `fokuss`) fokusē tās virsrakstu. */
  uzSadalu(tema, { ritinat, fokuss }) {
    const sadala = tema && this.sadalas.find((s) => s.dataset.tema === tema);
    if (!sadala) return;
    if (fokuss) {
      // Kā enkura saitei: nākamais Tab turpina no izvēlētās tēmas; fokuss uz virsrakstu (redzams ar :focus-visible).
      const virsraksts = sadala.querySelector("h2");
      virsraksts.tabIndex = -1;
      virsraksts.focus({ preventScroll: true });
    }
    const { top } = sadala.getBoundingClientRect();
    if (ritinat && (top < 0 || top > innerHeight * 0.75)) sadala.scrollIntoView({ block: "start" });
  }
}

customElements.define("ko-salidzinajums", KoSalidzinajums);
