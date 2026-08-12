---
title: "Tech stack"
last_updated: 2026-08-11
related_adrs: ["015", "024", "025", "027", "029", "035", "037"]
---

# Tech stack

Gatsby, Bun, TypeScript, MDX — and the sharp edges each brings.

Mirrors the conventions in `websites/alexnodeland`, which is the working reference for
structure, lint, format and deploy, with npm→Bun and Jest→Vitest.

---

## 1. The stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Gatsby 5** | Client decision over the brief's Astro suggestion ([D-024](../decisions/024-gatsby-typescript-strict.md)) |
| Language | **TypeScript, `strict: true`** | No DSP in TypeScript — that is quiver's job |
| Package manager | **Bun** | Front door only; Gatsby runs on Node ([D-025](../decisions/025-bun-package-manager-node-runtime.md)) |
| Content | **MDX** | So lessons embed `<Rig preset="three-notes" />` inline |
| Styling | **CSS modules + custom properties** | Tokens as CSS variables; matches the reference repo's SCSS habit without the preprocessor |
| DSP | **quiver via `@quiver-dsp/wasm`** | AudioWorklet ([D-035](../decisions/035-quiver-patch-audioworklet.md)) |
| Tests | **Vitest** + Testing Library + Playwright | [Testing strategy](testing-strategy.md) |
| Task runner | **`justfile`** | Matches the reference repo |
| Hosting | **GitHub Pages**, project page | [CI/CD](ci-cd.md) |

---

## 2. Repository layout

```
two-machines/
  planning/                   this directory — specification
  mockups/                    prototypes, kept as reference and oracle
  src/
    audio/
      context.ts              the one AudioContext
      rig/                    RigController, presets, param mapping
      cycles/                 transport, kit, presets
      math/                   PURE. curves.ts, cycles.ts. no audio imports.
    components/
      chrome/                 Spine, EditorialMark, CitationLink, RightsNote
      controls/               Fader, Seg, Pad, Stepper, Toggle
      instruments/            Rig, Cycles, Canon, BeepingDroning, ThreeNotes
    content/
      machine/*.mdx
      discipline/*.mdx
      *.mdx
    data/
      references.ts           generated from planning/12-references.md
    styles/
      tokens.css
    pages/
    templates/
  static/
    quiver.worklet.js         copied from @quiver-dsp/wasm at build
    quiver_bg.wasm
  e2e/
  .github/workflows/
  justfile
```

**`src/audio/math/` must not import anything from `src/audio/rig/` or `cycles/`.**
Enforced by an ESLint `no-restricted-imports` rule. That boundary is the testing strategy
([D-027](../decisions/027-pure-from-wiring-split.md)); if it
erodes, 100% coverage stops being meaningful.

---

## 3. Bun: the sharp edges

### `trustedDependencies` is required

**Bun does not execute dependency lifecycle scripts by default**, for security. Gatsby's
image pipeline depends on packages with postinstall steps — `sharp` in particular. Without
this, `bun install` succeeds and the build fails later with a confusing error:

```jsonc
{
  "trustedDependencies": ["sharp", "gatsby-plugin-sharp", "gatsby-transformer-sharp"]
}
```

Verify the list against actual install warnings rather than guessing; Bun warns about
each skipped script.

### Native bindings

Packages with native bindings can misbehave under Bun's installer. If `sharp` proves
troublesome, the documented workaround is to install it with npm and use Bun for
everything else. **Prefer dropping the image plugins entirely** — this site is diagrams
and type, not photography, and `gatsby-plugin-sharp` is the single biggest source of
install and build pain for no benefit here.

### Bun is not the runtime

`bun run develop` invokes Gatsby, which runs on Node. Do not write Bun-specific runtime
APIs (`Bun.file`, `Bun.serve`) anywhere in the build or the site.

### Lockfile

`bun.lockb` is committed. CI uses `bun install --frozen-lockfile`.

---

## 4. Gatsby configuration

