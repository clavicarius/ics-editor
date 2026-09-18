# Verlustarmer ICS-Editor (Keepical) — Architektur- und Umsetzungsplan

_Archivierte Planfassung. Die laufende Doku steht im Wiki: [Home](Home.md)._

## Leitprinzip

Kein vollständiger Roundtrip durch eine Kalenderbibliothek. Jede Komponente wird
doppelt gehalten: als `rawLines` (unangetastet) und als `parsed` (interpretiert).
Beim Export gilt: **unverändert = Originalzeilen ausgeben; geändert = nur
betroffene Properties patchen**. ICAL.js wird höchstens als optionale Rechenhilfe
(RRULE-Expansion, Zeitzonen) genutzt, nie als Exportweg.

## Technischer Stack (Variante B)

- TypeScript, Vite (Build + Dev-Server), Vitest (Tests)
- UI mit nativen Web Components (Custom Elements), kein Framework
- CSS ohne Präprozessor
- File System Access API mit `FileReader`-Fallback; Download via Blob
- Ziel-Hosting: GitHub Pages (statisch, `base` in Vite konfiguriert)
- UID-Default-Suffix: `@keepical.local`, im UI konfigurierbar

## Projektstruktur

```text
keepical/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── model/     types.ts, calendar.ts
│   ├── parser/    unfold.ts, contentline.ts, tree.ts, vevent.ts
│   ├── export/    fold.ts, serialize.ts, patch.ts
│   ├── validate/  validator.ts
│   ├── ui/        app-shell.ts (weitere Komponenten geplant)
│   └── styles/app.css
├── test/          fixtures/, *.test.ts
└── docs/          Code-Wiki
```

## Datenmodell

Siehe [Architecture](Architecture.md) und `src/model/types.ts`.

## Kritische Parser-Regeln

Siehe [Parser](Parser.md). Kurz:

- Zeilenumbrüche: CRLF/LF/CR beim Import, Export immer CRLF.
- Unfolding: Fortsetzung mit Space/Tab; genau ein führendes Zeichen entfernen.
  Physische Rohzeilen zusätzlich behalten.
- ContentLine-Split: Zustandsmaschine, nicht `split(';'/':')`.
- Baum: `BEGIN:X`/`END:X`; unbekannte Komponenten als generischer `Component`.

## Exportstrategie

Siehe [Architecture](Architecture.md) (Mermaid) und [Export & Validation](Export-and-Validation.md).

## Validierung & Bericht

Siehe [Export & Validation](Export-and-Validation.md).

## UI-Bausteine

Siehe [UI](UI.md). Geplant: `event-list`, `event-editor`, `rrule-editor`,
`export-report` als eigene Custom Elements.

## Verhalten bei Terminen

- Bestehend: UID unverändert; unbearbeitete/unbekannte Properties und Alarme bleiben.
- Neu: `UID:<uuid>@keepical.local`, Mindestfelder UID/DTSTAMP/DTSTART/DTEND|DURATION/SUMMARY.
- Gelöscht: kompletter VEVENT-Block entfernt, sonst nichts.

## Teststrategie

Siehe [Testing](Testing.md).

**Akzeptanzkern:** Wird nur der Titel geändert, bleiben alle anderen Properties
dieses und aller übrigen VEVENTs so weit wie möglich unverändert.

## Deployment

Siehe [Deployment](Deployment.md).

## Umsetzungsreihenfolge

Siehe [Roadmap](Roadmap.md). Phasen 1–2 zuerst als harter Meilenstein.
