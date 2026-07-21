# SiteFooter Specification

## Overview
- **Target file:** `src/components/SiteFooter.tsx`
- **Interaction model:** static, plus one newsletter form (visual only — no backend).
- White background, black text, two columns. **No diagonal divider.**

## DOM Structure
```
<footer>                                   background: #FFFFFF; display:flex; align-items:center
  <div class="fe-grid">
    <h3>Pilgrimage Media</h3>              left column
    <p><a>Athletes &amp; Fitness</a></p>   5 separate blocks, one per link
    …
    <p class="small">Stay in the Loop<br/>—</p>   right column
    <div class="newsletter">
      <h2>Subscribe to our newsletter</h2>
      <form><input type="email"><button>Sign up</button></form>
    </div>
  </div>
</footer>
```

## Computed Styles

### footer section
- background-color: `rgb(255, 255, 255)`
- color: `rgb(0, 0, 0)`
- display: flex; align-items: center
- height @1440: 381px (content-driven)
- **No clip-path, no divider, no upward bleed** — it is a plain block.

### wordmark `PILGRIMAGE MEDIA` (h3)
- "Roboto Condensed" 600 uppercase; font-size `var(--fs-h3)` → 36.736px @1440
- line-height 1.143 (41.9672px); letter-spacing 0.07em (2.57152px)
- color: `rgb(0,0,0)`; text-align: start

### nav links (5, each its own grid block)
- "IBM Plex Mono" 600; 16px / 24px; letter-spacing -0.02em; color: `rgb(0,0,0)`
- Each block is exactly 24px tall and they stack on consecutive rows.

### "Stay in the Loop —"
- This is Squarespace's `sqsrte-small` style: **14px**, line-height ~21.4px
  ("IBM Plex Mono" 600, letter-spacing -0.02em, color `rgb(0,0,0)`)
- **Two lines**: the label, then the em-dash alone on its own line below.
  Render as `Stay in the Loop<br />—` — it is NOT one line with a trailing dash.
- Block height 68px, inner text height 43px @1440.

### newsletter heading `SUBSCRIBE TO OUR NEWSLETTER` (h2)
- "Roboto Condensed" 600 uppercase; font-size 36.736px @1440 — i.e. the **h3 size**,
  not the h2 size, despite being an `<h2>`. Use `var(--fs-h3)`.
- line-height 1.2 (44.0832px); letter-spacing 0.07em (2.57152px)
- color: `rgb(0,0,0)`; text-align: left; **margin: 0 0 16px**
- Wraps to two lines @1440 (block height 88px).

### newsletter form
Input and button sit side by side, each in a wrapper with `margin-top: 16px`.

**input** (email)
- width 284px; height 66px @1440
- padding: 22.4px 32px
- background: `rgb(255,255,255)`; color: `rgb(0,0,0)`
- border: `1px solid rgba(0, 0, 0, 0.12)`
- "IBM Plex Mono" 600; font-size 16px; line-height 19.2px; letter-spacing -0.02em

**button** `Sign up`
- width 131px; height 64px @1440
- padding: 22.4px 32px; border: 0
- background: `rgb(105, 109, 94)` (olive); color: `rgb(255,255,255)`
- "IBM Plex Mono" 600; 16px; line-height 19.2px; text-align: center
- **`white-space: nowrap`** — without it the label wraps to two lines at this width
- Its wrapper has `padding: 8px 4px 8px 0`
- Set `type="button"`; the form does not submit anywhere. Do not wire up a backend.

## Fluid Engine grid-areas (verbatim)

| element | mobile (<768) | desktop (>=768) |
|---|---|---|
| wordmark | `2 / 2 / 5 / 6` | `2 / 2 / 4 / 14` |
| Athletes & Fitness | `5 / 2 / 6 / 10` | `4 / 2 / 5 / 10` |
| Sports & Events | `6 / 2 / 7 / 10` | `5 / 2 / 6 / 10` |
| Health & Adventure | `7 / 2 / 8 / 10` | `6 / 2 / 7 / 10` |
| About | `8 / 2 / 9 / 10` | `7 / 2 / 8 / 10` |
| Contact | `9 / 2 / 10 / 10` | `8 / 2 / 9 / 10` |
| "Stay in the Loop —" | `12 / 2 / 14 / 10` | `2 / 17 / 4 / 26` |
| newsletter block | `14 / 2 / 24 / 10` | `4 / 17 / 10 / 26` |

Desktop: links in columns 2–14 (left), newsletter in columns 17–26 (right).
Mobile: everything stacks in a single full-width column.

## States & Behaviors
- **Hover:** the olive `Sign up` button follows the shared solid-button rule
  (`opacity .1s linear`). Footer links declare no hover style on the live site.
- No scroll behaviour.

## Assets
None.

## Text Content (verbatim)
- Wordmark: `Pilgrimage Media`
- Links (import `FOOTER_LINKS` from `@/lib/content`):
  `Athletes & Fitness` → `/fitness-athletes` · `Sports & Events` → `/sports-events` ·
  `Health & Adventure` → `/health-adventure` · `About` → `/about` · `Contact` → `/contact`
- `Stay in the Loop` then `—` on the next line
- `Subscribe to our newsletter` (uppercased by CSS)
- Button: `Sign up`
- Input placeholder: none on the live site — leave it empty.

## Responsive Behavior
- **1440px / 768px:** two columns (links left, newsletter right).
- **390px:** single column — wordmark, links, "Stay in the Loop", newsletter.
- **Breakpoint:** 768px.
