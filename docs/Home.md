# Keepical — Wiki

Willkommen im Code-Wiki von **Keepical**: einer statischen,
rein clientseitigen Web-App zum verlustarmen Bearbeiten von `.ics`-Dateien, ohne unbekannte
Properties, `VTIMEZONE`, `VALARM` oder HTML-Inhalte beim Roundtrip zu verlieren.

> **Kernversprechen:** Wird an einem Termin nur der Titel geändert, bleiben alle
> übrigen Properties dieses Termins **und** alle anderen `VEVENT`s so weit wie
> möglich byte-identisch.

## Navigation

| Seite | Inhalt |
| --- | --- |
| [Plan](Plan.md) | Archivierte Architektur- und Umsetzungsplanfassung |
| [Architecture](Architecture.md) | Leitprinzip (Raw/Patch), Datenmodell, Exportstrategie |
| [Parser](Parser.md) | Unfolding, ContentLine-Split, Komponentenbaum, VEVENT-Interpretation |
| [Export & Validation](Export-and-Validation.md) | Folding, Patch-Serializer, Validierung, Exportbericht |
| [UI](UI.md) | Web-Components-Aufbau, Liste, Editor, RRULE, Bericht |
| [Testing](Testing.md) | Fixtures, Roundtrip-Tests, Akzeptanzkriterien |
| [Roadmap](Roadmap.md) | Entwicklungsphasen 1–6 und Status |
| [Deployment](Deployment.md) | GitHub Pages, Actions-Workflow, Setup-Befehle |
| [Versioning](VERSIONING.md) | Automatische SemVer-Tags und Pages-Deploy |

## Schnellstart

```bash
npm install
npm run dev       # Dev-Server
npm test          # Roundtrip- und Parser-Tests
npm run build     # Produktionsbuild nach dist/
```

## Verzeichnisüberblick

```text
src/
  model/     Datenmodell (rawLines + parsed) und Editieroperationen
  parser/    Unfolding, ContentLine-Split, Komponentenbaum, VEVENT-Interpretation
  export/    Folding, Raw-vs-Patch-Serialisierung
  validate/  Strukturprüfungen + Exportbericht/Diff
  ui/        Web Components (Liste, Editor, RRULE, Bericht)
test/        Vitest-Fixtures und Tests
docs/        Dieses Wiki
```

## Konventionen dieses Wikis

- Jede Seite beschreibt **ein** Thema und verlinkt auf die zugehörigen Quelldateien.
- Codeverweise nennen den Pfad relativ zur Projektwurzel, z. B. `src/export/patch.ts`.
- Diagramme sind in Mermaid gehalten und werden von GitHub direkt gerendert.
