# LatestPostsSection Specification

## Overview
- **Target file:** `src/components/LatestPostsSection.tsx`
- **Interaction model:** static grid of 8 linked thumbnails.
- **This is the one section with NO diagonal divider** — `clip-path: none`, verified.

## DOM Structure
```
<section class="section section--no-pad">   NO z-index; NO bottom padding
  <div class="section-border">       inset: -6vw 0 0; background: #FFFFFF; NO clip class
  </div>
  <div class="section-content fe-grid">
    <h2>Latest Posts</h2>
    <div class="gallery"> 8 × <a><img></a> </div>
    <a class="btn btn-solid">More posts</a>
  </div>
</section>
```

## Computed Styles

### section
- z-index: **auto** (it is last in the divider chain; the sections above paint over it)
- **`padding-bottom: 0`** — measured `padding: 0px`. Unlike the four sections
  above it, this one has no 6vw bottom padding. Use `.section--no-pad`.
- `--fe-rows`: **18** below 768px, **17** at/above.
- height @1440: 1000px
- Text colour: `rgb(0, 0, 0)`

### .section-border
- `inset: -6vw 0 0` — it still bleeds upward (this is what reveals Services' notch)
- background-color: `rgb(255,255,255)` — **white**
- **`clip-path: none`.** Apply neither `.divider-up` nor `.divider-down`.
  Keeping the upward bleed while dropping the clip is the whole trick here: the bleed
  exists to reveal *Services'* bottom notch, not to cut this section.

### h2 "LATEST POSTS"
- "Roboto Condensed" 600 uppercase; `var(--fs-h2)` (47.104px @1440)
- line-height 1.114 (52.455px); letter-spacing 0.07em (3.29728px)
- color: `rgb(0,0,0)`; text-align: start
- Left-aligned on the same gutter as the grid below it.

### gallery
- Container @1440: **1102px wide, x = 169** (i.e. contained by the page gutter,
  NOT full-bleed edge-to-edge). The width comes from its grid-area, so do not
  hard-code it.
- **4 columns** at >=768px, **2 columns** below 768px
- column width 261px @1440; **gap ≈ 19.33px** (`1102 = 4×261 + 3×19.33`)
- Thumbnails are **3:4 portrait** (`aspect-ratio: 3/4`), matching the live gallery's
  own `sqs-gallery-aspect-ratio-three-four-vertical` class. Use `object-fit: cover`.
- 8 images, `public/images/posts/post-1.jpg` … `post-8.jpg`, in that order.
- 5 of the 8 link to individual Instagram posts; 3 are unlinked. Import
  `GALLERY_POSTS` from `@/lib/content` and render an `<a>` only when `href` is set.
- **No hover effect.** The live thumbnails declare no transition; an earlier clone
  added a `scale(1.05)` zoom that does not exist.

> Note: on the live site a few thumbnails render at 9:16 rather than 3:4 and
> overflow their cell, because Squarespace preserves each image's natural ratio and
> centres it. That reads as a loading artifact rather than intent, so we render the
> uniform 3:4 grid the gallery's own class name declares. Flagged as a known,
> deliberate simplification.

### button "More posts" → `https://instagram.com/pilgrimagemedia`
- `.btn .btn-solid`: background `rgb(105,109,94)`; color `#fff`; height 68px;
  padding 0 34.736px; **text-transform: none** (mixed case — the shared uppercase
  button style is wrong here); letter-spacing: normal
- transition `opacity .1s linear`; rendered 323×68 @1440
- Centred under the grid.

## Fluid Engine grid-areas (verbatim)

| element | mobile (<768) | desktop (>=768) |
|---|---|---|
| h2 "Latest Posts" | `3 / 2 / 5 / 10` | `3 / 4 / 5 / 24` |
| gallery | `5 / 2 / 17 / 10` | `5 / 4 / 16 / 24` |
| "More posts" button | `17 / 4 / 19 / 8` | `16 / 11 / 18 / 17` |

Desktop columns 4–24 are what produce the 1102px container inside a 1440px viewport
(a ~169px gutter each side).

## States & Behaviors
- **Hover:** button only, `opacity .1s linear`. Thumbnails have none.
- No scroll behaviour, no lightbox, no carousel.

## Assets
- `public/images/posts/post-1.jpg` … `post-8.jpg`

## Text Content (verbatim)
- Heading: `Latest Posts` (uppercased by CSS)
- Button: `More posts` (mixed case — do NOT uppercase)

## Responsive Behavior
- **1440px:** 4 columns, 1102px container.
- **768px:** 4 columns, 587px container.
- **390px:** **2 columns**, 343px container.
- **Breakpoint:** 768px for both the column count and the grid-area switch.