```ts
// gatsby-config.ts
const pathPrefix = '/two-machines'   // the ONLY place this is written
```

- `pathPrefix` is required — project page, not custom domain
  ([D-029](../decisions/029-github-pages-pathprefix.md)).
- Build must pass `--prefix-paths`. Both, or assets break.
- **No `CNAME` file.** Adding one without DNS breaks the deployment.
- `.nojekyll` in `static/` so underscore-prefixed asset paths are served.

### Plugins

`gatsby-plugin-mdx` · `gatsby-source-filesystem` · `gatsby-plugin-react-helmet` ·
`gatsby-plugin-manifest`.

**Deliberately not used:** `gatsby-plugin-sharp` / `gatsby-transformer-sharp` /
`gatsby-plugin-image` — see §3. Diagrams are inline SVG, which is sharper, smaller,
themeable with our tokens, and needs no image pipeline.

---

## 5. The worklet and wasm assets

The one integration detail most likely to ship broken.

`createQuiverAudioNode` needs `workletUrl` and `wasmUrl`. Both must resolve through
`withPrefix` ([D-037](../decisions/037-prefix-aware-worklet-wasm-urls.md)):

```ts
import { withPrefix } from 'gatsby'

const node = await createQuiverAudioNode(ctx, {
  workletUrl: withPrefix('/quiver.worklet.js'),
  wasmUrl:    withPrefix('/quiver_bg.wasm'),
})
```

Both files are copied from the installed package into `static/` by a prebuild step, so
they are versioned with the dependency rather than committed.

**Why this bites:** a raw `/quiver.worklet.js` works in `gatsby develop` (served at root)
and 404s in production (served under `/two-machines/`). Because audio initialises on a
user gesture, the failure is invisible until someone presses play. CI must assert both
assets resolve at the deployed prefix.

Also required: the worklet must be **same-origin**. GitHub Pages serves it same-origin,
so this is satisfied — but it rules out a CDN.

---

## 6. TypeScript

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",              // not es5 — AudioWorklet-era browsers only
    "lib": ["dom", "dom.iterable", "ES2020", "WebWorker"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

`"WebWorker"` in `lib` is needed for the worklet-side types. The reference repo targets
`es5`; that is unnecessary here — a browser without AudioWorklet cannot run this site
regardless.

`noUncheckedIndexedAccess` is on deliberately: the engines index into arrays constantly
(hit patterns, coefficient tables) and the extra rigour is worth the friction.

---

## 7. Browser support

**Baseline: browsers with AudioWorklet and WebAssembly.** Chrome 66+, Firefox 76+,
Safari 14.1+, Edge 79+.

Below baseline: the **prose and diagrams render perfectly**; the instruments show an
explanatory message rather than a broken control panel. Per
[Accessibility](accessibility-and-interaction.md), no chapter depends on audio to make its point,
so an unsupported browser loses the instruments and keeps the site.

Feature-detect `AudioWorklet` and `WebAssembly`; never sniff user agents.

---

## 8. Scripts

```
just dev            bun run develop
just build          bun run build           (includes --prefix-paths)
just test           bun run test
just coverage       bun run test:coverage
just e2e            bun run test:e2e
just check          type-check + lint + format:check + coverage
just clean          gatsby clean
```

`just check` is what CI runs and what a pre-push hook runs. One command, same result
locally and remotely.

---

## 9. Quality tooling

ESLint + Prettier + husky, same config family as the reference repo. Additions specific
to this project:

- **`no-restricted-imports`** preventing `src/audio/math/**` from importing anything
  outside itself — protects [D-027](../decisions/027-pure-from-wiring-split.md).
- **A lint rule or test banning raw internal `href`s**, forcing `Link`/`withPrefix` —
  protects [D-029](../decisions/029-github-pages-pathprefix.md).
- **A test asserting exactly one `AudioContext` construction site** — protects
  [D-015](../decisions/015-one-audiocontext.md).

Each of these encodes a decision that is otherwise easy to erode silently.
