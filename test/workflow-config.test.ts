import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workflow configuration", () => {
  it("deploy workflow deploys only tag, manual, or workflow_call builds", () => {
    const deployWorkflow = readFileSync(
      new URL("../.github/workflows/deploy.yml", import.meta.url),
      "utf8",
    );

    expect(deployWorkflow).not.toMatch(/push:\s*\n\s*branches:\s*\n\s*-\s*main/m);
    expect(deployWorkflow).toContain("workflow_call:");
    expect(deployWorkflow).toContain(
      "if: github.event_name == 'workflow_dispatch' || github.event_name == 'workflow_call' || startsWith(github.ref, 'refs/tags/v')",
    );
  });

  it("versioning workflow keeps PR runs as dry-runs and calls deploy after publishing", () => {
    const versioningWorkflow = readFileSync(
      new URL("../.github/workflows/versioning.yml", import.meta.url),
      "utf8",
    );

    expect(versioningWorkflow).toContain("if: github.event_name == 'pull_request'");
    expect(versioningWorkflow).toContain("if: >-");
    expect(versioningWorkflow).toContain("github.event_name == 'push' &&");
    expect(versioningWorkflow).toContain("uses: ./.github/workflows/deploy.yml");
    expect(versioningWorkflow).toContain("needs.version.outputs.published == 'true'");
  });
});
