import { defineConfig } from "vite";
import { koLapas } from "./lapa/vite-plugin.js";

export default defineConfig({
  publicDir: "lapa/public",
  plugins: [koLapas()],
});
