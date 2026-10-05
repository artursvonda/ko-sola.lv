// Kopīgi DOM palīgi Web Components.

/** Kreisās pogas klikšķis bez modifikatoriem (Ctrl/⌘/Shift/Alt klikšķis paliek pārlūkam: jauna cilne u. tml.). */
export const parastsKlikskis = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** `aria-current="true"` elementam, ja `ir`; citādi noņem. */
export function iezimetAktualo(el, ir) {
  if (ir) el.setAttribute("aria-current", "true");
  else el.removeAttribute("aria-current");
}
