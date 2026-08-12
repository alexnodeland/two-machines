---
title: "CI/CD and deployment"
last_updated: 2026-08-11
related_adrs: ["029", "033", "036", "037", "041"]
---

# CI/CD and deployment

GitHub Pages, project page, Bun. Includes failure modes already learned the hard way in
`websites/alexnodeland` — those comments in that repo's workflow are hard-won and are
carried forward here rather than rediscovered.

---

## 1. Target

**`https://alexnodeland.github.io/two-machines`**

A project page, so `pathPrefix: "/two-machines"` is required in `gatsby-config.ts` **and**
`--prefix-paths` on the build
([D-029](../decisions/029-github-pages-pathprefix.md)).
Both. Either alone ships broken assets.

**No `CNAME` file.** Adding one without DNS breaks the deployment. If a custom domain
arrives later, the change is to *delete* the prefix and *add* the CNAME — Gatsby's docs
are explicit that a `pathPrefix` on a custom domain breaks navigation. The prefix
therefore lives in exactly one constant.

`.nojekyll` in `static/`, so paths beginning with an underscore are served.

---

## 2. Workflows

Two, matching the reference repo's split.

### `test.yml` — on every push and PR

```
setup bun → install --frozen-lockfile → just check → e2e → upload artifacts on failure
```

`just check` = type-check + lint + format:check + coverage. Coverage thresholds fail the
build; there is no soft mode.

### `deploy.yml` — on push to `main`, and manual

```
build → upload-pages-artifact → deploy-pages
```

Uses `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages` —
the modern path, not a third-party push-to-`gh-pages` action.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false     # never cancel an in-flight production deploy
```

---

## 3. Caching — the lesson worth carrying over

**Restore `.cache` only. Never `public/`.**

From the reference repo's own workflow comments, reproduced locally there: restoring a
previous `public/` lets Gatsby keep a stale `index.html` referencing an old
`styles.<hash>.css` while writing the new stylesheet beside it, unreferenced. **A
CSS-only change then deploys with no visible effect and a green build.**

`.cache` holds the expensive work and is keyed on lockfile plus sources, so it
invalidates correctly on its own:

```yaml
- uses: actions/cache@v4
  with:
    path: .cache
    key: ${{ runner.os }}-gatsby-${{ hashFiles('bun.lockb') }}-${{ hashFiles('src/**', 'gatsby-*.ts') }}
    restore-keys: |
      ${{ runner.os }}-gatsby-${{ hashFiles('bun.lockb') }}-
      ${{ runner.os }}-gatsby-
```

### No Rust in CI

Because `@quiver-dsp/wasm` ships prebuilt WebAssembly
([D-036](../decisions/036-quiver-wasm-npm-package.md)),
the site's CI installs a package and never touches a Rust toolchain. This is most of the
reason that decision was made — the alternative added `wasm-pack` to every deploy and
coupled site releases to quiver's `main`.

### Bun in CI

```yaml
- uses: oven-sh/setup-bun@v2
  with: { bun-version: latest }
- run: bun install --frozen-lockfile
```

`trustedDependencies` must be correct in `package.json` or postinstall steps are silently
skipped and the build fails later with a confusing error
([Tech stack §3](tech-stack.md#3-bun-the-sharp-edges)).

---

## 4. Deployment smoke tests

Run against the **built, prefixed output** before the artifact is uploaded. These catch
the failures that only exist in production.

| Assertion | Guards |
|---|---|
| `public/two-machines/index.html` exists | prefix applied |
| No `href="/..."` that omits the prefix | [D-029](../decisions/029-github-pages-pathprefix.md) |
| `quiver.worklet.js` and `quiver_bg.wasm` present at the prefixed path | [D-037](../decisions/037-prefix-aware-worklet-wasm-urls.md) |
| Referenced CSS hash exists on disk | the stale-`public/` failure above |
| No `CNAME` in output | §1 |
| `.nojekyll` present | underscore paths |

The worklet/wasm check is the important one. That failure is **invisible until a user
presses play**, which may be days after deploy.

---

## 5. Scheduled jobs

| Job | Cadence | Why |
|---|---|---|
| **Link check** over `/sources` | weekly | A bibliography with dead links is worse than none. The briefs contained three link-rot errors — one of which claimed a live page was dead. |
| Lighthouse | on deploy | Performance and a11y budgets |
| `bun update --dry-run` report | monthly | Dependency drift, not auto-merged |

Link-check failures open an issue rather than failing a build — link rot is not a code
regression, but it must not go unnoticed.

---

## 6. Branching and releases

- `main` deploys. Feature branches PR into it.
- Never commit to `main` directly; never push without `just check` passing.
- No release tags for the site itself — it is continuously deployed. **Quiver is
  versioned**, and the site pins an exact `@quiver-dsp/wasm` version so an upstream DSP
  change cannot alter the site's sound without a deliberate bump.

That last point matters given [D-041](../decisions/041-prototype-as-behavioural-oracle.md):
the behavioural contract is asserted against a specific quiver version, and a floating
dependency would let the oracle drift silently.

---

## 7. Secrets

None. No API keys, no analytics, no backend, no forms. The site is static and
non-commercial ([D-033](../decisions/033-non-commercial.md)), which is also
the simplest possible security posture.

If analytics are ever wanted, they must be cookieless and self-hosted or absent —
tracking readers of a non-commercial reference site is not worth the tradeoff. Currently:
**none**.
