#!/usr/bin/env bash
set -euo pipefail

REPO="${GH_REPO:-clavicarius/keepical}"
UPDATE_EXISTING="${UPDATE_EXISTING:-1}"
CREATE_SUB_ISSUES="${CREATE_SUB_ISSUES:-1}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

require_gh() {
  command -v gh >/dev/null 2>&1 || {
    echo "gh CLI nicht gefunden." >&2
    exit 1
  }

  gh auth status >/dev/null 2>&1 || {
    echo "gh CLI ist nicht authentifiziert." >&2
    exit 1
  }
}

write_body() {
  local path="$1"
  cat >"$path"
}

edit_issue() {
  local number="$1"
  local title="$2"
  local body_file="$3"

  gh issue edit "$number" \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$body_file"
}

create_issue() {
  local title="$1"
  local body_file="$2"

  gh issue create \
    --repo "$REPO" \
    --label enhancement \
    --title "$title" \
    --body-file "$body_file"
}

require_gh

if [[ "$UPDATE_EXISTING" == "1" ]]; then
  body="$TMP_DIR/issue-5.md"
  write_body "$body" <<'EOF'
Priorität: **P1**

Ziel: Wiederholende Termine und Ausnahmen sicher bearbeiten, ohne unbekannte oder nicht verstandene Teile stillschweigend zu verlieren.

## Scope

- RRULE für die häufigen Standardfälle bearbeitbar machen:
  - FREQ
  - INTERVAL
  - COUNT / UNTIL
  - BYDAY
  - BYMONTHDAY
  - BYSETPOS
- Rohtext-Fallback für RRULE beibehalten
- Nicht verstandene Teile nie stillschweigend verwerfen
- EXDATE und RDATE sichtbar und bearbeitbar machen
- RECURRENCE-ID fachlich sauber behandeln:
  - ganze Serie
  - einzelne Instanz
- Verhalten für Ausnahmen und Serieninstanzen klar definieren

## Anforderungen

- Standardfälle sollen komfortabel in der UI bearbeitbar sein
- Ein Rohtext-Modus bleibt immer verfügbar
- Nicht unterstützte oder unbekannte Teile müssen erhalten bleiben
- Bearbeitung darf nicht dazu führen, dass Wiederholungsinformationen implizit verloren gehen
- Verlustarmer Export bleibt gewahrt

## Teilthemen

- [ ] RRULE-Editor für Standardfälle
- [ ] Rohtext-Fallback/Abbruchstrategie für nicht verstandene Teile
- [ ] EXDATE bearbeiten
- [ ] RDATE bearbeiten
- [ ] RECURRENCE-ID / Instanz-vs-Serie fachlich festziehen
- [ ] Tests für Serien, Ausnahmen und Roundtrip-Stabilität

## Akzeptanzkriterien

- Wiederholende Termine bleiben beim Import/Export stabil
- Nicht verstandene RRULE-Bestandteile werden nicht stillschweigend gelöscht
- EXDATE/RDATE bleiben erhalten und bearbeitbar
- Einzelne Instanzen können klar von der Serie unterschieden werden
- Bestehende Ausnahmen bleiben beim Export korrekt erhalten
EOF
  edit_issue 5 "Phase 4 (P1): Wiederholungen – RRULE/RDATE/EXDATE/RECURRENCE-ID" "$body"

  body="$TMP_DIR/issue-6.md"
  write_body "$body" <<'EOF'
Priorität: **P2**

Ziel: Export robuster und für Nutzer transparenter machen. Vorhandene Basis in `src/validate/validator.ts` ausbauen.

## Scope

- Validierungsregeln vervollständigen
- Fehler und Warnungen klar trennen
- Wiederholungsbezogene Validierung ergänzen:
  - RRULE
  - RDATE
  - EXDATE
  - RECURRENCE-ID
- Exportbericht verständlicher machen
- Diff pro UID verfeinern
- Export-UX für Validierungsprobleme verbessern

