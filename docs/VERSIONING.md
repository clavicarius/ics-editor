# Versioning

Keepical verwendet automatisches Semantic Versioning über
`.github/workflows/versioning.yml`.

## Trigger behavior

The workflow runs on every push to `main`. It also runs for pull requests
targeting `main`, but pull-request runs are always dry runs.

After a successful versioning run for `main`, the full version tag triggers
the GitHub Pages workflow, which builds and deploys that exact tagged commit.
Moving major tags do not trigger deployments. Manual Pages deployments remain
available through `workflow_dispatch`.

## Tags and increments

Full release tags use the `v<major>.<minor>.<patch>` format, for example
`v0.1.0`. Only tags with the `v` prefix and three numeric components are
considered version tags. If no such tag exists, the first version is `v0.1.0`.
Otherwise, the workflow finds the greatest semantic version across all major
lines and increments its patch component by one. Minor and major components
are not automatically incremented.

The global ordering means a newly generated version is greater than every
previous semantic version, even when version lines or tags have gaps.

## Moving major tags

After publishing a full version, the workflow updates `v<major>` (for example,
`v0`) to point to that version. This lightweight tag always represents the
latest full version in its major line.

## Safety behavior

- The workflow only mutates tags on pushes to `main`; pull requests only report
  the computed tags.
- Branch and actor guards prevent tag operations from recursively triggering
  versioning. Tag pushes do not match the `main` branch trigger.
- Before publishing, the workflow checks whether the computed full tag already
  exists on `origin`. If it does, no duplicate full tag is created.
- The moving major tag is always force-updated to the current `main` commit.

## Operational examples

| Existing semantic tags | Computed full tag | Moving tag |
| ---------------------- | ----------------- | ---------- |
| none                   | `v0.1.0`          | `v0`       |
| `v0.1.0`               | `v0.1.1`          | `v0`       |
| `v0.1.1`, `v2.0.0`     | `v2.0.1`          | `v2`       |

To inspect versions locally:

```sh
git ls-remote --tags origin 'refs/tags/v*'
```
