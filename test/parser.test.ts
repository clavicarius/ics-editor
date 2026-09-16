import { describe, it, expect } from "vitest";
import { parseContentLine } from "../src/parser/contentline.js";
import { unfold } from "../src/parser/unfold.js";
import { foldLine } from "../src/export/fold.js";

describe("parseContentLine", () => {
  it("splits name, params and value", () => {
    const cl = parseContentLine("DTSTART;TZID=Europe/Berlin:20261224T231500", []);
    expect(cl.name).toBe("DTSTART");
    expect(cl.parameters.TZID).toEqual(["Europe/Berlin"]);
    expect(cl.value).toBe("20261224T231500");
  });

  it("handles quoted parameter values containing ':' and ';'", () => {
    const cl = parseContentLine('ATTENDEE;CN="Doe; John: VIP":mailto:john@example.org', []);
    expect(cl.name).toBe("ATTENDEE");
    expect(cl.parameters.CN).toEqual(["Doe; John: VIP"]);
    expect(cl.value).toBe("mailto:john@example.org");
  });

  it("handles multi-valued parameters", () => {
    const cl = parseContentLine("X-FOO;VALS=a,b,c:x", []);
    expect(cl.parameters.VALS).toEqual(["a", "b", "c"]);
  });
});

describe("unfold", () => {
  it("joins continuation lines and strips one leading space", () => {
    const input = "DESCRIPTION:Hello\r\n World\r\n";
    const r = unfold(input);
    expect(r.logical[0].text).toBe("DESCRIPTION:HelloWorld");
    expect(r.eol).toBe("\r\n");
  });

  it("accepts LF-only input", () => {
    const r = unfold("A:1\nB:2\n");
    expect(r.logical.map((l) => l.text)).toEqual(["A:1", "B:2"]);
    expect(r.eol).toBe("\n");
  });
});

describe("foldLine", () => {
  it("does not fold short lines", () => {
    expect(foldLine("A:1")).toEqual(["A:1"]);
  });

  it("folds long lines at 75 octets with a leading space", () => {
    const long = "X:" + "a".repeat(200);
    const folded = foldLine(long);
    expect(folded.length).toBeGreaterThan(1);
    expect(folded[0].length).toBeLessThanOrEqual(75);
    for (let i = 1; i < folded.length; i++) {
      expect(folded[i].startsWith(" ")).toBe(true);
    }
  });
});
