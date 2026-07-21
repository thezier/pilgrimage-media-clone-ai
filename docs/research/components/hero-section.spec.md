# HeroSection Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Screenshot:** `docs/design-references/home-1440-full.png` (top ~1068px)
- **Interaction model:** static. No parallax, no scroll effects, no animation.

## DOM Structure
```
<section class="section" style="z-index:6">        padding-top: var(--header-h); padding-bottom: 6vw
  <div class="section-border section-border--flush divider-down">   inset:0 (first section — no upward bleed)
     background-color: #393939
     <img topographic2.png>   absolute inset-0, object-fit: cover
  </div>
  <div class="section-content fe-grid">
     <h2>   4 hard-broken lines
     <img hero-1>  <img hero-2>  <img hero-3>
  </div>
</section>
```

## Computed Styles

### section
- z-index: **6** (highest — it paints over Portfolio, which is what reveals the seam)
- padding: `var(--header-h)` top, 0 sides, `6vw` bottom (134.5px / 86.4px @1440)
- height @1440: 1068px (content-driven — do not hard-code)

### .section-border
- `inset: 0` — the hero is first in the document so it has **nothing to bleed into**.
  Use `.section-border--flush`. Every *other* section uses the default `-6vw` inset.
- background-color: `rgb(57,57,57)` = `#393939`
- clip: **`.divider-down`** — bottom edge is high on the left, flush at the right.

### topographic background image
- `public/images/topographic2.png`, natural 1440×960, rendered 1440×1068
- object-fit: cover; absolutely fills `.section-border`; sits above the colour, below content

### h2 (hero heading)
- font-family: "Roboto Condensed"; font-weight: 600; text-transform: uppercase
- font-size: `var(--fs-h2)` → 47.104px @1440
- line-height: 1.114 (52.455px @1440); letter-spacing: 0.07em (3.29728px)
- color: rgb(255, 255, 255); text-align: start

### hero images — object-fit is `contain`, NOT `cover`
Each renders at essentially its natural intrinsic size. This matters: `cover` crops them and is wrong.

| file | natural | rendered @1440 | object-fit |
|---|---|---|---|
| `hero-1.jpg` | 434×578 | 434×579 | contain |
| `hero-2.jpg` | 514×344 | 514×344 | contain |
| `hero-3.jpg` | 282×423 | 282×423 | contain |

Give each `width:100%; height:100%; object-fit:contain;`.

## Fluid Engine grid-areas (verbatim from the live stylesheet)

| element | mobile (<768, 10-col) | desktop (>=768, 26-col) |
|---|---|---|
| h2 heading | `1 / 2 / 7 / 11` | `2 / 11 / 9 / 21` |
| hero-1 | `6 / 6 / 16 / 11` | `1 / 2 / 18 / 10` |
| hero-2 | `11 / 1 / 17 / 7` | `13 / 9 / 22 / 19` |
| hero-3 | `15 / 5 / 23 / 8` | `9 / 16 / 20 / 24` |

Apply via a plain `<style jsx>`-free approach: put the areas in inline `style` objects
or Tailwind arbitrary variants. The grid itself is the shared `.fe-grid` class.
Note hero-2's mobile area starts at **column 1** — it deliberately bleeds into the gutter.

## States & Behaviors
**N/A.** Static section. No hover, no scroll, no entrance animation to reproduce.

## Text Content (verbatim)
Four hard line breaks — the live site breaks exactly here:
```
Media for those on
a journey to make
themselves and
others better.
```
Import as `HERO_HEADING` from `@/lib/content` and join with `<br />`.
Rendered uppercase by CSS.

## Responsive Behavior
- **Desktop (1440px):** tall image left, heading upper-right, two images lower-centre/right.
- **Tablet (768px):** same composition, scaled down (still the 26-col grid).
- **Mobile (390px):** mobile grid-areas — heading on top, images scattered below.
- **Breakpoint:** 768px (grid column count changes).
