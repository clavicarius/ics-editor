# ICS-Editor — verlustarm & lokal

![logo](./assets/ICS-editor-applogo.png)

Eine statische, rein clientseitige Web-App zum **verlustarmen** Bearbeiten von
`.ics`-Dateien (iCalendar). Kernidee: Die App wandelt den Kalender **nicht** in ein
vereinfachtes internes Modell um, um ihn danach komplett neu zu serialisieren.
Stattdessen wird jede Komponente doppelt gehalten — als **Originalzeilen** (`rawLines`)
und als **interpretierte Daten** (`parsed`).

> **Kernversprechen:** Wird an einem Termin nur der Titel geändert, bleiben alle
> übrigen Properties dieses Termins **und** alle anderen `VEVENT`s so weit wie
> möglich byte-identisch.

## Warum nicht einfach ICAL.js?

Ein voller Roundtrip `ICS → Bibliotheksmodell → Neuerzeugung` kann verändern oder
entfernen: unbekannte `X-*`-Properties, Property-Reihenfolge, Parameter, HTML in
`X-ALT-DESC`, mehrere `VALARM`-Blöcke, spezielle `VTIMEZONE`-Informationen sowie
Formatierung/Folding. Dieser Editor umgeht das über eine **Raw-/Patch-Strategie**:

- **Unveränderte `VEVENT`s** werden aus den Originalzeilen ausgegeben.
- **Geänderte Properties** werden gezielt neu geschrieben, der Rest bleibt original.
- **Unbekannte Properties, `VALARM`, `VTIMEZONE`** werden unverändert durchgereicht.
- **Gelöschte Termine** entfernen nur ihren eigenen `VEVENT`-Block.
- **Neue Termine** werden standardkonform erzeugt.

## Datenschutz

Alles läuft lokal im Browser: keine Uploads, kein Backend, kein Tracking. Dateien
werden über die File System Access API (mit `FileReader`-Fallback) gelesen und als
Download exportiert.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server
npm test           # Vitest (u. a. Roundtrip-Tests)
npm run build      # Produktionsbuild nach dist/
```

Ein Pre-Commit-Hook (Husky) führt vor jedem Commit `npm test` und `npm run build` aus. Schlägt einer der Schritte fehl, wird der Commit abgebrochen. Notausstieg: `git commit --no-verify`.

## Dokumentation

Das Code-Wiki liegt unter [`docs/`](docs/Home.md):

- [Home](docs/Home.md) — Einstieg
- [Plan](docs/Plan.md) — Architektur- und Umsetzungsplan (archiviert)
- [Architecture](docs/Architecture.md) · [Parser](docs/Parser.md) · [Export](docs/Export-and-Validation.md)
- [UI](docs/UI.md) · [Testing](docs/Testing.md) · [Roadmap](docs/Roadmap.md) · [Deployment](docs/Deployment.md)

GitHub-Wiki-Kompatibilität: [`docs/_Sidebar.md`](docs/_Sidebar.md) kann 1:1 in das
GitHub-Wiki übernommen werden.

## Architektur (Kurzüberblick)

```text
src/
  model/     Datenmodell (rawLines + parsed) und CalendarModel
  parser/    Unfolding, ContentLine-Split, Komponentenbaum, VEVENT-Interpretation
  export/    Folding, Raw-vs-Patch-Serialisierung
  validate/  Strukturprüfungen + Exportbericht/Diff
  ui/        Web Components (Liste, Editor, RRULE, Bericht)
docs/        Code-Wiki (siehe oben)
```

## Status

Frühe Phase. Reihenfolge: Parser + verlustfreier Roundtrip (Meilenstein) →
Bearbeitung → Wiederholungen → Validierung/Diff → Deployment (GitHub Pages).
Siehe [Roadmap](docs/Roadmap.md) und die GitHub-Issues für die einzelnen Phasen.

## Lizenz

MIT
