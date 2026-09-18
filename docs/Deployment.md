# Deployment

Statische Veröffentlichung auf GitHub Pages. Der Vite-`base`-Pfad ist
`/keepical/` (`vite.config.ts`); Override über `VITE_BASE`.

## Lokale Befehle

Die folgenden Befehle gelten relativ zum Projektwurzelverzeichnis (dort, wo
`package.json` liegt).

```bash
npm install
npm test
npm run build    # erzeugt dist/
```

## GitHub Pages

1. Workflow-Datei `.github/workflows/deploy.yml` (Source of Truth).
2. Unter GitHub -> Settings -> Pages die Source auf **GitHub Actions** stellen.
3. Die Seite ist dann unter `https://clavicarius.github.io/keepical/` erreichbar.

### Wann deployt wird

- **Nach Merge auf `main`:** [Versioning](VERSIONING.md) erzeugt einen
  Full-Tag `v*.*.*` und ruft danach `deploy.yml` per `workflow_call` auf
  (mit Input `version-tag`). So startet der Deploy auch, wenn der Tag-Push mit
  `GITHUB_TOKEN` keine eigenen Workflows auslöst.
- **Manuell:** `workflow_dispatch` auf dem Deploy-Workflow.
- **Tag-Push von außerhalb:** `on.push.tags: v*.*.*` (z. B. manuell erzeugte
  Tags mit einem User-Token).

Der Deploy-Workflow baut, führt Tests aus und deployt `dist/` über
`actions/upload-pages-artifact` + `actions/deploy-pages`. Es gibt **keinen**
Deploy-Trigger auf `push` zu `main` (vermeidet Builds mit Fallback-Version
`development` vor dem Tag). Moving-Major-Tags (`v0`, `v1`, …) lösen kein Deploy
aus.

Job-Concurrency für Pages bleibt im Deploy-Job (`group: pages`); ein
top-level-`concurrency: pages` wird bewusst **nicht** gesetzt (Deadlock mit dem
Deploy-Job, siehe PR #10).

Aktuelle Workflow-Definition:

- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- [`.github/workflows/versioning.yml`](../.github/workflows/versioning.yml)

## Git und Issues

Phasen-Issues liegen im GitHub-Repository. Siehe [Roadmap](Roadmap.md).

## Datenschutz

Die App arbeitet vollständig clientseitig: keine Uploads, kein Backend, kein Tracking.
Dateien werden über FileReader / File System Access API gelesen und als Download exportiert.

Zurück zur [Home](Home.md).
