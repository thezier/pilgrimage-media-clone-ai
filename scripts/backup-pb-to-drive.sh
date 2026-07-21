#!/bin/bash
# Pulls the Pi's PocketBase snapshots into Google Drive.
#
# The Pi makes consistent snapshots on its own cron (every 6h) — this just
# copies whatever tarballs exist down into Drive and prunes old ones. Because
# the two are decoupled, if this Mac is off for a few days it simply syncs the
# accumulated snapshots the next time it runs.
#
# Runs from the com.pilgrimage.pb-backup LaunchAgent. Safe to run by hand.
set -euo pipefail

KEY="$HOME/.ssh/id_ed25519_pi5"
HOST="piadmin@100.123.155.98"
SRC="/mnt/mtp1/pocketbase/backups/"
DRIVE="$HOME/Library/CloudStorage/GoogleDrive-mike.thezier@gmail.com/My Drive/Pilgrimage Media/CMS Backups"
DRIVE_KEEP_DAYS=30

log() { echo "$(date '+%Y-%m-%d %H:%M:%S')  $*"; }

# Bail cleanly (not an error) if the tailnet/Pi isn't reachable — the Mac may
# just be off-network. The Pi keeps making snapshots regardless; we'll catch up.
if ! ssh -i "$KEY" -o ConnectTimeout=15 -o BatchMode=yes "$HOST" 'true' 2>/dev/null; then
  log "Pi not reachable (tailnet down?) — skipping this run"
  exit 0
fi

# The Drive mount can be absent if Google Drive isn't running.
if [ ! -d "$(dirname "$DRIVE")" ]; then
  log "Google Drive not mounted — skipping this run"
  exit 0
fi
mkdir -p "$DRIVE"

# Immutable, timestamped filenames, so --ignore-existing never recopies and we
# never need --delete. The log file stays on the Pi.
rsync -a --ignore-existing --exclude='*.log' -e "ssh -i $KEY" "$HOST:$SRC" "$DRIVE/"

# Prune Drive to the retention window (Drive is the long-term copy; the Pi only
# keeps a handful).
find "$DRIVE" -name 'pb-*.tar.gz' -type f -mtime +"$DRIVE_KEEP_DAYS" -delete 2>/dev/null || true

COUNT=$(find "$DRIVE" -name 'pb-*.tar.gz' -type f | wc -l | tr -d ' ')
# basename directly, not via xargs — the Drive path contains spaces.
LATEST=$(ls -1t "$DRIVE"/pb-*.tar.gz 2>/dev/null | head -1)
log "synced — $COUNT snapshot(s) in Drive, latest ${LATEST:+$(basename "$LATEST")}"
