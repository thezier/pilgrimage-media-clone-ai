#!/bin/bash
# Publishes the site: regenerate portfolio pages from the CMS, commit, push.
# Cloudflare picks up the push and deploys within about a minute.
#
#   bash scripts/publish.sh
#
# Requires Tailscale to be up — PocketBase on the Pi is bound to the tailnet
# address and has no public surface.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PB_URL="${PB_URL:-http://100.123.155.98:8090}"

echo "==> 1/4  Checking the CMS is reachable"
if ! curl -sf --max-time 10 "$PB_URL/api/health" >/dev/null; then
  echo "    Can't reach PocketBase at $PB_URL"
  echo "    Is Tailscale running? Is the Pi up? Check with:"
  echo "      ssh -i ~/.ssh/id_ed25519_pi5 piadmin@100.123.155.98 'systemctl status pocketbase'"
  exit 1
fi
echo "    ok"

echo "==> 2/4  Generating portfolio pages"
PB_URL="$PB_URL" node prototype/portfolio-cms/build.mjs

echo "==> 3/4  Committing"
if git diff --quiet && git diff --cached --quiet; then
  echo "    nothing changed — site is already up to date"
  exit 0
fi
git add site/
git commit -q -m "Publish: regenerate portfolio pages from the CMS"
echo "    $(git rev-parse --short HEAD)"

echo "==> 4/4  Pushing (Cloudflare deploys automatically)"
git push -q origin master
echo
echo "Pushed. Live in ~1 minute at https://new.pilgrimage.media"
echo "Watch the build:  gh run list --limit 1"
