# Portfolio CMS

PocketBase for authoring, static HTML for delivery.

**The live instance runs on the Pi**, bound to the tailnet address only:

| | |
|---|---|
| Admin UI | <http://100.123.155.98:8090/_/> (Tailscale must be up) |
| Service | `pocketbase.service` on the Pi, enabled at boot |
| Data | `/mnt/mtp1/pocketbase/pb_data` (SSD, not the SD card) |

It has **no public surface**: no Caddy block, no tunnel ingress, not bound to
`0.0.0.0`. An admin login has no business facing the internet.

## Publishing

```bash
bash scripts/publish.sh      # from the repo root
```

Regenerates the project pages from the CMS, commits, and pushes. Cloudflare
deploys within about a minute.

## Running a local copy instead

```bash
bash start.sh                       # local PocketBase on 127.0.0.1:8090
PB_URL=http://127.0.0.1:8090 node build.mjs
```

## The editing flow

1. Log into the admin UI.
2. Create a project — title, slug, summary, body, category, date.
3. Drag photos into `gallery`, pick a `cover`.
4. Tick `published` when it's ready. **Unpublished projects are invisible to the
   build** — not by the build script remembering to filter, but because the
   collection's read rule is `published = true`, so drafts aren't in the API
   response at all.
5. Run `bash scripts/publish.sh` from the repo root.

## What you get out

```
site/portfolio/
  index.html                      the project index
  <slug>/index.html               one page per project
  <slug>/img/*.webp               responsive images, generated at build time
site/css/portfolio.css            portfolio-only rules; tokens come from style.css
```

Plain HTML and CSS. No JavaScript framework, no build-time magic beyond string
substitution — open `templates/project.html` and it reads like HTML, because it is.

## Why it's shaped this way

**Static delivery.** PocketBase is only ever where you type and upload. Visitors
get files, so the public site stays fast and indexable, and can be hosted
anywhere — including somewhere that isn't a Pi on a coffee shop's uplink.

**Images processed once, at build.** Each photo becomes 640/1024/1600/2400px WebP with
correct `srcset`/`sizes` and intrinsic `width`/`height` so the page doesn't jump
while loading. Originals are never served. Measured on the sample content: a
104KB JPEG becomes a 30KB WebP at 640px. The build never upscales — a small
source just produces fewer variants.

**SEO comes free.** Every generated page gets a real `<title>`, meta description,
Open Graph tags, a canonical URL and `CreativeWork` JSON-LD. Worth noting because
the site audit found empty meta descriptions on every page of the live site.

**Schema as code.** `setup.mjs` defines the collection rather than it being
clicked together in the UI, so it can be recreated, reviewed, and moved to the Pi
unchanged.

## Files

| | |
|---|---|
| `setup.mjs` | creates the `projects` collection |
| `seed.mjs` | sample content, using real photos from `public/images/` |
| `build.mjs` | PocketBase → static HTML + responsive WebP |
| `templates/` | the HTML and CSS you'd actually maintain |
| `pb_data/` | local copy only; the real one lives on the Pi (gitignored) |

## Operating it

- **Back up `/mnt/mtp1/pocketbase/pb_data` on the Pi.** That directory *is* the
  whole CMS — SQLite file plus every uploaded original. Copying it is a
  complete backup; nothing else needs saving. It is currently NOT backed up.
- Service control: `sudo systemctl {status,restart} pocketbase` on the Pi.
- Reaching the admin UI requires Tailscale to be up. That is deliberate.

## Decisions made

- **One layout for all projects** (decided 2026-07-20). Projects vary by words and
  photos, not arrangement. If a future shoot needs to break the pattern, add a
  `layout` select field to the collection and branch in the template — don't
  start hand-maintaining per-project HTML.

## Known limits

- PocketBase is v0.39.x with no 1.0 and no support guarantees. Acceptable here
  because content is plain SQLite + files on disk and `build.mjs` is the only
  integration point — swapping the CMS later means rewriting one script.
- The file field is functional rather than a luxurious media library. Ordering
  40 images is workable, not delightful. Directus is the upgrade if that grates.
- Gallery ordering follows upload order; there's no drag-to-reorder.
