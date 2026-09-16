/**
 * Build the component tree from unfolded logical lines.
 *
 * BEGIN:X / END:X pairs delimit components. Each component records the exact
 * original physical lines (including BEGIN/END and any folding) so it can be
 * re-emitted verbatim when unchanged. Unknown component kinds are preserved as
 * generic components.
 */

import type { Component } from "../model/types.js";
import { parseContentLine } from "./contentline.js";
import type { LogicalLine, UnfoldResult } from "./unfold.js";

class Cursor {
  index = 0;
  constructor(
    readonly logical: LogicalLine[],
    readonly physical: string[],
  ) {}
}

function physicalSlice(physical: string[], indices: number[]): string[] {
  return indices.map((i) => physical[i]);
}

function parseComponent(cur: Cursor, beginLine: LogicalLine): Component {
  const kind = beginLine.text.slice("BEGIN:".length).trim().toUpperCase();
  const raw: string[] = [...physicalSlice(cur.physical, beginLine.physicalIndices)];
  const properties: Component["properties"] = [];
  const children: Component[] = [];

  while (cur.index < cur.logical.length) {
    const line = cur.logical[cur.index];
    const upper = line.text.toUpperCase();

    if (upper.startsWith("BEGIN:")) {
      cur.index++; // consume BEGIN
      const child = parseComponent(cur, line);
      children.push(child);
      raw.push(...child.rawLines);
      continue;
    }

    if (upper.startsWith("END:")) {
      raw.push(...physicalSlice(cur.physical, line.physicalIndices));
      cur.index++; // consume END
      break;
    }

    // normal property line
    const rawLines = physicalSlice(cur.physical, line.physicalIndices);
    properties.push(parseContentLine(line.text, rawLines));
    raw.push(...rawLines);
    cur.index++;
  }

  return { kind, rawLines: raw, properties, children, dirty: false };
}

/**
 * Parse the top-level VCALENDAR. If the file contains stray lines outside a
 * VCALENDAR (rare, malformed), they are attached to a synthetic root's raw
 * lines to avoid data loss.
 */
export function buildTree(unfolded: UnfoldResult): Component {
  const cur = new Cursor(unfolded.logical, unfolded.physical);

  while (cur.index < cur.logical.length) {
    const line = cur.logical[cur.index];
    if (line.text.toUpperCase().startsWith("BEGIN:VCALENDAR")) {
      cur.index++;
      return parseComponent(cur, line);
    }
    cur.index++;
  }

  // No VCALENDAR found: return an empty synthetic root preserving nothing.
  return {
    kind: "VCALENDAR",
    rawLines: [],
    properties: [],
    children: [],
    dirty: false,
  };
}
