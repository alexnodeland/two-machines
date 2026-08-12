#!/usr/bin/env bash
# Deployment smoke tests (ci-cd §4), run against the BUILT, PREFIXED output
# before the artifact is uploaded. These catch the failures that only exist
# in production.
set -euo pipefail

PUB="public"
fail=0

say() { printf '%s\n' "$*"; }
err() { printf 'SMOKE FAIL: %s\n' "$*" >&2; fail=1; }

[ -d "$PUB" ] || { err "no public/ directory — run the build first"; exit 1; }

# 1. The prefix was applied: page-data live under the prefix and index.html
#    references prefixed assets.
if ! grep -q '/two-machines/' "$PUB/index.html"; then
  err "index.html contains no /two-machines/ asset paths — pathPrefix not applied"
fi

# 2. No internal href that omits the prefix (ADR-029). External URLs and
#    fragment links are fine; a href="/..." that is not href="/two-machines/..."
#    is a 404 in production.
if grep -rEoh 'href="/[^"]*"' "$PUB" --include='*.html' \
  | grep -v 'href="/two-machines' | sort -u | grep .; then
  err 'unprefixed internal href found (listed above)'
fi

# 3. No CNAME in the output (ci-cd §1) — a CNAME without DNS breaks the deploy.
if [ -f "$PUB/CNAME" ]; then
  err "CNAME present in output"
fi

# 4. .nojekyll present, so underscore-prefixed paths are served.
if [ ! -f "$PUB/.nojekyll" ]; then
  err ".nojekyll missing from output"
fi

# 5. Every stylesheet referenced by an HTML file exists on disk (the
#    stale-public/ failure: a green build deploying an index.html that points
#    at a CSS hash that was never written).
while IFS= read -r css; do
  rel="${css#/two-machines/}"
  if [ ! -f "$PUB/$rel" ]; then
    err "referenced stylesheet missing on disk: $css"
  fi
done < <(grep -rEoh '<link[^>]*rel="stylesheet"[^>]*href="[^"]*"' "$PUB" --include='*.html' \
  | grep -Eo 'href="[^"]*"' | sed 's/^href="//;s/"$//' | grep '^/' | sort -u)

# 6. The worklet and wasm resolve at the deployed prefix (ADR-037). This
#    failure is invisible until a user presses play, which may be days after
#    deploy. Gated on the dependency being installed: once @quiver-dsp/wasm is
#    in package.json, the assets MUST be in the build.
if grep -q '"@quiver-dsp/wasm"' package.json; then
  [ -f "$PUB/quiver.worklet.js" ] || err "quiver.worklet.js missing at the deployed prefix"
  [ -f "$PUB/quiver_bg.wasm" ] || err "quiver_bg.wasm missing at the deployed prefix"
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi
say "smoke: all checks passed"
