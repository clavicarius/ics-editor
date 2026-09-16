/**
 * Lossless serialization of the calendar model back to an ICS string.
 *
 * Strategy (the heart of the editor):
 *  - A component that is not `dirty` is emitted from its `rawLines` verbatim.
 *  - A `dirty` component is rebuilt from its properties/children, but each
 *    *unchanged* property is still emitted from its own `rawLines`, so only the
 *    properties the user actually touched get re-serialized.
 *  - Deleted VEVENTs are skipped entirely.
 *
 * The `changedProperties` set on a VEvent tells us which property names must be
 * re-rendered. Everything else is copied byte-for-byte.
 */

import type { CalendarModel, Component } from "../model/types.js";
import { serializeContentLine } from "./serialize.js";

export interface SerializeOptions {
  /** End of line to use. Defaults to CRLF per RFC 5545. */
  eol?: string;
  /** Emit a trailing newline. Defaults to true. */
  trailingNewline?: boolean;
}

function emitComponent(
  component: Component,
  changedByComponent: Map<Component, Set<string>>,
  deleted: Set<Component>,
  out: string[],
): void {
  if (deleted.has(component)) return;

  if (!component.dirty) {
    out.push(...component.rawLines);
    return;
  }

  const changed = changedByComponent.get(component) ?? new Set<string>();

  out.push(`BEGIN:${component.kind}`);
  for (const prop of component.properties) {
    if (changed.has(prop.name)) {
      out.push(...serializeContentLine(prop));
    } else {
      out.push(...prop.rawLines);
    }
  }
  for (const child of component.children) {
    emitComponent(child, changedByComponent, deleted, out);
  }
  out.push(`END:${component.kind}`);
}

export function serializeCalendar(
  model: CalendarModel,
  options: SerializeOptions = {},
): string {
  const eol = options.eol ?? "\r\n";
  const trailingNewline = options.trailingNewline ?? true;

  // Map component -> changed property names, and collect deleted components.
  const changedByComponent = new Map<Component, Set<string>>();
  const deleted = new Set<Component>();
  let rebuildRoot = false;
  for (const ev of model.events) {
    if (ev.isDeleted) {
      deleted.add(ev.component);
      rebuildRoot = true;
    }
    if (ev.changedProperties.size > 0 || ev.isNew) {
      ev.component.dirty = true;
      changedByComponent.set(ev.component, ev.changedProperties);
      rebuildRoot = true;
    }
  }
  // Parent VCALENDAR otherwise emits rawLines verbatim and would ignore child edits.
  if (rebuildRoot) model.root.dirty = true;

  const out: string[] = [];
  emitComponent(model.root, changedByComponent, deleted, out);

  let text = out.join(eol);
  if (trailingNewline) text += eol;
  return text;
}