## Anforderungen

- Konservative Validierung: prüfen, aber nichts automatisch umschreiben
- Nutzer sollen vor dem Export klar sehen:
  - was unverändert bleibt
  - was geändert wurde
  - was neu ist
  - was gelöscht wurde
- Diff soll nützlicher sein als nur eine Liste geänderter Property-Namen
- Warnungen und Fehler sollen im Exportablauf sinnvoll behandelt werden

## Teilthemen

- [ ] Fehler-/Warnungsmodell schärfen
- [ ] RRULE/RDATE/EXDATE/RECURRENCE-ID validieren
- [ ] Struktur- und Formatprüfungen erweitern
- [ ] Exportbericht verständlicher machen
- [ ] Diff pro UID verbessern
- [ ] UX für Export bei Warnungen/Fehlern überarbeiten
- [ ] Tests für Validierung und Bericht ergänzen

## Akzeptanzkriterien

- Offensichtliche Strukturprobleme werden erkannt
- Wiederholungsbezogene Inkonsistenzen werden sichtbar gemacht
- Bericht zeigt Änderungen verständlich und nachvollziehbar an
- Diff pro UID hilft beim Prüfen der tatsächlichen Änderungen
- Exportverhalten bei Fehlern/Warnungen ist für Nutzer klar und konsistent
EOF
  edit_issue 6 "Phase 5 (P2): Validierung, Exportbericht und Diff ausbauen" "$body"
fi

if [[ "$CREATE_SUB_ISSUES" == "1" ]]; then
  body="$TMP_DIR/issue-4a.md"
  write_body "$body" <<'EOF'
Ziel: Einen RRULE-Editor für die häufigen Standardfälle bereitstellen, ohne den verlustarmen Ansatz aufzugeben.

## Scope

- Eingabemöglichkeiten für:
  - FREQ
  - INTERVAL
  - COUNT / UNTIL
  - BYDAY
  - BYMONTHDAY
  - BYSETPOS
- Bestehenden RRULE-Rohtext sichtbar halten
- Rohtext-Fallback für nicht unterstützte Teile erhalten

## Akzeptanzkriterien

- Häufige Standardfälle lassen sich ohne Rohtextbearbeitung editieren
- Nicht unterstützte RRULE-Teile gehen nicht stillschweigend verloren
- Export bleibt für unveränderte Teile verlustarm
EOF
  create_issue "Phase 4a: RRULE-Editor + Rohtext-Fallback" "$body"

  body="$TMP_DIR/issue-4b.md"
  write_body "$body" <<'EOF'
Ziel: EXDATE und RDATE nicht nur anzeigen, sondern kontrolliert bearbeitbar machen.

## Scope

- EXDATE editierbar machen
- RDATE editierbar machen
- Mehrfachwerte und vorhandene Parameter korrekt erhalten
- Verlustarmen Export für unveränderte Einträge wahren

## Akzeptanzkriterien

- Ausnahmen und Zusatztermine lassen sich bearbeiten
- Vorhandene Werte bleiben stabil
- Unbekannte oder nicht bearbeitete Teile werden nicht beschädigt
EOF
  create_issue "Phase 4b: EXDATE/RDATE bearbeiten" "$body"

  body="$TMP_DIR/issue-4c.md"
  write_body "$body" <<'EOF'
Ziel: Das Verhalten für Serienänderungen und Einzelinstanzen mit `RECURRENCE-ID` fachlich eindeutig machen.

## Scope

- Semantik für „ganze Serie“ vs. „nur diese Instanz“ definieren
- Bestehende Ausnahmen berücksichtigen
- Bearbeitungsregeln für Serieninstanzen festlegen
- Verlustarmen Export für Serien und Ausnahmen sichern

## Akzeptanzkriterien

