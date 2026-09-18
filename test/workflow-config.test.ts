import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workflow configuration", () => {
  it("deploy workflow deploys only tag or manual builds", () => {
    const deployWorkflow = readFileSync(
      new URL("../.github/workflows/deploy.yml", import.meta.url),
      "utf8",
    );

    expect(deployWorkflow).not.toMatch(/push:\s*\n\s*branches:\s*\n\s*-\s*main/m);
    expect(deployWorkflow).toContain("if: github.event_name == 'workflow_dispatch' || startsWith(github.ref, 'refs/tags/v')");
  });

  it("versioning workflow keeps PR runs as dry-runs", () => {
    const versioningWorkflow = readFileSync(
      new URL("../.github/workflows/versioning.yml", import.meta.url),
      "utf8",
    );

    expect(versioningWorkflow).toContain("if: github.event_name == 'pull_request'");
    expect(versioningWorkflow).toContain("if: >-");
    expect(versioningWorkflow).toContain("github.event_name == 'push' &&");
  });
});
