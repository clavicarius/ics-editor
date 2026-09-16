/**
 * Core data model for the lossless ICS editor.
 *
 * Every component and property is kept in two forms:
 *  - `rawLines`: the exact original physical lines (including folding and CRLF
 *    stripped to `\n` only at the transport boundary). Used to re-emit unchanged
 *    content byte-for-byte.
 *  - interpreted fields: a convenience view used by the UI and for patching.
 *
 * The invariant that makes the editor "lossless": if a component is not marked
 * dirty, it is serialized from `rawLines` untouched.
 */

/** A single parsed content line, e.g. `DTSTART;TZID=Europe/Berlin:20261224T231500`. */
export interface ContentLine {
  /** Property name in upper case, e.g. `DTSTART`. */
  name: string;
  /**
   * Parameters as ordered multimap. iCalendar allows repeated parameter names
   * and multi-valued parameters, so values are arrays and insertion order is
   * preserved via `parameterOrder`.
   */
  parameters: Record<string, string[]>;
  /** Original parameter key order, to re-emit parameters faithfully. */
  parameterOrder: string[];
  /** The raw (unescaped-at-transport, still ical-escaped) value string. */
  value: string;
  /**
   * The exact original physical lines for this property, including any
   * continuation (folded) lines. When the property is unchanged these are
   * emitted verbatim.
   */
  rawLines: string[];
}

/** A calendar component: VCALENDAR, VEVENT, VALARM, VTIMEZONE, STANDARD, ... */
export interface Component {
  /** Component kind in upper case, e.g. `VEVENT`. */
  kind: string;
  /** Exact original lines for the whole block, including BEGIN/END. */
  rawLines: string[];
  /** Interpreted properties in original order. */
  properties: ContentLine[];
  /** Child components in original order. */
  children: Component[];
  /**
   * When true, the serializer must rebuild this block from `properties` and
   * `children` (patching only changed properties). When false, emit `rawLines`.
   */
  dirty: boolean;
}

/** Interpreted date/time value attached to DTSTART/DTEND/etc. */
export interface DateTimeValue {
  /** Raw value exactly as stored, e.g. `20261224T231500` or `20261225`. */
  raw: string;
  /** True when the property carried `VALUE=DATE` (all-day). */
  isDate: boolean;
  /** True when the value ends in `Z` (UTC). */
  isUtc: boolean;
  /** TZID parameter if present, e.g. `Europe/Berlin`. */
  tzid?: string;
}

/** Interpreted, editable view of a VEVENT. Raw access via `component`. */
export interface ParsedEvent {
  uid: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  class?: string;
  transp?: string;
  sequence?: number;
  categories: string[];
  dtstart?: DateTimeValue;
  dtend?: DateTimeValue;
  duration?: string;
  rrule: string[];
  rdate: string[];
  exdate: string[];
  recurrenceId?: DateTimeValue;
  organizer?: string;
  attendees: string[];
  /** HTML alternative description (X-ALT-DESC;FMTTYPE=text/html). */
  altDescHtml?: string;
}

/** Editor wrapper around a VEVENT component. */
export interface VEvent {
  /** Raw component access — source of truth for lossless export. */
  component: Component;
  /** Interpreted convenience view. */
  parsed: ParsedEvent;
  /** Names of properties changed via the UI (drives selective patching). */
  changedProperties: Set<string>;
  isNew: boolean;
  isDeleted: boolean;
}

/** Top-level parsed calendar. */
export interface CalendarModel {
  /** The VCALENDAR component tree (unchanged unless edited). */
  root: Component;
  /** Convenience index of editable events (subset of root.children). */
  events: VEvent[];
  /** Original line ending detected on import (`\r\n` | `\n` | `\r`). */
  originalEol: string;
  /** True if the file ended with a trailing newline. */
  hadTrailingNewline: boolean;
}

export const KNOWN_EVENT_PROPERTIES = new Set<string>([
  "UID",
  "DTSTART",
  "DTEND",
  "DURATION",
  "RRULE",
  "RDATE",
  "EXDATE",
  "RECURRENCE-ID",
  "SUMMARY",
  "DESCRIPTION",
  "LOCATION",
  "STATUS",
  "CLASS",
  "TRANSP",
  "SEQUENCE",
  "CREATED",
  "DTSTAMP",
  "LAST-MODIFIED",
  "CATEGORIES",
  "ORGANIZER",
  "ATTENDEE",
]);
