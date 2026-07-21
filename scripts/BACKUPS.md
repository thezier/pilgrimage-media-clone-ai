# CMS backups

The PocketBase data (`/mnt/mtp1/pocketbase/pb_data` on the Pi) is the entire
CMS — the SQLite databases plus every uploaded original photo. It's the one
thing here that can't be regenerated, so it's backed up on a schedule.

## How it works

Everything runs on the Pi, which is always on:

1. **`scripts/pi/pb-backup.sh`** — every 6 hours (cron), takes a *consistent*
   snapshot into `/mnt/mtp1/pocketbase/backups/pb-<timestamp>.tar.gz` and keeps
   the last 14. It uses `sqlite3 .backup`, not a file copy: the databases run
   in WAL mode, so copying a live `.db` can capture a torn, unrestorable file.
2. **`scripts/pi/pb-upload.sh`** — runs right after, uploads new snapshots to
   Google Drive via rclone and prunes the Drive copies to 30 days.

Cron line on the Pi:

```
0 */6 * * * { /mnt/mtp1/pocketbase/pb-backup.sh && /mnt/mtp1/pocketbase/pb-upload.sh ; } >> /mnt/mtp1/pocketbase/backups/backup.log 2>&1
```

The scripts under `scripts/pi/` are reference copies; the live ones live at
`/mnt/mtp1/pocketbase/` on the Pi.

## One-time Google Drive authorization

The upload skips quietly until rclone is authorized. Do this once — the OAuth
is your Google login, so it can't be automated. Full prompt-by-prompt answers
are in `/mnt/mtp1/pocketbase/RCLONE-SETUP.txt` on the Pi. In short:

- On the Pi: `rclone config` → new remote named `gdrive`, storage `drive`,
  **scope `drive.file`** (rclone only ever sees files it creates — it cannot
  read the rest of your Drive), and answer **no** to "use web browser to
  automatically authenticate" (the Pi is headless).
- rclone prints an `rclone authorize "drive" "…"` line. Run that on your Mac
  (rclone is installed there); a browser opens; log in. Paste the resulting
  token back on the Pi.
- Verify: `/mnt/mtp1/pocketbase/pb-upload.sh` should upload rather than skip.

Backups land in a **`PocketBase-Backups`** folder in that Google Drive.

## Restoring

A snapshot is a tarball of `pb_data`. To restore, stop PocketBase, replace the
directory, start it again:

```
scp <a-backup>.tar.gz piadmin@100.123.155.98:/tmp/
ssh piadmin@100.123.155.98
  sudo systemctl stop pocketbase
  cd /mnt/mtp1/pocketbase
  mv pb_data pb_data.old
  tar -xzf /tmp/<a-backup>.tar.gz         # extracts pb_data/
  sudo systemctl start pocketbase
```

Verified working: a snapshot pulled from Drive extracts to a clean `pb_data`
with `PRAGMA integrity_check = ok`, all projects, and every storage file.

## Checking on it

```
# recent backup activity
ssh piadmin@100.123.155.98 'tail /mnt/mtp1/pocketbase/backups/backup.log'

# what's on the Pi
ssh piadmin@100.123.155.98 'ls -lh /mnt/mtp1/pocketbase/backups/'

# what's in Drive
ssh piadmin@100.123.155.98 'rclone lsl gdrive:PocketBase-Backups'
```

## Manual Mac-side fallback

`scripts/backup-pb-to-drive.sh` pulls snapshots straight into the Google Drive
mount from the Mac. It can't be *scheduled* (macOS blocks background jobs from
cloud-storage folders without a Full Disk Access grant), but it works when run
by hand from Terminal, as a belt-and-suspenders copy.