- Nutzerfluss für Serie vs. Instanz ist eindeutig
- Bestehende Ausnahmen bleiben korrekt erhalten
- `RECURRENCE-ID`-Fälle werden konsistent behandelt
EOF
  create_issue "Phase 4c: RECURRENCE-ID / Instanz vs. Serie" "$body"

  body="$TMP_DIR/issue-4d.md"
  write_body "$body" <<'EOF'
Ziel: Wiederholungen, Ausnahmen und Serieninstanzen mit belastbaren Tests absichern.

## Scope

- Roundtrip-Tests für RRULE-Fälle
- Tests für EXDATE/RDATE
- Tests für Serienausnahmen mit `RECURRENCE-ID`
- Negative Fälle für nicht verstandene oder teilunterstützte Wiederholungen

## Akzeptanzkriterien

- Relevante Wiederholungsfälle sind testseitig abgedeckt
- Verlustrisiken bei Serien und Ausnahmen werden früh erkannt
EOF
  create_issue "Phase 4d: Wiederholungs-Tests" "$body"

  body="$TMP_DIR/issue-5a.md"
  write_body "$body" <<'EOF'
Ziel: Das Validierungsmodell vervollständigen und klare Fehler-/Warnungsregeln festlegen.

## Scope

- Strukturregeln überprüfen
- Fehler und Warnungen sauber unterscheiden
- Wiederholungsbezogene Inkonsistenzen berücksichtigen
- Konservative Validierung ohne automatische Korrektur

## Akzeptanzkriterien

- Offensichtliche Strukturfehler werden erkannt
- Warnungen und Fehler sind nachvollziehbar getrennt
- Validierung überschreibt keine Daten
EOF
  create_issue "Phase 5a: Validierungsregeln vervollständigen" "$body"

  body="$TMP_DIR/issue-5b.md"
  write_body "$body" <<'EOF'
Ziel: Den Exportbericht verständlicher machen und den Erhalt unveränderter Daten sichtbar dokumentieren.

## Scope

- Berichtstexte verbessern
- Klarer ausweisen, was unverändert, geändert, neu oder gelöscht ist
- Erhaltene Strukturen und Properties transparenter darstellen

## Akzeptanzkriterien

- Bericht ist für Nutzer nachvollziehbar
- Erhalt und Änderungen werden klar kommuniziert
EOF
  create_issue "Phase 5b: Exportbericht verbessern" "$body"

  body="$TMP_DIR/issue-5c.md"
  write_body "$body" <<'EOF'
Ziel: Den Diff pro UID so ausbauen, dass tatsächliche Änderungen leichter prüfbar sind.

## Scope

- Diff über reine Property-Namen hinaus verbessern
- Änderungszusammenfassung pro UID verständlicher machen
- Fokus auf überprüfbare Nutzersicht statt rein technische Darstellung

## Akzeptanzkriterien

- Diff hilft beim Prüfen der tatsächlichen Änderungen
- Änderungen pro Termin sind leichter nachvollziehbar
EOF
  create_issue "Phase 5c: Diff pro UID verfeinern" "$body"

  body="$TMP_DIR/issue-5d.md"
  write_body "$body" <<'EOF'
Ziel: Das Exportverhalten bei Validierungsproblemen für Nutzer klar und konsistent gestalten.

## Scope

- Verhalten bei Fehlern definieren
- Verhalten bei Warnungen definieren
- Nutzerführung vor dem Export verbessern
- Entscheidungspunkte verständlich machen

## Akzeptanzkriterien

- Exportverhalten bei Fehlern und Warnungen ist konsistent
- Nutzer verstehen, wann ein Export blockiert oder bestätigt werden muss
EOF
  create_issue "Phase 5d: Export-UX für Fehler/Warnungen" "$body"
fi

echo
echo "Fertig. Repo: $REPO"
echo "- UPDATE_EXISTING=$UPDATE_EXISTING"
echo "- CREATE_SUB_ISSUES=$CREATE_SUB_ISSUES"
