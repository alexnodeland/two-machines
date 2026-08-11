#!/usr/bin/env bash
#
# Two Machines — reference archiver
#
# Reads sources.yaml and rebuilds references/files/ locally.
# sources.yaml and this script are committed; files/ is gitignored, so the
# archive is reproducible from the repository rather than stored in it.
#
#   ./fetch.sh              fetch everything with fetch.status: ok  (curl)
#   ./fetch.sh --browser    fetch the `blocked` ones through a real browser
#   ./fetch.sh --all        curl + browser + extract to clean Markdown
#   ./fetch.sh --retry      re-attempt `blocked` ones with curl (expect failure;
#                           use when checking whether a block has lifted)
#   ./fetch.sh --check      fetch nothing; report liveness of every URL
#   ./fetch.sh --verify     verify existing local files against the manifest
#   ./fetch.sh <id> ...     only the given ids (combine with a mode flag)
#
# Fetching writes raw HTML to files/raw/. `node extract.mjs` turns that into
# readable Markdown in files/ using Defuddle — the raw pages are 90% chrome.
#
# Dependencies: bash, curl, awk for the default path — deliberately no YAML
# library, so this runs before the project has a node_modules.
# --browser additionally needs Node and Playwright: cd references && bun install

set -uo pipefail

cd "$(dirname "$0")"

MANIFEST="sources.yaml"
DIR="files/raw"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TIMEOUT=45
SLEEP=1

bold=$'\033[1m'; dim=$'\033[2m'; red=$'\033[31m'; grn=$'\033[32m'; ylw=$'\033[33m'; off=$'\033[0m'

MODE="fetch"
ONLY=()
for a in "$@"; do
  case "$a" in
    --retry)   MODE="retry" ;;
    --check)   MODE="check" ;;
    --verify)  MODE="verify" ;;
    --browser) MODE="browser" ;;
    --all)     MODE="all" ;;
    -h|--help) sed -n '2,24p' "$0" | sed 's/^# \?//'; exit 0 ;;
    -*) echo "unknown flag: $a" >&2; exit 2 ;;
    *) ONLY+=("$a") ;;
  esac
done

[ -f "$MANIFEST" ] || { echo "${red}no $MANIFEST here${off}" >&2; exit 1; }
mkdir -p "$DIR"

# ---------------------------------------------------------------------------
# Parse the manifest into: id ␟ url ␟ archive ␟ status
#
# Fields are separated by US (0x1f), NOT tab. Tab is IFS whitespace, so bash
# collapses runs of it — a record with an empty field (a source with no url,
# e.g. a physical sleeve) would silently shift every later column left and
# report nonsense. US is not whitespace, so empty fields survive.
#
# One record per `- id:` block. Only the first occurrence of each key inside a
# block is taken, so `hint:` lines containing colons cannot corrupt a record.
# ---------------------------------------------------------------------------
SEP=$'\x1f'
records=$(awk -v S=$'\x1f' '
  function flush() {
    if (id != "") printf "%s%s%s%s%s%s%s\n", id, S, url, S, archive, S, (status=="" ? "ok" : status)
    id=""; url=""; archive=""; status=""
  }
  /^  - id:[[:space:]]*/       { flush(); id=$0; sub(/^  - id:[[:space:]]*/,"",id); next }
  id=="" { next }
  /^    url:[[:space:]]*/      { if (url=="")     { url=$0;     sub(/^    url:[[:space:]]*/,"",url) } next }
  /^    archive:[[:space:]]*/  { if (archive=="") { archive=$0; sub(/^    archive:[[:space:]]*/,"",archive) } next }
  # status appears either inline as `fetch: { status: ok }` or as `      status: x`
  /^    fetch:[[:space:]]*\{/  { if (status=="") { s=$0; sub(/.*status:[[:space:]]*/,"",s); sub(/[[:space:]]*\}.*/,"",s); status=s } next }
  /^      status:[[:space:]]*/ { if (status=="") { status=$0; sub(/^      status:[[:space:]]*/,"",status) } next }
  END { flush() }
' "$MANIFEST")

total=0; ok=0; failed=0; skipped=0
declare -a FAILED_IDS=()

want() {  # should we act on this id?
  local id="$1"
  [ ${#ONLY[@]} -eq 0 ] && return 0
  for o in "${ONLY[@]}"; do [ "$o" = "$id" ] && return 0; done
  return 1
}

# A page that returns 200 but is a bot-check or error page is not an archive.
looks_bogus() {
  local f="$1" head
  [ -s "$f" ] || { echo "empty"; return; }
  [ "$(wc -c <"$f" | tr -d ' ')" -lt 2000 ] && { echo "too small"; return; }
  head=$(head -c 2000 "$f" | tr -d '\n' | tr '[:upper:]' '[:lower:]')
  case "$head" in
    *"checking your browser"*)          echo "JS challenge" ;;
    *"enable javascript"*)              echo "JS required" ;;
    *"page not found"*|*"404 not found"*) echo "404 body" ;;
    *"access denied"*|*"403 forbidden"*)  echo "403 body" ;;
    *"are you a robot"*|*"captcha"*)    echo "captcha" ;;
    *) echo "" ;;
  esac
}

