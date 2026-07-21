#!/bin/bash
# Starts the prototype CMS locally and opens the admin UI.
#   bash start.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

EMAIL="${PB_EMAIL:-mike@thezier.com}"
PASSWORD="${PB_PASSWORD:-prototype-password-change-me}"

if [ ! -x ./pocketbase ]; then
  echo "PocketBase binary missing. Download the darwin_arm64 build from:"
  echo "  https://github.com/pocketbase/pocketbase/releases"
  exit 1
fi

if pgrep -f "pocketbase serve" >/dev/null; then
  echo "==> already running"
else
  echo "==> starting PocketBase on http://127.0.0.1:8090"
  ./pocketbase serve --http=127.0.0.1:8090 >pb.log 2>&1 &
  sleep 3
fi

# Idempotent: creates the superuser on first run, updates the password after.
./pocketbase superuser upsert "$EMAIL" "$PASSWORD" >/dev/null 2>&1 || true

if ! curl -s "http://127.0.0.1:8090/api/collections/projects/records" | grep -q '"items"'; then
  echo "==> creating schema"
  node setup.mjs
fi

echo
echo "  Admin UI   http://127.0.0.1:8090/_/"
echo "  Login      $EMAIL / $PASSWORD"
echo
echo "  Add or edit a project, then run:  node build.mjs"
echo "  Preview:  cd dist && python3 -m http.server 4400"
echo "            http://localhost:4400/portfolio/"
