#!/usr/bin/env bash
# Copy the worklet bundle and the wasm binary from the installed
# @quiver-dsp/wasm package into static/, so they are versioned with the
# dependency rather than committed (tech-stack §5). Gatsby serves static/
# at the site root; the app resolves both through withPrefix (ADR-037).
#
# The dependency is currently a vendored tarball (vendor/*.tgz) built from
# quiver main — an explicit interim until the npm publish auth is fixed,
# after which the dependency line becomes a pinned registry version and
# nothing here changes.
set -euo pipefail

PKG="node_modules/@quiver-dsp/wasm"

[ -d "$PKG" ] || { echo "prebuild: @quiver-dsp/wasm is not installed" >&2; exit 1; }
[ -f "$PKG/dist/worklet.js" ] || { echo "prebuild: worklet bundle missing from package" >&2; exit 1; }
[ -f "$PKG/quiver_bg.wasm" ] || { echo "prebuild: quiver_bg.wasm missing from package" >&2; exit 1; }

cp "$PKG/dist/worklet.js" static/quiver.worklet.js
cp "$PKG/quiver_bg.wasm" static/quiver_bg.wasm

echo "prebuild: quiver worklet + wasm staged into static/"
