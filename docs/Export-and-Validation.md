# Export & Validierung

## Folding — `src/export/fold.ts`

`foldLine()` faltet logische Zeilen bei **75 Oktetts** und fügt CRLF + ein
Leerzeichen ein. Gezählt werden UTF-8-Oktetts, und es wird nur an
Zeichengrenzen gebrochen, sodass keine Multibyte-Sequenz zerschnitten wird. Das
führende Leerzeichen der Fortsetzungszeile zählt zum Limit.

## Serialisierung einer Property — `src/export/serialize.ts`

`renderContentLine()` baut `NAME;PARAM=VALUE:VALUE` wieder auf (Parameter in
Originalreihenfolge, Quoting bei Sonderzeichen). `serializeContentLine()` faltet
das Ergebnis. Wird nur für **geänderte** Properties benutzt.

## Patch-Serializer — `src/export/patch.ts`

`serializeCalendar()` ist das Herzstück:

- Nicht `dirty` -> `rawLines` 1:1 ausgeben.
- `dirty` -> Block neu aufbauen, aber jede **unveränderte** Property aus ihren
  eigenen `rawLines` ausgeben; nur Properties in `changedProperties` werden neu
  gerendert.
- Gelöschte `VEVENT`s werden übersprungen.
- Ausgabe mit CRLF; optionaler abschließender Zeilenumbruch je nach Original.

## Validierung & Bericht — `src/validate/validator.ts`

`validate()` prüft konservativ, ohne etwas umzuschreiben:

- genau ein `VCALENDAR`
- jede `VEVENT` mit `UID` und `DTSTART`
- nicht `DTEND` und `DURATION` gleichzeitig
- TZID-Konsistenz (kein TZID zusammen mit UTC-`Z`)

`buildReport()` liefert den Exportbericht: Anzahl unverändert/geändert/neu/gelöscht,
erhaltene UIDs, `VTIMEZONE`/`VALARM`/unbekannte Properties erhalten, plus Diff pro
UID (welche Property-Namen geändert wurden).

Weiter zu [UI](UI.md).
