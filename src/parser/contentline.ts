/**
 * RFC 5545 content line parser.
 *
 * A content line has the shape:
 *   name *(";" param) ":" value
 *   param = param-name "=" param-value *("," param-value)
 *   param-value = paramtext / quoted-string
 *
 * We must NOT naively split on ";" or ":" because parameter values may be
 * quoted and contain those characters. This is a small state machine.
 */

import type { ContentLine } from "../model/types.js";

export function parseContentLine(text: string, rawLines: string[]): ContentLine {
  let i = 0;
  const n = text.length;

  // 1) name: up to first ';' or ':'
  let name = "";
  while (i < n && text[i] !== ";" && text[i] !== ":") {
    name += text[i++];
  }

  const parameters: Record<string, string[]> = {};
  const parameterOrder: string[] = [];

  // 2) parameters (while we see ';')
  while (i < n && text[i] === ";") {
    i++; // consume ';'
    let paramName = "";
    while (i < n && text[i] !== "=" && text[i] !== ";" && text[i] !== ":") {
      paramName += text[i++];
    }
    const values: string[] = [];
    if (text[i] === "=") {
      i++; // consume '='
      // one or more comma-separated values, each possibly quoted
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let value = "";
        if (text[i] === '"') {
          i++; // opening quote
          while (i < n && text[i] !== '"') value += text[i++];
          if (text[i] === '"') i++; // closing quote
        } else {
          while (i < n && text[i] !== "," && text[i] !== ";" && text[i] !== ":") {
            value += text[i++];
          }
        }
        values.push(value);
        if (text[i] === ",") {
          i++;
          continue;
        }
        break;
      }
    }
    const key = paramName.toUpperCase();
    if (!parameters[key]) {
      parameters[key] = [];
      parameterOrder.push(key);
    }
    parameters[key].push(...values);
  }

  // 3) value: everything after ':'
  let value = "";
  if (text[i] === ":") {
    i++;
    value = text.slice(i);
  }

  return {
    name: name.toUpperCase(),
    parameters,
    parameterOrder,
    value,
    rawLines: [...rawLines],
  };
}
