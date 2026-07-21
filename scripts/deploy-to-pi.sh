#!/bin/bash
# Builds the static export and rsyncs it to the Pi, which serves it at
# https://beta.pilgrimage.media via the shared Caddy container + Cloudflare Tunnel.
#
# Safe to re-run. There is no server process to restart — Caddy serves the
# directory directly, so a sync is the whole deploy.
#
# Infrastructure (already in place, see the Obsidian "Pi Self-Hosting" handoff):
#   Caddy block   /mnt/mtp1/docker/caddy/Caddyfile  -> http://beta.pilgrimage.media
#   DNS           CNAME beta.pilgrimage.media -> <tunnel>.cfargotunnel.com (proxied)
#   Tunnel        ingress rule in /etc/cloudflared/config.yml -> localhost:8080
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PI_HOST="piadmin@100.123.155.98"   # tailnet IP, not the .local name
PI_DIR="/mnt/mtp1/sites/pilgrimage-beta/"
# $HOME resolves per-machine, so each Mac just needs its own key generated once
# and its public half added to the Pi's authorized_keys.
PI_KEY="$HOME/.ssh/id_ed25519_pi5"

if [ ! -f "$PI_KEY" ]; then
  echo "No SSH key at $PI_KEY on this machine ($(hostname))."
  echo "  ssh-keygen -t ed25519 -f $PI_KEY -N ''"
  echo "Then add ${PI_KEY}.pub to the Pi's ~/.ssh/authorized_keys from a machine"
  echo "that already has access, and approve this device in Tailscale SSH."
  exit 1
fi

echo "==> 1/4  Checking SSH connectivity"
ssh -i "$PI_KEY" -o ConnectTimeout=15 "$PI_HOST" 'echo "    connected to $(hostname)"'

echo "==> 2/4  Building static export"
cd "$REPO"
rm -rf out
npm run build >/dev/null
[ -f out/index.html ] || { echo "    build produced no out/index.html"; exit 1; }
echo "    $(find out -type f | wc -l | tr -d ' ') files, $(du -sh out | cut -f1)"

echo "==> 3/4  Syncing to the Pi"
# --delete so removed files don't linger. Next emits content-hashed asset names
# under _next/static/, so there is no need for the cache-busting query string
# the older hand-written clone required.
rsync -a --delete -e "ssh -i $PI_KEY" "$REPO/out/" "$PI_HOST:$PI_DIR"

echo "==> 4/4  Verifying"
ssh -i "$PI_KEY" "$PI_HOST" \
  'printf "    origin (Caddy): %s\n" "$(curl -s -o /dev/null -w "%{http_code}" -H "Host: beta.pilgrimage.media" http://localhost:8080/)"'
printf "    public (HTTPS): %s\n" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 https://beta.pilgrimage.media/)"

echo
echo "Done — https://beta.pilgrimage.media"
