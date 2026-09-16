# Deployment

Statische Veröffentlichung auf GitHub Pages. Der Vite-`base`-Pfad ist
`/ics-editor/` (`vite.config.ts`); Override über `VITE_BASE`.

## Lokale Befehle

Die folgenden Befehle gelten relativ zum Projektwurzelverzeichnis (dort, wo
`package.json` liegt).

```bash
npm install
npm test
npm run build    # erzeugt dist/
```

## GitHub Pages

1. Workflow-Datei `.github/workflows/deploy.yml` anlegen (siehe unten).
2. Unter GitHub -> Settings -> Pages die Source auf **GitHub Actions** stellen.
3. Die Seite ist dann unter `https://clavicarius.github.io/ics-editor/` erreichbar.

Der Workflow startet bei vollständigen Version-Tags `v*.*.*` (gesetzt durch
[Versioning](VERSIONING.md)) sowie manuell über `workflow_dispatch`. Er baut,
führt Tests aus und deployt `dist/` über `actions/upload-pages-artifact` +
`actions/deploy-pages`. Moving-Major-Tags (`v0`, `v1`, …) lösen kein Deploy aus.

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    tags:
      - "v*.*.*"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

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
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - name: Set version from Git tag
        run: |
          version_tag="$(git tag --points-at "$GITHUB_SHA" --list 'v*.*.*' | sort -V | tail -n1)"
          echo "VITE_VERSION_TAG=${version_tag:-development}" >> "$GITHUB_ENV"
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

## Git und Issues

Phasen-Issues liegen im GitHub-Repository. Siehe [Roadmap](Roadmap.md).

## Datenschutz

Die App arbeitet vollständig clientseitig: keine Uploads, kein Backend, kein Tracking. 
Dateien werden über FileReader / File System Access API gelesen und als Download exportiert.

Zurück zur [Home](Home.md).
