# Testing

Tests laufen mit Vitest (`npm test`). Sie sind der Vertrag für die Verlustarmut.

## Fixture — `test/fixtures/sample.ts`

Der Beispielkalender wird programmatisch als CRLF-String gebaut (nicht als
`.ics`-Datei gelesen), damit die exakten Zeilenenden und die Faltung unabhängig von
Git-`autocrlf` garantiert sind. Enthält: `VALUE=DATE`, `TZID=Europe/Berlin` mit
`VTIMEZONE`, mehrere `VALARM`, gefaltetes `X-ALT-DESC;FMTTYPE=text/html`,
`X-MICROSOFT-*` und einen Termin über Mitternacht.

## Roundtrip-Tests — `test/roundtrip.test.ts`

- Import zu Export ist byte-identisch.
- Alle UIDs stabil; VALUE=DATE, TZID, gefaltetes X-ALT-DESC, X-MICROSOFT-*, jeder
  VALARM bleiben erhalten; Mitternachtstermin behält lokale Zeiten.
- Selektives Editieren: nur SUMMARY ändern lässt alles andere unverändert.
- Neuer Termin erhält frische UID (`@keepical.local`); Löschen berührt keinen
  anderen Termin.

## Parser-Unit-Tests — `test/parser.test.ts`

- `parseContentLine`: gequotete/mehrwertige Parameter.
- `unfold`: Fortsetzungszeilen, LF-only.
- `foldLine`: 75-Oktett-Grenze mit führendem Space.

## Akzeptanzkern

Wird nur der Titel geändert, bleiben alle anderen Properties dieses und aller
übrigen VEVENTs so weit wie möglich unverändert.

Weiter zu [Roadmap](Roadmap.md).
