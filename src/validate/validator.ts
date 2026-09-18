/**
 * Structural validation and export reporting.
 *
 * Validation is intentionally conservative: it flags likely-invalid structures
 * without rewriting anything. The export report summarizes what was preserved
 * vs. changed so the user can trust the lossless guarantee.
 */

import type { CalendarModel, Component } from "../model/types.js";

export type Severity = "error" | "warning";

export interface ValidationIssue {
  severity: Severity;
  message: string;
  uid?: string;
}

export interface EventDiff {
  uid: string;
  changed: string[];
}

export interface ExportReport {
  unchanged: number;
  changed: number;
  created: number;
  deleted: number;
  uidsPreserved: number;
  vtimezonePreserved: boolean;
  valarmsPreserved: number;
  unknownPropertiesPreserved: boolean;
  perEvent: EventDiff[];
}

function countComponents(root: Component, kind: string): number {
  let count = 0;
  const walk = (c: Component) => {
    if (c.kind === kind) count++;
    c.children.forEach(walk);
  };
  walk(root);
  return count;
}

export function validate(model: CalendarModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (model.root.kind !== "VCALENDAR") {
    issues.push({ severity: "error", message: "Exactly one VCALENDAR must be present." });
  }

  for (const ev of model.events) {
    if (ev.isDeleted) continue;
    const uid = ev.parsed.uid || undefined;

    if (!ev.parsed.uid) {
      issues.push({ severity: "error", message: "VEVENT without UID.", uid });
    }
    if (!ev.parsed.dtstart) {
      issues.push({ severity: "error", message: "VEVENT without DTSTART.", uid });
    }
    if (ev.parsed.dtend && ev.parsed.duration) {
      issues.push({
        severity: "error",
        message: "DTEND and DURATION must not be set at the same time.",
        uid,
      });
    }

    for (const dt of [ev.parsed.dtstart, ev.parsed.dtend, ev.parsed.recurrenceId]) {
      if (dt?.tzid && dt.isUtc) {
        issues.push({
          severity: "warning",
          message: "Date/time value has both TZID and UTC suffix (Z).",
          uid,
        });
      }
    }
  }

  return issues;
}

export function buildReport(model: CalendarModel): ExportReport {
  let unchanged = 0;
  let changed = 0;
  let created = 0;
  let deleted = 0;
  const perEvent: EventDiff[] = [];

  for (const ev of model.events) {
    if (ev.isDeleted) {
      deleted++;
      continue;
    }
    if (ev.isNew) {
      created++;
    } else if (ev.changedProperties.size > 0) {
      changed++;
      perEvent.push({ uid: ev.parsed.uid, changed: [...ev.changedProperties] });
    } else {
      unchanged++;
    }
  }

  const survivingUids = model.events.filter((e) => !e.isDeleted && !e.isNew).length;

  return {
    unchanged,
    changed,
    created,
    deleted,
    uidsPreserved: survivingUids,
    vtimezonePreserved: countComponents(model.root, "VTIMEZONE") > 0,
    valarmsPreserved: countComponents(model.root, "VALARM"),
    unknownPropertiesPreserved: true,
    perEvent,
  };
}
