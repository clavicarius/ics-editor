import { describe, it, expect } from "vitest";
import { icalToPickerValue, pickerToIcal } from "../src/ui/datetime.js";
import type { DateTimeValue } from "../src/model/types.js";

function dtv(partial: Partial<DateTimeValue> & { raw: string }): DateTimeValue {
  return {
    isDate: false,
    isUtc: false,
    ...partial,
  };
}

describe("icalToPickerValue", () => {
  it("maps an all-day date to a date picker", () => {
    expect(icalToPickerValue(dtv({ raw: "20261224", isDate: true }))).toEqual({
      type: "date",
      value: "2026-12-24",
    });
  });

  it("maps a local date-time to datetime-local (dropping seconds)", () => {
    expect(icalToPickerValue(dtv({ raw: "20261224T231530" }))).toEqual({
      type: "datetime-local",
      value: "2026-12-24T23:15",
    });
  });

  it("maps a UTC date-time to datetime-local without the Z", () => {
    expect(icalToPickerValue(dtv({ raw: "20261224T221500Z", isUtc: true }))).toEqual({
      type: "datetime-local",
      value: "2026-12-24T22:15",
    });
  });

  it("returns empty value for unrecognized raw", () => {
    expect(icalToPickerValue(dtv({ raw: "garbage" })).value).toBe("");
  });
});

describe("pickerToIcal", () => {
  it("formats a date picker back to YYYYMMDD", () => {
    expect(pickerToIcal("2026-12-25", dtv({ raw: "20261224", isDate: true }))).toBe(
      "20261225",
    );
  });

  it("formats datetime-local back, defaulting seconds to 00", () => {
    expect(pickerToIcal("2026-12-24T23:15", dtv({ raw: "20261224T231500" }))).toBe(
      "20261224T231500",
    );
  });

  it("preserves the original seconds component", () => {
    expect(pickerToIcal("2026-12-24T23:15", dtv({ raw: "20261224T231545" }))).toBe(
      "20261224T231545",
    );
  });

  it("preserves a trailing Z (UTC)", () => {
    expect(
      pickerToIcal("2026-12-24T22:15", dtv({ raw: "20261224T220000Z", isUtc: true })),
    ).toBe("20261224T221500Z");
  });

  it("returns the previous raw for empty input", () => {
    expect(pickerToIcal("", dtv({ raw: "20261224T231500" }))).toBe("20261224T231500");
  });

  it("returns the previous raw for malformed input", () => {
    expect(pickerToIcal("not-a-date", dtv({ raw: "20261224T231500" }))).toBe(
      "20261224T231500",
    );
  });
});

describe("roundtrip raw -> picker -> raw", () => {
  const cases: DateTimeValue[] = [
    dtv({ raw: "20261224", isDate: true }),
    dtv({ raw: "20261224T231500" }),
    dtv({ raw: "20261224T231545" }),
    dtv({ raw: "20261224T221500Z", isUtc: true }),
    dtv({ raw: "20260106T180000", tzid: "Europe/Berlin" }),
  ];

  it.each(cases)("is stable for %o", (value) => {
    const picker = icalToPickerValue(value);
    expect(pickerToIcal(picker.value, value)).toBe(value.raw);
  });
});
