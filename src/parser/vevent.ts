/**
 * Interpret a VEVENT component into the editable `ParsedEvent` view.
 *
 * This never mutates or drops raw data — it only reads properties to populate
 * a convenience structure. Anything unknown remains available via
 * `component.properties` / `component.rawLines`.
 */

import type {
  Component,
  DateTimeValue,
  ParsedEvent,
  VEvent,
  ContentLine,
} from "../model/types.js";

function firstParam(line: ContentLine, key: string): string | undefined {
  return line.parameters[key]?.[0];
}

function toDateTime(line: ContentLine): DateTimeValue {
  const value = line.value.trim();
  const valueType = firstParam(line, "VALUE");
  return {
    raw: value,
    isDate: valueType === "DATE" || /^\d{8}$/.test(value),
    isUtc: value.endsWith("Z"),
    tzid: firstParam(line, "TZID"),
  };
}

export function parseVEvent(component: Component): VEvent {
  const parsed: ParsedEvent = {
    uid: "",
    categories: [],
    rrule: [],
    rdate: [],
    exdate: [],
    attendees: [],
  };

  for (const p of component.properties) {
    switch (p.name) {
      case "UID":
        parsed.uid = p.value;
        break;
      case "SUMMARY":
        parsed.summary = p.value;
        break;
      case "DESCRIPTION":
        parsed.description = p.value;
        break;
      case "LOCATION":
        parsed.location = p.value;
        break;
      case "STATUS":
        parsed.status = p.value;
        break;
      case "CLASS":
        parsed.class = p.value;
        break;
      case "TRANSP":
        parsed.transp = p.value;
        break;
      case "SEQUENCE":
        parsed.sequence = Number(p.value);
        break;
      case "DTSTART":
        parsed.dtstart = toDateTime(p);
        break;
      case "DTEND":
        parsed.dtend = toDateTime(p);
        break;
      case "DURATION":
        parsed.duration = p.value;
        break;
      case "RRULE":
        parsed.rrule.push(p.value);
        break;
      case "RDATE":
        parsed.rdate.push(p.value);
        break;
      case "EXDATE":
        parsed.exdate.push(p.value);
        break;
      case "RECURRENCE-ID":
        parsed.recurrenceId = toDateTime(p);
        break;
      case "CATEGORIES":
        parsed.categories.push(...p.value.split(",").map((s) => s.trim()).filter(Boolean));
        break;
      case "ORGANIZER":
        parsed.organizer = p.value;
        break;
      case "ATTENDEE":
        parsed.attendees.push(p.value);
        break;
      case "X-ALT-DESC":
        if (firstParam(p, "FMTTYPE") === "text/html") parsed.altDescHtml = p.value;
        break;
      default:
        // Unknown/other properties remain accessible via component.properties.
        break;
    }
  }

  return {
    component,
    parsed,
    changedProperties: new Set<string>(),
    isNew: false,
    isDeleted: false,
  };
}
