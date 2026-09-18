/// <reference types="vitest" />
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

// For GitHub Pages the site is served from https://<user>.github.io/keepical/
// so the base path must match the repository name. Override via VITE_BASE if the
// deployment target differs (e.g. a custom domain served from root).
const base = process.env.VITE_BASE ?? "/keepical/";
const packageVersion = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version?: string;
};

function readGitValue(command: string): string | null {
  try {
    return execSync(command, {
      cwd: new URL(".", import.meta.url),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function resolveAppVersion(): string {
  return readGitValue("git describe --tags --exact-match") ?? packageVersion.version ?? "0.1.0";
}

function resolveCommitSha(): string {
  return readGitValue("git rev-parse --short HEAD") ?? "unknown";
}

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(resolveAppVersion()),
    __APP_COMMIT_SHA__: JSON.stringify(resolveCommitSha()),
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
