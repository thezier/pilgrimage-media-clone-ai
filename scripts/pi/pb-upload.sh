#!/bin/bash
# Uploads the local PocketBase snapshots to Google Drive via rclone.
#
# Runs on the Pi right after pb-backup.sh. The Pi is always on, so backups
# reach Drive on schedule regardless of whether the Mac is awake.
#
# Until the one-time `rclone config` OAuth is done, this exits quietly so it
# doesn't spam cron — snapshots still accumulate locally in the meantime.
set -euo pipefail

REMOTE="gdrive:PocketBase-Backups"
SRC=/mnt/mtp1/pocketbase/backups
KEEP_DAYS=30

# No remote configured yet → nothing to do.
if ! rclone listremotes 2>/dev/null | grep -q '^gdrive:'; then
  echo "$(date '+%F %T')  rclone 'gdrive' not configured yet — skipping upload"
  exit 0
fi

# Copy any tarballs not already there (copy, not sync: never let a local prune
# delete the Drive copy — Drive is the long-term store).
rclone copy "$SRC" "$REMOTE" --include 'pb-*.tar.gz' --no-traverse

# Prune the Drive copies to the retention window.
rclone delete "$REMOTE" --include 'pb-*.tar.gz' --min-age "${KEEP_DAYS}d"

N=$(rclone lsf "$REMOTE" --include 'pb-*.tar.gz' 2>/dev/null | wc -l | tr -d ' ')
echo "$(date '+%F %T')  uploaded — $N snapshot(s) in Drive"
