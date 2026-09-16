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

Der Workflow baut, führt Tests aus und deployt `dist/` über
`actions/upload-pages-artifact` + `actions/deploy-pages`.

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
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
