# ServicesSection Specification

## Overview
- **Target file:** `src/components/ServicesSection.tsx`
- **Interaction model:** static.
- This is the first **light** section — text is BLACK on a white background with a
  full-bleed photo.

## DOM Structure
```
<section id="services" class="section" style="z-index:3">   padding-bottom: 6vw
  <div class="section-border divider-up">    inset: -6vw 0 0; background: #FFFFFF
     <img services-bg.jpg>                   absolute inset-0; object-fit: cover; object-position: 50% 50%
  </div>
  <div class="section-content fe-grid"> … 5 blocks … </div>
</section>
```

## Computed Styles

### section
- id: `services` (nav anchors `/#services` here)
- z-index: **3**
- padding-bottom: 6vw; height @1440: 885px
- Text colour throughout: `rgb(0, 0, 0)`

### .section-border
- `inset: -6vw 0 0`
- background-color: `rgb(255,255,255)` — **white**, not the concrete tan
- clip: **`.divider-up`** — flush left, high right
- `public/images/services-bg.jpg` (natural 1440×736), `object-fit: cover`,
  **`object-position: 50% 50%`** (plain centre — not `75% center`)
- **There is no gradient scrim.** The live site's computed `background-image` on the
  text and its whole ancestor chain is `none`. Do not add one. The light-text-over-
  dark-photo contrast dip is present on the live site too.

### h1 "SERVICES"
- "Roboto Condensed" 600 uppercase; `var(--fs-h1)` (67.84px @1440)
- line-height 1.056; letter-spacing 0.07em; color: `rgb(0,0,0)`

### horizontal rule
- height 1px; border 0; background: `rgb(0,0,0)` (**black** here, white in Portfolio)
- margin: 8px 0

### eyebrow "PHOTOGRAPHY / VIDEOGRAPHY"
Heading-styled, **not** the mono italic used in Portfolio:
- font-family: "Roboto Condensed"; font-weight: 600; font-style: **normal**
- font-size: `var(--fs-em)` → ~26.4px @1440; line-height ~1.17
- text-transform: uppercase; letter-spacing: 0.07em; color: `rgb(0,0,0)`

### body paragraphs (2)
- "IBM Plex Mono" 600; 16px / 24px; letter-spacing -0.02em; color: `rgb(0,0,0)`
- Paragraph 1 margin: `0 0 16px`; paragraph 2 margin: `16px 0`
- Each opens with an **italic** lead phrase:
  - `Personal Branding` — font-style italic, **font-weight 700**
  - `Commercial photography & videography` — font-style italic, **font-weight 600**
  (The weights genuinely differ on the live site; match them exactly.)

### button "Let's Connect" → `/contact`
- Use `.btn .btn-solid`: height 68px; padding 0 34.736px; border 0;
  background `rgb(105,109,94)`; color `#fff`;
  **text-transform: none; letter-spacing: normal** (mixed case — unlike the
  Portfolio button, which is uppercase with 0.1em tracking)
- transition: `opacity .1s linear`
- Rendered size @1440: 267×68

## Fluid Engine grid-areas (verbatim)

| element | mobile (<768) | desktop (>=768) |
|---|---|---|
| h1 "SERVICES" | `3 / 2 / 5 / 10` | `4 / 2 / 6 / 14` |
| horizontal rule | `5 / 2 / 6 / 10` | `6 / 2 / 7 / 11` |
| eyebrow | `6 / 2 / 8 / 10` | `8 / 2 / 9 / 14` |
| body paragraphs | `8 / 2 / 16 / 9` | `9 / 2 / 14 / 14` |
| button | `27 / 3 / 29 / 9` | `15 / 2 / 17 / 7` |

Content sits in the **left half** on desktop (cols 2–14). On mobile the button jumps
to row 27 — rows 16–27 are deliberately empty so the background photo shows through
below the text. That gap is intentional; reproduce it via the grid-area, not a margin.

## States & Behaviors
- **Hover (button only):** `opacity .1s linear`.
- No scroll behaviour, no other hover states.

## Assets
- `public/images/services-bg.jpg`

## Text Content (verbatim)
- H1: `Services`
- Eyebrow: `Photography / Videography`
- Paragraph 1: *(italic bold)* `Personal Branding` + ` for athletes, trainers, and coaches building a healthier, more vibrant future through movement and discipline.`
- Paragraph 2: *(italic)* `Commercial photography & videography` + ` for teams and brands that want their story told with intent.`
- Button: `Let's Connect` → `/contact` (mixed case — do NOT uppercase)

Import the paragraphs from `SERVICE_LINES` in `@/lib/content`.

## Responsive Behavior
- **1440px:** text column on the left, photo full-bleed behind everything.
- **768px:** same layout, narrower.
- **390px:** text at the top, then a tall empty band showing the photo, then the button.
- **Breakpoint:** 768px.