printf "%s\n" "${bold}Two Machines — reference archive${off}  ${dim}(${MODE})${off}"
echo

# ---------------------------------------------------------------------------
# Browser pass. Sources that serve an interstitial or a JS-rendered shell to
# curl are handed to Playwright, which waits the challenge out the way a
# person's browser does. Nothing is bypassed; anything needing a login or a
# solved CAPTCHA stays `manual` in the manifest.
# ---------------------------------------------------------------------------
run_browser_pass() {
  local jobs="" n=0
  while IFS="$SEP" read -r id url archive status; do
    [ -z "$id" ] && continue
    want "$id" || continue
    case "$status" in blocked|browser) ;; *) continue ;; esac
    [ "$url" = "null" ] || [ -z "$url" ] && continue
    [ "$archive" = "null" ] || [ -z "$archive" ] && archive="$DIR/$id.html"
    jobs+="{\"id\":\"$id\",\"url\":\"$url\",\"out\":\"$archive\"}"$'\n'
    n=$((n+1))
  done <<< "$records"

  if [ "$n" -eq 0 ]; then
    printf "  ${dim}nothing blocked to fetch${off}\n"; return 0
  fi
  if ! command -v node >/dev/null 2>&1; then
    printf "  ${red}node not found — --browser needs Node${off}\n"; return 1
  fi

  printf "  ${dim}%d source(s) via Playwright…${off}\n" "$n"
  local out
  out=$(printf '%s' "$jobs" | node fetch-browser.mjs 2>/tmp/tm-browser.err)
  local rc=$?

  if [ "$rc" -eq 3 ]; then
    printf "  ${ylw}%s${off}\n" "$(head -1 /tmp/tm-browser.err)"
    printf "  ${dim}%s${off}\n" "cd references && bun install"
    return 1
  fi
  [ -s /tmp/tm-browser.err ] && [ "$rc" -ne 0 ] && printf "  ${dim}%s${off}\n" "$(head -3 /tmp/tm-browser.err)"

  while IFS= read -r line; do
    [ -z "$line" ] && continue
    local rid rok rbytes rreason
    rid=$(printf '%s' "$line" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
    rok=$(printf '%s' "$line" | grep -o '"ok":true' || true)
    rbytes=$(printf '%s' "$line" | sed -n 's/.*"bytes":\([0-9]*\).*/\1/p')
    rreason=$(printf '%s' "$line" | sed -n 's/.*"reason":"\([^"]*\)".*/\1/p')
    if [ -n "$rok" ]; then
      printf "  ${grn}%-30s  %8s bytes ${dim}(browser)${off}\n" "$rid" "$rbytes"
      ok=$((ok+1))
    else
      printf "  ${red}%-30s  %s${off}\n" "$rid" "${rreason:-failed}"
      failed=$((failed+1)); FAILED_IDS+=("$rid")
    fi
    total=$((total+1))
  done <<< "$out"
}

