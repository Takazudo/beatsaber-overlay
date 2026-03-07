import { defineConfig } from "vite";

export default defineConfig({
  base: "/beatsaber-overlay/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
