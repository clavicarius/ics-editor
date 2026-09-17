/// <reference types="vitest" />
import { defineConfig } from "vite";

// For GitHub Pages the site is served from https://<user>.github.io/ics-editor/
// so the base path must match the repository name. Override via VITE_BASE if the
// deployment target differs (e.g. a custom domain served from root).
const base = process.env.VITE_BASE ?? "/ics-editor/";

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.1.0"),
  },
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
