# PortfolioSection Specification

## Overview
- **Target file:** `src/components/PortfolioSection.tsx`
- **Interaction model:** static. (The live site has a scroll-pinned parallax on this
  photo; it is explicitly out of scope — build it as a static full-bleed photo.)

## DOM Structure
```
<section id="portfolio" class="section" style="z-index:5">   padding-bottom: 6vw
  <div class="section-border divider-up">      inset: -6vw 0 0
     background-color: #696D5E   (olive — visible in the 6vw bleed band above)
     <img portfolio-bg.jpg>      absolute inset-0, object-fit: cover
  </div>
  <div class="section-content fe-grid"> … 8 blocks … </div>
</section>
```

## Computed Styles

### section
- id: `portfolio` (the nav anchors `/#portfolio` here)
- z-index: **5**
- padding-bottom: 6vw; height @1440: 1051px

### .section-border
- `inset: -6vw 0 0` — bleeds 6vw **upward** into the hero's space
- background-color: `rgb(105,109,94)` = `#696D5E` (olive)
- clip: **`.divider-up`** — flush at the left, high on the right
- contains `public/images/portfolio-bg.jpg` (natural 1440×897) `object-fit: cover`

### h1 "View the Galleries"
- "Roboto Condensed" 600 uppercase; font-size `var(--fs-h1)` (67.84px @1440)
- line-height 1.056 (71.639px); letter-spacing 0.07em (4.7488px)
- color: rgb(255,255,255); text-align: start

### horizontal rule
- height 1px; border: 0; background: `rgb(255,255,255)`; margin: 8px 0
- width: 490px @1440 — but that is the block's grid-area width, so let it fill 100%

### eyebrow "Portfolio image categories"
- "IBM Plex Mono" **italic** 600; 16px / 24px; letter-spacing -0.02em
- color: rgb(255,255,255)

### category headings (3)
- "Roboto Condensed" 600 uppercase; font-size `var(--fs-h3)` (36.736px @1440)
- line-height 1.143 (41.9672px); letter-spacing 0.07em (2.57152px)
- color: rgb(255,255,255)
- **NO border-bottom.** Verified: the block's computed `border-bottom` is
  `0px none`. An earlier clone drew rules under these — that is wrong.
- Each heading wraps an `<a>`; the anchor is `display:inline` so it is only as
  wide as the text (366px for "ATHLETES & FITNESS", not the full 824px block).
- No hover style declared on the live site.

### body paragraph
- "IBM Plex Mono" 600; 16px / 24px; letter-spacing -0.02em; color: rgb(255,255,255)

### button "LET'S CONNECT" → `/contact`
- Use `.btn .btn-outline` (already in globals.css):
  height 68px; padding 0 34.736px; border 1px solid #fff; background transparent;
  color #fff; **text-transform: uppercase; letter-spacing: 0.1em (1.6px)**;
  transition `background-color .1s linear, color .1s linear`; hover → white bg / black text.
- Rendered size @1440: 212×68.

## Fluid Engine grid-areas (verbatim)

| element | mobile (<768) | desktop (>=768) |
|---|---|---|
| h1 "View the Galleries" | `3 / 2 / 6 / 10` | `5 / 11 / 9 / 26` |
| horizontal rule | `6 / 2 / 7 / 10` | `7 / 11 / 8 / 20` |
| eyebrow | `7 / 2 / 8 / 10` | `8 / 11 / 9 / 20` |
| ATHLETES & FITNESS | `11 / 2 / 13 / 11` | `10 / 11 / 12 / 26` |
| SPORTS & EVENTS | `14 / 2 / 16 / 11` | `12 / 11 / 14 / 26` |
| HEALTH & ADVENTURE | `17 / 2 / 19 / 11` | `14 / 11 / 16 / 26` |
| body paragraph | `20 / 2 / 25 / 9` | `17 / 11 / 19 / 21` |
| button | `25 / 2 / 27 / 7` | `20 / 11 / 22 / 15` |

Note the content sits in the **right half** on desktop (columns 11+) and the left on mobile.

## States & Behaviors
- **Hover (button only):** background transparent → `#fff`, colour `#fff` → `#000`,
  `transition: background-color .1s linear, color .1s linear`.
- Category links and the heading declare no hover transition.
- No scroll behaviour.

## Assets
- `public/images/portfolio-bg.jpg`

## Text Content (verbatim)
- H1: `View the Galleries`
- Eyebrow: `Portfolio image categories`
- Categories (import `PORTFOLIO_CATEGORIES` from `@/lib/content`):
  `Athletes & Fitness` → `/fitness-athletes`; `Sports & Events` → `/sports-events`;
  `Health & Adventure` → `/health-adventure`
- Body (import `PORTFOLIO_BODY`):
  `I strive to craft visuals that inspire everyday people to pursue strength, vitality, and a more active life — Let's inspire action and elevate lives through authentic, impactful media.`
- Button: `Let's Connect` → `/contact` (uppercased by CSS)

## Responsive Behavior
- **1440px:** content right half, photo full-bleed behind.
- **768px:** same, 26-col grid, narrower.
- **390px:** mobile grid-areas, content in the left/full column.
- **Breakpoint:** 768px.
