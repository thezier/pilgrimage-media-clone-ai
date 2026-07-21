# SiteHeader Specification

## Overview
- **Target file:** `src/components/SiteHeader.tsx`
- **Screenshot:** `docs/design-references/home-1440-full.png` (top strip)
- **Interaction model:** static — plus a burger-toggled overlay menu below 800px.
  It is **NOT sticky and NOT fixed**; computed styles at scrollY 0 and 800 are byte-identical.

## DOM Structure
```
<header>                          position:absolute; top:0; left:0; right:0; z-index:10
  <div class="header-inner">      padding: 1.4vw 4vw  (>=800px) | 6vw (<800px)
    <a class="wordmark">          "Pilgrimage Media", centered, block
    <nav>                         centered row of 4 links   (>=800px only)
    <button class="burger">       (<800px only)
  </div>
  <div class="mobile-menu">       full-screen overlay, only when open
</header>
```

## Computed Styles (exact, from getComputedStyle at 1440)

### header
- position: absolute; top: 0px; left: 0; right: 0; width: 100%
- z-index: 10
- background-color: rgba(0, 0, 0, 0)  ← transparent, it floats over the hero
- color: rgb(255, 255, 255)
- height: 134.5px (content-driven — do NOT hard-code)

### header inner wrapper
- padding: 20.16px 57.6px @1440  →  express as `1.4vw 4vw`
- at <800px: padding is `6vw` on all four sides (46.08px @768, 23.4px @390)

### wordmark (`Pilgrimage Media`)
- font-family: "Roboto Condensed"; font-weight: 600
- font-size: `var(--fs-wordmark)` → 24.64px @1440, 20.6px @768, 21.4px @390
- line-height: 1.2  (29.568px @1440)
- letter-spacing: 0.07em  (1.7248px @1440)
- text-transform: uppercase
- color: rgb(255, 255, 255)
- text-align: center; display: block; width: 100%

### nav list (>=800px)
- display: inline-flex; justify-content: center
- width: 355.53px @1440 (content-driven)
- sits on its own row **below** the wordmark

### nav item
- margin: 0 10.8px  (→ 21.6px between adjacent items)
- white-space: nowrap
- font-family: "IBM Plex Mono"; font-size: 16px; font-weight: 600
- line-height: 24px; letter-spacing: -0.02em (-0.32px)
- color: rgb(255, 255, 255); text-align: center
- padding: 1.6px 0

### burger (<800px)
- display: flex (none at >=800px); color: rgb(255,255,255)
- positioned at the right edge of the inner wrapper

## States & Behaviors

### Scroll
**N/A — verified.** No change whatsoever between scrollY 0 and 800.
Do not add a sticky/shrink/background-on-scroll behaviour.

### Hover
Nav links declare **no** transition and no hover style on the live site.
Do not invent one.

### Mobile menu (<800px)
- **Trigger:** click the burger.
- **State A:** overlay hidden.
- **State B:** full-screen overlay, background `#393939`, the 4 nav links stacked,
  close (X) control in place of the burger.
- Lock body scroll while open. Close on link click and on `Escape`.

## Assets
- Icons: `BurgerIcon`, `CloseIcon` from `src/components/icons.tsx`.
- No images.

## Text Content (verbatim)
- Wordmark: `Pilgrimage Media` (rendered uppercase via CSS, not in the string)
- Nav: `Portfolio` → `/#portfolio` · `Services` → `/#services` · `About` → `/about` · `Contact` → `/contact`
- Import these from `@/lib/content` (`WORDMARK`, `NAV_LINKS`) — do not re-type them.

## Responsive Behavior
- **>=800px:** wordmark row + centered nav row; padding `1.4vw 4vw`.
- **<800px:** wordmark + burger on one row, nav hidden; padding `6vw`.
- **Breakpoint:** 800px (verified: nav visible at 900px, burger at 768px).
