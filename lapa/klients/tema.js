// Izvēlētā Tēma no query (?tema=<slug>); tikai zināmi slugi, citādi null (rāda visas tēmas).
import { nolasitParametru } from "./parametri.js";

export const izveletaTema = (search, slugi) => nolasitParametru(search, "tema", new Set(slugi));
