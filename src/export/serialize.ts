/**
 * Serialization of a ContentLine back into iCalendar text.
 *
 * Only used when a property/component is *changed*; unchanged content is
 * emitted from its stored `rawLines`.
 */

import type { ContentLine } from "../model/types.js";
import { foldLine } from "./fold.js";

/** Quote a parameter value if it contains characters that require quoting. */
function encodeParamValue(value: string): string {
  if (/[";:,]/.test(value)) {
    return '"' + value.replace(/"/g, "") + '"';
  }
  return value;
}

/** Render a single content line (unfolded), e.g. `SUMMARY;X=Y:value`. */
export function renderContentLine(line: ContentLine): string {
  let out = line.name;
  for (const key of line.parameterOrder) {
    const values = line.parameters[key] ?? [];
    out += ";" + key + "=" + values.map(encodeParamValue).join(",");
  }
  out += ":" + line.value;
  return out;
}

/** Render + fold a content line into physical lines. */
export function serializeContentLine(line: ContentLine): string[] {
  return foldLine(renderContentLine(line));
}
