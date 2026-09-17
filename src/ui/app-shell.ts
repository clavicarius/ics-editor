/**
 * Root Web Component: file open, event list, editor, export.
 *
 * Deliberately framework-free. Rendering is simple innerHTML with delegated
 * event handling; the amount of interactivity in the MVP does not justify a
 * virtual DOM. State lives in a single CalendarModel instance.
 */

import type { CalendarModel, DateTimeValue, VEvent } from "../model/types.js";
import { parseIcs } from "../parser/index.js";
import { encodeIcalText } from "../parser/text.js";
import { serializeCalendar } from "../export/index.js";
import { buildReport, validate } from "../validate/validator.js";
import { addEvent, deleteEvent, setEventProperty, DEFAULT_UID_SUFFIX } from "../model/calendar.js";
import { icalToPickerValue, pickerToIcal } from "./datetime.js";
import logoUrl from "../assets/ICS-editor-logo.png";

const appVersion = __APP_VERSION__;

function fmtWhen(ev: VEvent): string {
  const dt = ev.parsed.dtstart;
  if (!dt) return "—";
  const raw = dt.raw;
  if (dt.isDate && /^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} (ganztägig)`;
  }
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(raw);
  if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
  return raw;
}

export class AppShell extends HTMLElement {
  private model: CalendarModel | null = null;
  private fileName = "kalender.ics";
  private selected: VEvent | null = null;
  private uidSuffix = DEFAULT_UID_SUFFIX;
  private filter = { text: "", changedOnly: false, recurringOnly: false, alarmOnly: false };

  connectedCallback(): void {
    this.render();
  }

  private async openFile(file: File): Promise<void> {
    const text = await file.text();
    this.fileName = file.name;
    this.model = parseIcs(text);
    this.selected = null;
    this.render();
  }

  private export(): void {
    if (!this.model) return;
    const issues = validate(this.model).filter((i) => i.severity === "error");
    if (issues.length > 0) {
      const proceed = confirm(
        `Es gibt ${issues.length} Validierungsfehler:\n` +
          issues.map((i) => `- ${i.message}`).join("\n") +
          "\n\nTrotzdem exportieren?",
      );
      if (!proceed) return;
    }
    const text = serializeCalendar(this.model, {
      eol: "\r\n",
      trailingNewline: this.model.hadTrailingNewline,
    });
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.fileName;
    a.click();
    URL.revokeObjectURL(url);
    this.showReport();
  }

  private showReport(): void {
    if (!this.model) return;
    const r = buildReport(this.model);
    const el = this.querySelector("#report");
    if (!el) return;
    el.innerHTML = `<div class="report"><pre>Export erstellt

VEVENT unverändert: ${r.unchanged}
VEVENT geändert:    ${r.changed}
VEVENT neu:         ${r.created}
VEVENT gelöscht:    ${r.deleted}
UIDs unverändert:   ${r.uidsPreserved}
VTIMEZONE erhalten: ${r.vtimezonePreserved ? "ja" : "—"}
VALARM erhalten:    ${r.valarmsPreserved}
Unbekannte Properties erhalten: ${r.unknownPropertiesPreserved ? "ja" : "nein"}
${r.perEvent.map((d) => `\n${d.uid}\n  geändert: ${d.changed.join(", ")}`).join("")}</pre></div>`;
  }

  private visibleEvents(): VEvent[] {
    if (!this.model) return [];
    const q = this.filter.text.toLowerCase();
    return this.model.events.filter((ev) => {
      if (ev.isDeleted) return false;
      if (this.filter.changedOnly && ev.changedProperties.size === 0 && !ev.isNew) return false;
      if (this.filter.recurringOnly && ev.parsed.rrule.length === 0) return false;
      if (this.filter.alarmOnly && ev.component.children.every((c) => c.kind !== "VALARM")) return false;
      if (q) {
        const hay = `${ev.parsed.summary ?? ""} ${ev.parsed.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  private render(): void {
    const hasModel = !!this.model;
    this.innerHTML = `
      <div class="toolbar">
        <div class="brand">
          <img src="${logoUrl}" alt="" width="32" height="32" />
          <h1>ICS-Editor <small style="color:var(--muted)">verlustarm &amp; lokal</small></h1>
        </div>
        <input type="file" id="file" accept=".ics,text/calendar" />
        <button id="add" ${hasModel ? "" : "disabled"}>+ Termin</button>
        <button id="export" class="primary" ${hasModel ? "" : "disabled"}>Export</button>
      </div>
      ${
        hasModel
          ? `<div class="layout">
              <section class="panel">
                <div class="filters">
                  <input type="search" id="search" placeholder="Suche Titel/Ort…" value="${this.filter.text}" />
                  <label><input type="checkbox" id="f-changed" ${this.filter.changedOnly ? "checked" : ""}/> geändert</label>
                  <label><input type="checkbox" id="f-recurring" ${this.filter.recurringOnly ? "checked" : ""}/> Serie</label>
                  <label><input type="checkbox" id="f-alarm" ${this.filter.alarmOnly ? "checked" : ""}/> Alarm</label>
                </div>
                <div id="list"></div>
              </section>
              <section class="panel editor-panel">
                <div id="editor"></div>
                <div id="report"></div>
              </section>
             </div>`
          : `<div class="empty">Öffne eine <code>.ics</code>-Datei, um zu starten. Alles bleibt lokal im Browser.</div>`
      }
      <footer class="statusbar">
        <div class="statusbar-group">
          <span class="file-label">Datei:</span>
          <span class="file-name">${hasModel ? escapeHtml(this.fileName) : "Keine Datei geöffnet"}</span>
        </div>
        <div class="statusbar-group statusbar-version">
          <span class="file-label">Version:</span>
          <span>${escapeHtml(appVersion)}</span>
        </div>
      </footer>
    `;

    this.querySelector<HTMLInputElement>("#file")?.addEventListener("change", (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) void this.openFile(f);
    });
    this.querySelector("#export")?.addEventListener("click", () => this.export());
    this.querySelector("#add")?.addEventListener("click", () => this.onAdd());

    const bindFilter = (id: string, key: keyof typeof this.filter) =>
      this.querySelector<HTMLInputElement>(id)?.addEventListener("change", (e) => {
        (this.filter[key] as boolean) = (e.target as HTMLInputElement).checked;
        this.renderList();
      });
    bindFilter("#f-changed", "changedOnly");
    bindFilter("#f-recurring", "recurringOnly");
    bindFilter("#f-alarm", "alarmOnly");
    this.querySelector<HTMLInputElement>("#search")?.addEventListener("input", (e) => {
      this.filter.text = (e.target as HTMLInputElement).value;
      this.renderList();
    });

    if (hasModel) {
      this.renderList();
      this.renderEditor();
    }
  }

  private renderList(): void {
    const list = this.querySelector("#list");
    if (!list) return;
    const events = this.visibleEvents();
    if (events.length === 0) {
      list.innerHTML = `<div class="empty">Keine Termine.</div>`;
      return;
    }
    list.innerHTML = events
      .map((ev, i) => {
        const changed = ev.changedProperties.size > 0 || ev.isNew;
        const recurring = ev.parsed.rrule.length > 0 ? "↻" : "";
        const alarm = ev.component.children.some((c) => c.kind === "VALARM") ? "⏰" : "";
        const idx = this.model!.events.indexOf(ev);
        return `<div class="event-row ${changed ? "changed" : ""} ${ev === this.selected ? "selected" : ""}" data-idx="${idx}" data-i="${i}">
          <span class="when">${fmtWhen(ev)}</span>
          <span class="title">${escapeHtml(ev.parsed.summary ?? "(ohne Titel)")}</span>
          <span class="badges">${recurring} ${alarm} ${changed ? "•" : ""}</span>
        </div>`;
      })
      .join("");
    list.querySelectorAll<HTMLElement>(".event-row").forEach((row) => {
      row.addEventListener("click", () => {
        const idx = Number(row.dataset.idx);
        this.selected = this.model!.events[idx];
        this.renderList();
        this.renderEditor();
      });
    });
  }

  private renderEditor(): void {
    const editor = this.querySelector("#editor");
    if (!editor) return;
    const ev = this.selected;
    if (!ev) {
      editor.innerHTML = `<div class="empty">Termin auswählen, um Details zu bearbeiten.</div>`;
      return;
    }
    const p = ev.parsed;
    editor.innerHTML = `
      <div class="field"><label>UID (schreibgeschützt)</label><div class="readonly uid-value">${escapeHtml(p.uid)}</div></div>
      <div class="field"><label>Titel (SUMMARY)</label><input id="e-summary" value="${escapeHtml(p.summary ?? "")}" /></div>
      <div class="row2">
        ${renderDateTimeField("dtstart", "Beginn (DTSTART)", p.dtstart)}
        ${renderDateTimeField("dtend", "Ende (DTEND)", p.dtend)}
      </div>
      <div class="field"><label>Ort (LOCATION)</label><input id="e-location" value="${escapeHtml(p.location ?? "")}" /></div>
      <div class="field"><label>Beschreibung (DESCRIPTION)</label><textarea id="e-description" class="description-input" rows="4">${escapeHtml(p.description ?? "")}</textarea></div>

      <details ${p.rrule.length ? "open" : ""}>
        <summary>Wiederholung / Ausnahmen</summary>
        <div class="field"><label>RRULE (roh)</label><input id="e-rrule" value="${escapeHtml(p.rrule[0] ?? "")}" /></div>
        <div class="field"><label>EXDATE (roh)</label><input id="e-exdate" value="${escapeHtml(p.exdate.join(",") )}" readonly /></div>
      </details>

      <details>
        <summary>Rohdaten (${ev.component.properties.length} Properties)</summary>
        <pre style="white-space:pre-wrap">${escapeHtml(ev.component.properties.map((x) => x.rawLines.join("\\n") || `${x.name}:${x.value}`).join("\n"))}</pre>
      </details>

      <div style="display:flex; gap:0.5rem; margin-top:1rem;">
        <button id="e-delete" style="color:var(--danger)">Löschen</button>
        <span style="margin-left:auto; color:var(--muted)">${ev.changedProperties.size ? "geändert: " + [...ev.changedProperties].join(", ") : "unverändert"}</span>
      </div>
    `;

    const on = (id: string, name: string) =>
      this.querySelector<HTMLInputElement>(id)?.addEventListener("change", (e) => {
        const value = (e.target as HTMLInputElement).value;
        const rawValue =
          name === "SUMMARY" || name === "LOCATION" || name === "DESCRIPTION"
            ? encodeIcalText(value)
            : value;
        setEventProperty(ev, name, rawValue);
        // keep parsed view roughly in sync for the list rendering
        if (name === "SUMMARY") ev.parsed.summary = value;
        if (name === "LOCATION") ev.parsed.location = value;
        if (name === "DESCRIPTION") ev.parsed.description = value;
        this.renderList();
        this.renderEditor();
      });
    on("#e-summary", "SUMMARY");
    on("#e-location", "LOCATION");
    on("#e-description", "DESCRIPTION");
    on("#e-rrule", "RRULE");

    this.bindDateTimeField(ev, "dtstart", "DTSTART");
    this.bindDateTimeField(ev, "dtend", "DTEND");

    this.querySelector("#e-delete")?.addEventListener("click", () => {
      if (confirm("Diesen Termin löschen? Andere Termine bleiben unverändert.")) {
        deleteEvent(ev);
        this.selected = null;
        this.renderList();
        this.renderEditor();
      }
    });
  }

  private bindDateTimeField(ev: VEvent, key: "dtstart" | "dtend", name: "DTSTART" | "DTEND"): void {
    const input = this.querySelector<HTMLInputElement>(`#e-${key}`);
    const dtv = ev.parsed[key];
    if (!input || !dtv) return;
    input.addEventListener("change", () => {
      const newRaw = pickerToIcal(input.value, dtv);
      if (newRaw === dtv.raw) return;
      dtv.raw = newRaw;
      dtv.isUtc = newRaw.endsWith("Z");
      setEventProperty(ev, name, newRaw);
      const rawEl = this.querySelector(`#raw-${key}`);
      if (rawEl) rawEl.textContent = formatRawDateTime(dtv);
      this.renderList();
    });
  }

  private onAdd(): void {
    if (!this.model) return;
    const summary = prompt("Titel des neuen Termins?", "Neuer Termin");
    if (summary === null) return;
    const dtstart = prompt("DTSTART (z. B. 20261224T120000 oder 20261224 für ganztägig)?", "");
    if (!dtstart) return;
    const allDay = /^\d{8}$/.test(dtstart);
    const ev = addEvent(this.model, { summary, dtstart, allDay }, this.uidSuffix);
    this.selected = ev;
    this.render();
  }
}

function formatRawDateTime(dtv?: DateTimeValue): string {
  if (!dtv || !dtv.raw) return "—";
  let suffix = "";
  if (dtv.tzid) suffix = ` (${dtv.tzid})`;
  else if (dtv.isUtc || /Z$/.test(dtv.raw)) suffix = " (UTC)";
  else if (dtv.isDate) suffix = " (ganztägig)";
  return `${dtv.raw}${suffix}`;
}

function renderDateTimeField(
  key: "dtstart" | "dtend",
  label: string,
  dtv?: DateTimeValue,
): string {
  const picker = dtv
    ? icalToPickerValue(dtv)
    : { type: "datetime-local" as const, value: "" };
  return `<div class="field">
      <label>${escapeHtml(label)}</label>
      <input type="${picker.type}" id="e-${key}" value="${escapeHtml(picker.value)}" />
      <div class="raw-value" id="raw-${key}">${escapeHtml(formatRawDateTime(dtv))}</div>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

customElements.define("ics-app", AppShell);
