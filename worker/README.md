# Contact form handler

`contact.js` is the Cloudflare Worker for `new.pilgrimage.media`. It has one
dynamic route — `POST /api/contact` — which emails the contact form via Resend.
Every other request falls through to the static site, so nothing else changes.

The form works with or without JavaScript: `main.js` submits it in place via
fetch; without JS it does a plain POST and the Worker returns an HTML
thank-you page. A hidden honeypot field drops the obvious bots.

## One-time setup

Two settings live in the Cloudflare dashboard, **not** in this repo (it's public
— the delivery address and the API key don't belong in source):

**1. Verify a sending domain in Resend**
- Sign up at <https://resend.com> (free tier is ample for a contact form).
- Add a domain and verify it. `pilgrimage.media` is the natural choice since it
  matches the site and its DNS is already in Cloudflare — Resend gives you a few
  DNS records (DKIM/SPF); add them in the Cloudflare dashboard for the zone.
- The **from** address must be on this verified domain. The committed default is
  `contact@pilgrimage.media` (see `CONTACT_FROM` in `wrangler.jsonc`). If you
  verify a different domain, override `CONTACT_FROM` in the dashboard.

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
