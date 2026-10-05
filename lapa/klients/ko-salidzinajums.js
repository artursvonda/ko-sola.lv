// <ko-salidzinajums>: progresīvais uzlabojums /salidzinajums/ lapai (light DOM).
// Bez JS visas tēmas ir lapā un saites ved uz #enkuru; ar JS ?tema= rāda tikai izvēlēto tēmu un iezīmē tās kolonnu.
import { izveletaTema } from "./tema.js";

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
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
    const tema = izveletaTema(a.search, this.slugi);
    if (!tema) return;
    e.preventDefault();
    history.pushState(null, "", a.href);
    this.radit(tema, { ritinat: true, fokuss: true });
  }

  radit(tema, { ritinat, fokuss = false }) {
    for (const s of this.sadalas) s.hidden = tema !== null && s.dataset.tema !== tema;
    for (const el of this.querySelectorAll(".matrica [data-tema]")) el.classList.toggle("izvelets", el.dataset.tema === tema);
    for (const a of this.querySelectorAll(".matrica thead a")) {
      if (a.closest("[data-tema]").dataset.tema === tema) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
    const sadala = tema && this.sadalas.find((s) => s.dataset.tema === tema);
    if (!sadala) return;
    if (fokuss) {
      // Kā enkura saitei: nākamais Tab turpina no izvēlētās tēmas.
      sadala.tabIndex = -1;
      sadala.focus({ preventScroll: true });
    }
    const { top } = sadala.getBoundingClientRect();
    if (ritinat && (top < 0 || top > innerHeight * 0.75)) sadala.scrollIntoView({ block: "start" });
  }
}

customElements.define("ko-salidzinajums", KoSalidzinajums);
