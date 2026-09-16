/**
 * Conversion helpers between iCalendar date/time raw values and the value
 * strings expected by native HTML pickers (<input type="date"> and
 * <input type="datetime-local">).
 *
 * These are intentionally string-only: no Date parsing, no timezone math. The
 * editor is lossless, so we only reshape the digits. Timezone information lives
 * in the TZID parameter (not in the value) and a trailing "Z" (UTC) marker is
 * preserved verbatim. Any seconds component is preserved as well, since
 * datetime-local pickers usually omit seconds.
 */

import type { DateTimeValue } from "../model/types.js";

export type PickerType = "date" | "datetime-local";

export interface PickerModel {
  type: PickerType;
  /** Empty string when the raw value cannot be interpreted. */
  value: string;
}

const DATE_RE = /^(\d{4})(\d{2})(\d{2})$/;
const DATETIME_RE = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/;

/**
 * Map an iCal date/time value to a picker type and value.
 * Returns an empty value if the raw string is not in a recognized form.
 */
export function icalToPickerValue(dtv: DateTimeValue): PickerModel {
  const raw = dtv.raw ?? "";

  if (dtv.isDate) {
    const m = DATE_RE.exec(raw);
    return { type: "date", value: m ? `${m[1]}-${m[2]}-${m[3]}` : "" };
  }

  const m = DATETIME_RE.exec(raw);
  if (m) {
    return {
      type: "datetime-local",
      value: `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`,
    };
  }

  // Fallback: an all-day style value without VALUE=DATE flag.
  const d = DATE_RE.exec(raw);
  if (d) return { type: "date", value: `${d[1]}-${d[2]}-${d[3]}` };

  return { type: "datetime-local", value: "" };
}

/**
 * Convert a picker value back to an iCal raw value, preserving the original
 * seconds component and a trailing "Z" (UTC) marker from `prev.raw`.
 * Returns `prev.raw` unchanged for empty or malformed picker input, so partial
 * edits never corrupt the stored value.
 */
export function pickerToIcal(pickerValue: string, prev: DateTimeValue): string {
  const value = (pickerValue ?? "").trim();
  if (value === "") return prev.raw;

  if (prev.isDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m ? `${m[1]}${m[2]}${m[3]}` : prev.raw;
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) return prev.raw;

  const [, y, mo, d, h, mi, secFromPicker] = m;
  const seconds = secFromPicker ?? previousSeconds(prev.raw) ?? "00";
  const suffix = prev.isUtc || /Z$/.test(prev.raw) ? "Z" : "";
  return `${y}${mo}${d}T${h}${mi}${seconds}${suffix}`;
}

/** Extract the seconds digits from an iCal date-time raw value, if present. */
function previousSeconds(raw: string): string | undefined {
  const m = DATETIME_RE.exec(raw ?? "");
  return m?.[6];
}
