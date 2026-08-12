# Two Machines — task runner (tech-stack §8).
# `just check` is what CI runs and what a pre-push hook runs: one command,
# same result locally and remotely.

default:
    @just --list

dev:
    bun run develop

build:
    bun run build

serve:
    bun run serve

test:
    bun run test

coverage:
    bun run test:coverage

e2e:
    bun run test:e2e

check:
    bun run generate:sources
    git diff --exit-code src/data/sources.generated.ts
    bun run typecheck
    bun run lint
    bun run format:check
    bun run test:coverage

smoke:
    bun run smoke

clean:
    bun run clean
