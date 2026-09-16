/**
 * RFC 5545 line folding.
 *
 * Lines longer than 75 octets SHOULD be folded. A fold inserts CRLF followed by
 * a single space. Folding must not split a multi-octet UTF-8 sequence, so we
 * count octets and only break on UTF-8 character boundaries.
 */

const MAX_OCTETS = 75;

/** Number of UTF-8 octets for a single JS code point. */
function octetLen(codePoint: number): number {
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
}

/**
 * Fold a single logical line into one or more physical lines joined by
 * CRLF + space. The continuation octet (the leading space) counts toward the
 * 75-octet limit of the continuation line.
 */
export function foldLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let currentOctets = 0;
  let isContinuation = false;

  const pushCurrent = () => {
    out.push(current);
    current = "";
    currentOctets = 0;
  };

  for (const ch of line) {
    const cp = ch.codePointAt(0)!;
    const len = octetLen(cp);
    // On a continuation line one octet is already used by the leading space.
    const limit = isContinuation ? MAX_OCTETS - 1 : MAX_OCTETS;
    if (currentOctets + len > limit) {
      pushCurrent();
      isContinuation = true;
      current = " ";
      currentOctets = 1;
    }
    current += ch;
    currentOctets += len;
  }
  pushCurrent();
  return out;
}
