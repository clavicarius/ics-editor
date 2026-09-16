/** Parser entrypoint: string -> CalendarModel. */

import type { CalendarModel, VEvent } from "../model/types.js";
import { unfold } from "./unfold.js";
import { buildTree } from "./tree.js";
import { parseVEvent } from "./vevent.js";

export function parseIcs(input: string): CalendarModel {
  const unfolded = unfold(input);
  const root = buildTree(unfolded);

  const events: VEvent[] = [];
  for (const child of root.children) {
    if (child.kind === "VEVENT") events.push(parseVEvent(child));
  }

  return {
    root,
    events,
    originalEol: unfolded.eol,
    hadTrailingNewline: unfolded.hadTrailingNewline,
  };
}

export { unfold } from "./unfold.js";
export { buildTree } from "./tree.js";
export { parseContentLine } from "./contentline.js";
export { parseVEvent } from "./vevent.js";
