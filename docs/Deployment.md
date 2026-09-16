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

Der Workflow baut und testet auf jedem Push und jedem Pull Request.
GitHub Pages (`dist/` über `actions/upload-pages-artifact` +
`actions/deploy-pages`) wird nur bei Push oder `workflow_dispatch` auf
`main` veröffentlicht, also nach einem Merge in `main`.

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

## Git und Issues

Phasen-Issues liegen im GitHub-Repository. Siehe [Roadmap](Roadmap.md).

## Datenschutz

Die App arbeitet vollständig clientseitig: keine Uploads, kein Backend, kein Tracking. 
Dateien werden über FileReader / File System Access API gelesen und als Download exportiert.

Zurück zur [Home](Home.md).
