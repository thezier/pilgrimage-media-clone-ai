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

**1. Verify `pilgrimagemedia.com` in Resend**
- Sign up at <https://resend.com> (free tier is ample for a contact form).
- Add the domain `pilgrimagemedia.com`. Its DNS is already in Cloudflare, so add
  the records Resend shows you in that zone's Cloudflare dashboard.
- **⚠️ Don't touch the existing Proton mail records.** `pilgrimagemedia.com`
  already receives mail via Proton (a root `MX` → `protonmail.ch` and a root
  `SPF` TXT). Resend's records are additive — a DKIM selector like
  `resend._domainkey`, and its own `MX`/`SPF` on a `send.` subdomain — so they
  don't collide. Just **add** what Resend gives you; do not edit or replace the
  root `MX` or the existing root `SPF` record, or you'll break Proton email.
- The **from** address is `contact@pilgrimagemedia.com` (committed default in
  `CONTACT_FROM`), which lives on this verified domain.

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
