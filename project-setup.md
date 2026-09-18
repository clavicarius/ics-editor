# Projekt-Setup, GitHub-Issues und Deployment

Die fachliche Doku und der Plan stehen im Code-Wiki unter [`docs/`](docs/Home.md).
Dieses Dokument enthält nur die manuellen Schritte, die in dieser Umgebung nicht
automatisch ausgeführt werden konnten (die Sandbox blockiert Terminal-Befehle wie
`git`, `gh`, `npm`). Alle Quelldateien wurden bereits angelegt.

## 1. Abhängigkeiten installieren und Tests ausführen

Die folgenden Befehle gelten relativ zum Projektwurzelverzeichnis (dort, wo `package.json` liegt).

```bash
npm install
npm test          # Roundtrip- und Parser-Tests
npm run dev       # lokaler Dev-Server
npm run build     # Produktionsbuild nach dist/
```

## 2. Git initialisieren und zum Repository pushen

```bash
git init
git branch -M main
git add .
git commit -m "Initiales Grundgerüst: Keepical — verlustarmer ICS-Editor (Parser, Raw/Patch-Export, UI, Tests)"
git remote add origin https://github.com/clavicarius/keepical.git
git push -u origin main
```

## 3. GitHub-Issues anlegen (via gh CLI)

Die folgenden Befehle erstellen ein Issue pro Entwicklungsphase. Voraussetzung:
`gh auth login` ist erledigt.

```bash
gh issue create -R clavicarius/keepical \
  -t "Phase 1: Parser (verlustarm)" \
  -l "phase-1,parser" \
  -b "Datei einlesen, Zeilen entfalten (unfold), Komponentenbaum (BEGIN/END), VEVENT interpretieren. Originalzeilen (rawLines) je Komponente/Property erhalten. Unbekannte Properties und Komponenten unverändert speichern. Dateien: src/parser/*."

gh issue create -R clavicarius/keepical \
  -t "Phase 2: Read-only-UI + verlustfreier Roundtrip" \
  -l "phase-2,milestone" \
  -b "Kalender laden, Termine anzeigen, Details anzeigen. Kernmeilenstein: Import -> sofortiger Export ist byte-identisch. Abgedeckt durch test/roundtrip.test.ts (u. a. VALUE=DATE, TZID, VALARM, X-ALT-DESC, X-MICROSOFT-*)."

gh issue create -R clavicarius/keepical \
  -t "Phase 3: Bearbeitung (Titel/Datum/Ort/Beschreibung, Neu, Löschen)" \
  -l "phase-3,editor" \
  -b "Standardfelder bearbeiten mit selektivem Patch-Export (nur geänderte Properties neu schreiben). Neue Termine mit konfigurierbarem UID-Suffix (@keepical.local). Löschen entfernt nur den betroffenen VEVENT-Block. UID standardmäßig read-only."

gh issue create -R clavicarius/keepical \
  -t "Phase 4: Wiederholungen (RRULE/RDATE/EXDATE/RECURRENCE-ID)" \
  -l "phase-4,recurrence" \
  -b "RRULE-Baustein-UI (FREQ, INTERVAL, COUNT/UNTIL, BYDAY, BYMONTHDAY, BYSETPOS) plus immer sichtbarer Rohtext. Nicht verstandene Teile nicht stillschweigend löschen: erhalten / roh bearbeiten / abbrechen. Einzelne Instanz vs. Serie via RECURRENCE-ID."

gh issue create -R clavicarius/keepical \
  -t "Phase 5: Validierung + Exportbericht + Vorher/Nachher-Diff" \
  -l "phase-5,validation" \
  -b "Strukturprüfungen (genau ein VCALENDAR, UID/DTSTART vorhanden, nicht DTEND+DURATION, TZID-Konsistenz, gültige RRULE/RDATE/EXDATE, CRLF/Folding). Exportbericht und Diff pro UID. Basis in src/validate/validator.ts."

gh issue create -R clavicarius/keepical \
  -t "Phase 6: Deployment auf GitHub Pages + Doku + Beispielkalender" \
  -l "phase-6,deployment" \
  -b "GitHub-Actions-Workflow (siehe .github/workflows/deploy.yml unten), Pages aktivieren (Source: GitHub Actions), vite base=/keepical/. Beispielkalender ohne personenbezogene Daten. iOS-Abo-Praxistest."
```

## 4. GitHub-Actions-Workflow für Pages

Diese Umgebung konnte die Workflow-Datei nicht schreiben. Lege sie manuell an unter
`.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
  pull_request:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    concurrency:
      group: ci-${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    concurrency:
      group: pages
      cancel-in-progress: true
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Danach unter GitHub → Settings → Pages die Source auf "GitHub Actions" stellen.
Die Seite ist dann unter `https://clavicarius.github.io/keepical/` erreichbar.
