# Roadmap

Entwicklungsphasen in der im Plan festgelegten Reihenfolge. Phasen 1–2 sind der
harte Meilenstein (Parser + verlustfreier Roundtrip). RRULE-Felder sind im
Datenmodell von Anfang an vorgesehen, auch wenn die Editor-UI dafür erst in
Phase 4 kommt.

| Phase | Thema | Status |
| --- | --- | --- |
| 1 | Parser (unfold, contentline, tree, vevent) mit rawLines-Erhaltung | erledigt |
| 2 | Read-only-UI + verlustfreier Import/Export-Roundtrip, Tests | erledigt |
| 3 | Bearbeiten / Neu / Löschen mit Patch-Export | erledigt (MVP) |
| 4 | RRULE / RDATE / EXDATE / RECURRENCE-ID inkl. Rohtext-Fallback | offen |
| 5 | Validierung + Exportbericht + Vorher/Nachher-Diff | teilweise (Basis vorhanden) |
| 6 | GitHub Pages + Beispielkalender + Doku | erledigt |

## Phase 1 — Parser

Datei einlesen, Zeilen entfalten, Komponentenbaum, VEVENT interpretieren.
Unbekannte Properties und Komponenten unverändert speichern. Siehe [Parser](Parser.md).

## Phase 2 — Read-only + Roundtrip (Meilenstein)

Kalender laden, Termine anzeigen. **Import -> sofortiger Export ist
byte-identisch.** Abgedeckt durch `test/roundtrip.test.ts`. Siehe [Testing](Testing.md).

## Phase 3 — Bearbeitung

Standardfelder bearbeiten mit selektivem Patch-Export. Neue Termine mit
konfigurierbarem UID-Suffix (`@keepical.local`). Löschen entfernt nur den
betroffenen VEVENT-Block. UID standardmäßig read-only.

## Phase 4 — Wiederholungen

RRULE-Baustein-UI (FREQ, INTERVAL, COUNT/UNTIL, BYDAY, BYMONTHDAY, BYSETPOS) plus
immer sichtbarer Rohtext. Nicht verstandene Teile nicht stillschweigend löschen:
erhalten / roh bearbeiten / abbrechen. Einzelne Instanz vs. Serie via
RECURRENCE-ID.

## Phase 5 — Validierung + Bericht

Strukturprüfungen, Exportbericht und Diff pro UID. Basis in
`src/validate/validator.ts`. Siehe [Export & Validation](Export-and-Validation.md).

## Phase 6 — Deployment

GitHub-Actions-Workflow, Pages aktivieren, `vite` `base=/keepical/`.
Beispielkalender ohne personenbezogene Daten. iOS-Abo-Praxistest.
Siehe [Deployment](Deployment.md).
