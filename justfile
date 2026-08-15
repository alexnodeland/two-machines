# Two Machines — task runner (tech-stack §8).
# `just check` is what the pre-push hook runs. CI runs `just gate`:
# check + prefixed build + smoke + e2e — one recipe, same result
# locally and remotely.

default:
    @just --list

# One-time setup: dependencies, the Playwright browser, the reference tooling.
setup:
    bun install
    bunx playwright install chromium
    cd references && bun install

dev:
    bun run develop

build:
    bun run build

# gatsby clean + build — the honest way to re-judge a dependency/CSS/content fix.
rebuild:
    bun run clean
    bun run build

serve:
    bun run serve

test:
    bun run test

coverage:
    bun run test:coverage

typecheck:
    bun run typecheck

lint:
    bun run lint

format:
    bun run format

e2e:
    bun run test:e2e

# One spec: `just e2e-file e2e/rig.spec.ts` (still needs a build first).
e2e-file FILE:
    bun run test:e2e {{FILE}}

# A stale process on :9000 serves a stale build silently. Kill it.
kill-server:
    lsof -ti :9000 | xargs kill -9 || true

check:
    bun run generate:sources
    git diff --exit-code src/data/sources.generated.ts
    bun run typecheck
    bun run lint
    bun run format:check
    bun run test:coverage

smoke:
    bun run smoke

# Full CI parity: everything a PR must pass.
gate: check build smoke e2e

clean:
    bun run clean