if [ "$MODE" = "browser" ]; then
  run_browser_pass
  echo
  printf "%s  ${grn}%d ok${off}  ${red}%d failed${off}  of %d\n" "${bold}Result:${off}" "$ok" "$failed" "$total"
  if [ ${#FAILED_IDS[@]} -gt 0 ]; then
    echo; echo "${bold}Still failing:${off} ${FAILED_IDS[*]}"
    echo "${dim}These likely need a human — see fetch.hint in $MANIFEST.${off}"
  fi
  exit 0
fi

while IFS="$SEP" read -r id url archive status; do
  [ -z "$id" ] && continue
  want "$id" || continue
  total=$((total+1))

  # --- verify mode: check what is already on disk -------------------------
  if [ "$MODE" = "verify" ]; then
    if [ "$archive" = "null" ] || [ -z "$archive" ]; then
      printf "  ${dim}%-30s  no archive (%s)${off}\n" "$id" "$status"; skipped=$((skipped+1))
    elif [ -f "$archive" ]; then
      why=$(looks_bogus "$archive")
      if [ -n "$why" ]; then printf "  ${red}%-30s  BAD: %s${off}\n" "$id" "$why"; failed=$((failed+1)); FAILED_IDS+=("$id")
      else printf "  ${grn}%-30s  ok  %8s bytes${off}\n" "$id" "$(wc -c <"$archive" | tr -d ' ')"; ok=$((ok+1)); fi
    else
      printf "  ${red}%-30s  MISSING${off}\n" "$id"; failed=$((failed+1)); FAILED_IDS+=("$id")
    fi
    continue
  fi

  # --- check mode: liveness only ------------------------------------------
  if [ "$MODE" = "check" ]; then
    if [ "$url" = "" ] || [ "$url" = "null" ]; then
      printf "  ${dim}%-30s  no url (%s)${off}\n" "$id" "$status"; skipped=$((skipped+1)); continue
    fi
    code=$(curl -s -o /dev/null -L --max-time "$TIMEOUT" -A "$UA" -w '%{http_code}' "$url" </dev/null)
    if [ "$code" = "200" ]; then printf "  ${grn}%-30s  %s${off}\n" "$id" "$code"; ok=$((ok+1))
    else printf "  ${red}%-30s  %s  %s${off}\n" "$id" "$code" "$url"; failed=$((failed+1)); FAILED_IDS+=("$id"); fi
    sleep "$SLEEP"; continue
  fi

  # --- fetch / retry -------------------------------------------------------
  if [ "$status" != "ok" ]; then
    if [ "$MODE" = "retry" ] && [ "$status" = "blocked" ] && [ "$url" != "null" ]; then
      : # fall through and try it
    else
      # `browser` sources are not curl-fetchable by definition; in --all they
      # are picked up by the browser pass, so this is not a failure.
      printf "  ${dim}%-30s  skip (%s)${off}\n" "$id" "$status"; skipped=$((skipped+1)); continue
    fi
  fi

  if [ "$archive" = "null" ] || [ -z "$archive" ]; then
    # a blocked source being retried has no filename yet; derive one
    archive="$DIR/$id.html"
  fi

  mkdir -p "$(dirname "$archive")"
  code=$(curl -s -L --max-time "$TIMEOUT" -A "$UA" -w '%{http_code}' -o "$archive.part" "$url" </dev/null)

  if [ "$code" != "200" ]; then
    rm -f "$archive.part"
    printf "  ${red}%-30s  HTTP %s${off}\n" "$id" "$code"
    failed=$((failed+1)); FAILED_IDS+=("$id"); sleep "$SLEEP"; continue
  fi

  why=$(looks_bogus "$archive.part")
  if [ -n "$why" ]; then
    rm -f "$archive.part"
    printf "  ${ylw}%-30s  200 but %s${off}\n" "$id" "$why"
    failed=$((failed+1)); FAILED_IDS+=("$id"); sleep "$SLEEP"; continue
  fi

  mv "$archive.part" "$archive"
  printf "  ${grn}%-30s  %8s bytes${off}\n" "$id" "$(wc -c <"$archive" | tr -d ' ')"
  ok=$((ok+1))
  sleep "$SLEEP"
done <<< "$records"

# --all: curl pass above, then the browser pass, then extraction.
if [ "$MODE" = "all" ]; then
  echo
  printf "%s\n" "${dim}— browser pass —${off}"
  run_browser_pass
  if command -v node >/dev/null 2>&1; then
    echo
    printf "%s\n" "${dim}— extract —${off}"
    node extract.mjs || true
  fi
fi

echo
printf "%s  ${grn}%d ok${off}  ${red}%d failed${off}  ${dim}%d skipped${off}  of %d\n" \
  "${bold}Result:${off}" "$ok" "$failed" "$skipped" "$total"

if [ ${#FAILED_IDS[@]} -gt 0 ]; then
  echo
  echo "${bold}Needs attention:${off} ${FAILED_IDS[*]}"
  echo "${dim}Each has a fetch.hint in $MANIFEST saying what would make it work.${off}"
  echo "${dim}Improve the script, then: ./fetch.sh --retry${off}"
fi

# A failed *optional* fetch should not break a build; a failed verify should.
[ "$MODE" = "verify" ] && [ "$failed" -gt 0 ] && exit 1
exit 0
