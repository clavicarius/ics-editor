import { describe, expect, it, vi } from "vitest";
import { resolveAppVersionFromSources, resolveLocalVersionTag } from "../vite.config.js";

describe("version resolution", () => {
  it("prefers VITE_VERSION_TAG from CI over local fallbacks", () => {
    expect(resolveAppVersionFromSources("v1.2.3", "v1.2.2", "0.1.0")).toBe("v1.2.3");
  });

  it("uses a local full semantic tag outside CI", () => {
    expect(resolveAppVersionFromSources(undefined, "v2.0.1", "0.1.0")).toBe("v2.0.1");
  });

  it("falls back to package.json version when no tag is available", () => {
    expect(resolveAppVersionFromSources(undefined, null, "0.1.0")).toBe("0.1.0");
  });

  it("queries only full semantic tags on the current commit", () => {
    const readGit = vi.fn(() => "v1.2.3");
    expect(resolveLocalVersionTag(readGit)).toBe("v1.2.3");
    expect(readGit).toHaveBeenCalledWith("git tag --points-at HEAD --list 'v*.*.*' | sort -V | tail -n1");
  });
});
