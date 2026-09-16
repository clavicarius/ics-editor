/**
 * Line-ending normalization and RFC 5545 line unfolding.
 *
 * We keep two representations:
 *  - `physical`: the raw physical lines exactly as they appeared (used for
 *    lossless re-emit of unchanged content).
 *  - `logical`: unfolded logical lines with an index back into the physical
 *    lines, so a property can carry its original folded representation.
 */

export interface LogicalLine {
  /** The unfolded logical text (continuations joined). */
  text: string;
  /** Indices into the physical lines array that make up this logical line. */
  physicalIndices: number[];
}

export interface UnfoldResult {
  physical: string[];
  logical: LogicalLine[];
  /** Detected dominant end-of-line sequence. */
  eol: string;
  hadTrailingNewline: boolean;
}

/** Detect the dominant EOL. Prefers CRLF, then CR, then LF. */
function detectEol(input: string): string {
  if (input.includes("\r\n")) return "\r\n";
  if (input.includes("\r")) return "\r";
  return "\n";
}

/**
 * Split into physical lines accepting CRLF, LF and lone CR. The split is done
 * manually (not via a single regex on the whole string) so we can faithfully
 * report a trailing newline.
 */
function splitPhysical(input: string): { lines: string[]; trailing: boolean } {
  const lines: string[] = [];
  let current = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\n") {
      lines.push(current);
      current = "";
    } else if (ch === "\r") {
      // Handle CRLF as one break; lone CR also breaks.
      lines.push(current);
      current = "";
      if (input[i + 1] === "\n") i++;
    } else {
      current += ch;
    }
  }
  const trailing = current.length === 0 && input.length > 0;
  if (current.length > 0) lines.push(current);
  return { lines, trailing };
}

/**
 * Unfold physical lines into logical lines. A physical line that starts with a
 * space or horizontal tab is a continuation of the previous logical line; the
 * single leading whitespace octet is removed per RFC 5545.
 */
export function unfold(input: string): UnfoldResult {
  const eol = detectEol(input);
  const { lines: physical, trailing } = splitPhysical(input);
  const logical: LogicalLine[] = [];

  for (let i = 0; i < physical.length; i++) {
    const line = physical[i];
    const isContinuation = line.length > 0 && (line[0] === " " || line[0] === "\t");
    if (isContinuation && logical.length > 0) {
      const prev = logical[logical.length - 1];
      prev.text += line.slice(1);
      prev.physicalIndices.push(i);
    } else {
      logical.push({ text: line, physicalIndices: [i] });
    }
  }

  return { physical, logical, eol, hadTrailingNewline: trailing };
}
