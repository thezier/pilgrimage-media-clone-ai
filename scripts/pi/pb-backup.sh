#!/bin/bash
# Consistent snapshot of the PocketBase data into a timestamped tarball.
#
# Uses `sqlite3 .backup` for the databases rather than copying the files: the
# DBs run in WAL mode, so a plain copy of a live .db can be torn and
# unrestorable. .backup takes a proper online snapshot regardless of concurrent
# writes. The storage/ dir holds immutable uploaded originals, safe to copy.
#
# Runs from cron on the Pi, and on demand from the Mac's Drive-sync job.
set -euo pipefail

DATA=/mnt/mtp1/pocketbase/pb_data
DEST=/mnt/mtp1/pocketbase/backups
KEEP=14
STAMP=$(date +%Y%m%d-%H%M%S)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$DEST" "$WORK/pb_data"

# Online snapshot of each database (folds the -wal in; no -wal/-shm to copy).
for db in data auxiliary; do
  sqlite3 "$DATA/$db.db" ".backup '$WORK/pb_data/$db.db'"
done

# Uploaded files.
if [ -d "$DATA/storage" ]; then
  cp -a "$DATA/storage" "$WORK/pb_data/storage"
fi

tar -czf "$DEST/pb-$STAMP.tar.gz" -C "$WORK" pb_data

# Keep the most recent $KEEP tarballs, drop the rest.
ls -1t "$DEST"/pb-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "pb-$STAMP.tar.gz ($(du -h "$DEST/pb-$STAMP.tar.gz" | cut -f1))"
