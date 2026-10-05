// HTML šabloni kā tagged template: vērtības tiek escapētas, ja vien tās nav jau html`` vai raw().
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

class Html {
  constructor(teksts) {
    this.teksts = teksts;
  }
  toString() {
    return this.teksts;
  }
}

export const raw = (teksts) => new Html(String(teksts));

const vertiba = (v) => {
  if (v == null || v === false) return "";
  if (v instanceof Html) return v.teksts;
  if (Array.isArray(v)) return v.map(vertiba).join("");
  return String(v).replace(/[&<>"']/g, (z) => ESC[z]);
};

export function html(dalas, ...vertibas) {
  return new Html(dalas.reduce((acc, d, i) => acc + vertiba(vertibas[i - 1]) + d));
}
