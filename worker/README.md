# Worker: contact form + Latest Posts

`contact.js` is the Cloudflare Worker for `pilgrimage.media`. Two concerns live
here: the contact form (`POST /api/contact`, `POST /api/share-contact`, both
emailing via Resend) and the homepage's Instagram-backed "Latest Posts"
section (`instagram.js` — see its own section below). Every other request
falls through to the static site, so nothing else changes.

The form works with or without JavaScript: `main.js` submits it in place via
fetch; without JS it does a plain POST and the Worker returns an HTML
thank-you page. A hidden honeypot field drops the obvious bots.

## One-time setup

Two settings live in the Cloudflare dashboard, **not** in this repo (it's public
— the delivery address and the API key don't belong in source):

**1. Verify `pilgrimage.media` in Resend**
- Sign up at <https://resend.com> (free tier is ample for a contact form).
- Add the domain `pilgrimage.media`. Its DNS is already in Cloudflare, so add
  the records Resend shows you in that zone's Cloudflare dashboard.
- `pilgrimage.media` has **no existing mail records**, so this is a clean add —
  nothing to work around. (We deliberately use it rather than `pilgrimagemedia.com`,
  which runs Proton mail: sending *from* the same domain the enquiry is delivered
  *to*, but via Resend rather than Proton, is the pattern spam filters treat as
  spoofing. Sending from a different domain sidesteps that, and it matches the
  site the visitor used.)
- The **from** address is `contact@pilgrimage.media` (committed default in
  `CONTACT_FROM`). There's no real mailbox behind it — it's a notification
  sender; replies go to the enquirer via `reply_to`.

**2. Set the Worker's variables**
Workers & Pages → `pilgrimage-media-clone-ai` → Settings → Variables and Secrets:

| Name | Type | Value |
|---|---|---|
| `RESEND_API_KEY` | Secret | your Resend API key (`re_…`) |
| `CONTACT_TO` | Variable | `mike@pilgrimagemedia.com` (where enquiries land) |

`CONTACT_TO` is a different domain from the site — that's fine. The email is
sent *from* the verified domain and delivered *to* this inbox; `reply_to` is set
to the enquirer so you can reply straight back.

Until both are set the form returns "isn't available right now" and logs which
value is missing — it never silently drops a real enquiry.

## Testing

Locally, the logic runs under `wrangler dev` (routing, honeypot, validation).
A real send needs the key, so the end-to-end test is: after setup, submit the
form on `new.pilgrimage.media` and confirm it lands in the inbox.

## Notes / possible follow-ups

- **Spam:** the honeypot stops naive bots. If spam gets through, add Cloudflare
  Turnstile (free, native) — a few lines here plus a widget on the form.
- **No stored record:** enquiries are emailed, not saved. If you later want a
  searchable log, the Worker could also write to Cloudflare D1.

---

# Latest Posts (Instagram)

`instagram.js` fetches `@pilgrimagemedia`'s recent posts from Meta's Graph API
and caches them in Workers KV. The homepage never calls Instagram directly —
`GET /api/latest-posts` just reads the cache, and a daily Cron Trigger
(`triggers.crons` in `wrangler.jsonc`) keeps it warm in the background. If the
cache is ever empty or the fetch fails, `site/js/main.js` leaves the 8
hardcoded fallback posts in `site/index.html` alone — the section never goes
blank.

## One-time setup

Requires `@pilgrimagemedia` to already be an Instagram **Business or Creator**
account linked to a Facebook Page (confirmed done 2026-07-24) — Instagram's
older Basic Display API doesn't need that, but it's been phased out; the Graph
API through a linked Page is the only supported path now.

**1. Create a Meta developer app and get a long-lived Page Access Token**
- [developers.facebook.com/apps](https://developers.facebook.com/apps) →
  Create App → **Business** type.
- In the [Graph API Explorer](https://developers.facebook.com/tools/explorer),
  select the app, get a User Access Token with `pages_show_list`,
  `pages_read_engagement`, `instagram_basic`.
- `GET /me/accounts` → find the linked Page, copy its `access_token` (the
  **Page Access Token**) — these don't expire under normal use (only breaks on
  a Facebook password change or revoking the app).
- `GET /{page-id}?fields=instagram_business_account` (using that Page token)
  → the **Instagram Business Account ID**.

**2. Set the Worker's secrets**
Workers & Pages → `pilgrimage-media-clone-ai` → Settings → Variables and
Secrets (or `wrangler secret put <NAME>` from the repo, same as
`RESEND_API_KEY`):

| Name | Value |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | the Page Access Token from step 1 |
| `INSTAGRAM_ACCOUNT_ID` | the Instagram Business Account ID from step 1 |

`REFRESH_SECRET` is already set (generated 2026-07-24) — it gates
`POST /api/refresh-posts`, used below to populate the cache immediately
instead of waiting for the next cron tick.

**3. Populate the cache for the first time**
```
curl -X POST -H "x-refresh-secret: <REFRESH_SECRET>" https://pilgrimage.media/api/refresh-posts
```
Check `https://pilgrimage.media/api/latest-posts` afterward — `{"ok":true,...}`
with real posts means it worked, and the homepage will pick them up on its
next load.

## Notes / possible follow-ups

- **Media types:** images and carousel albums use `media_url` directly; videos
  use `thumbnail_url` (a cover frame) since `media_url` for those is the raw
  video file, not something to put in an `<img>`.
- **If the token ever breaks** (Facebook password change, app revoked): redo
  step 1, `wrangler secret put INSTAGRAM_ACCESS_TOKEN` with the new value, then
  re-run the manual refresh in step 3.
- **Refresh cadence:** once a day (`triggers.crons`) is plenty for a personal
  photography account. Bump the cron schedule in `wrangler.jsonc` if that ever
  feels too slow.
