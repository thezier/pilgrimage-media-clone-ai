# MissionSection Specification

## Overview
- **Target file:** `src/components/MissionSection.tsx`
- **Interaction model:** static.
- The simplest section on the page: a flat olive block with one centred text group.

## DOM Structure
```
<section class="section" style="z-index:4">     padding-bottom: 6vw
  <div class="section-border divider-down">     inset: -6vw 0 0; background: #696D5E
  </div>
  <div class="section-content fe-grid">
    <div>                                       one block, both lines inside it
      <p><em>Athleticism is for everyone</em></p>
      <h2>A healthier world starts with living vibrantly and leading by example.</h2>
    </div>
  </div>
</section>
```

## Computed Styles

### section
- z-index: **4**
- padding-bottom: 6vw; height @1440: 467px
- **No images at all** in this section.

### .section-border
- `inset: -6vw 0 0` (bleeds upward into Portfolio)
- background-color: `rgb(105,109,94)` = `#696D5E`
- clip: **`.divider-down`** — high on the left, flush at the right
- There is **no gradient and no scrim** here — background is a flat colour.

### eyebrow "ATHLETICISM IS FOR EVERYONE"
This is **Roboto Condensed italic**, not the mono italic used elsewhere:
- font-family: "Roboto Condensed"; font-weight: 600; font-style: **italic**
- font-size: `var(--fs-em)` → 26.368px @1440
- line-height: 1.171 (30.8822px); letter-spacing: 0.07em (1.84576px)
- text-transform: uppercase; text-align: **center**
- color: rgb(255, 255, 255)

### h2
- font-family: "Roboto Condensed"; font-weight: 600; text-transform: uppercase
- font-size: `var(--fs-h2)` → 47.104px @1440
- line-height: 1.114 (52.455px); letter-spacing: 0.07em (3.29728px)
- text-align: **center**; color: rgb(255, 255, 255)
- **margin: 32px 0 0** (the gap below the eyebrow)

## Fluid Engine grid-area (verbatim)

| element | mobile (<768) | desktop (>=768) |
|---|---|---|
| text block | `2 / 2 / 11 / 10` | `2 / 9 / 7 / 19` |

Desktop columns 9→19 = a narrow centred column, which is what forces the heading to
wrap across roughly 4 lines. Do **not** constrain the width with a `ch` value — an
earlier clone set `max-width: 44ch` on a wrapper whose font was the 16px mono, so
`ch` resolved far too small and the heading wrapped one word per line. The grid-area
is the only width constraint needed.

## States & Behaviors
**N/A.** No hover, no scroll, no interaction of any kind.

## Assets
None.

## Text Content (verbatim)
- Eyebrow: `Athleticism is for everyone`
- Heading: `A healthier world starts with living vibrantly and leading by example.`

Both rendered uppercase by CSS — keep the strings in sentence case.

## Responsive Behavior
- **1440px:** narrow centred column (grid cols 9–19).
- **768px:** same grid-area, proportionally narrower.
- **390px:** mobile area spans the full content width (cols 2–10).
- **Breakpoint:** 768px.
