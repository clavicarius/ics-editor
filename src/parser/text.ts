/**
 * RFC 5545 TEXT escaping helpers.
 *
 * These helpers are used for interpreted UI values. Raw lossless roundtrip
 * still relies on stored raw lines for unchanged properties.
 */
export function decodeIcalText(value: string): string {
  return value.replace(/\\([nN,;\\])/g, (_match, ch: string) => {
    if (ch === "n" || ch === "N") return "\n";
    return ch;
  });
}

export function encodeIcalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
