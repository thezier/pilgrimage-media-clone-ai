# Page Topology — pilgrimage.media (home)

All numbers measured with Playwright at real viewports (1920 / 1440 / 992 / 768 / 390).
Raw captures live in `_topology.json`, `_blocks*.json`, `_grid-areas.json`, `_typography.json`, `_detail.json`.

## Stack (top → bottom)

| # | Section | id | Theme | z-index | Background | Bottom divider |
|---|---------|----|-------|---------|-----------|----------------|
| — | Header | `#header` | — | 10 | transparent, **absolute** overlay | — |
| 0 | Hero | `682ce02dc0…3ab` | dark | **6** | `#393939` + `topographic2.png` (cover) | **down** ↘ |
| 1 | Portfolio | `portfolio` | bright | **5** | olive `#696D5E` + `portfolio-bg.jpg` (cover) | **up** ↗ |
| 2 | Mission | `682ce02dc0…3b4` | bright | **4** | olive `#696D5E` | **down** ↘ |
| 3 | Services | `services` | white | **3** | `#FFFFFF` + `services-bg.jpg` (cover, 50% 50%) | **up** ↗ |
| 4 | Latest Posts | `yui_…_104` | white | auto | `#FFFFFF` | **none** |
| 5 | Footer | `682ce02bc0…2a3` | white | auto | `#FFFFFF` | none |

## The diagonal divider mechanism (this is the part that is easy to get wrong)

Read directly off the live DOM — do not infer it from screenshots:

1. Every section contains an absolutely-positioned `.section-border` that carries
   the background colour and photo.
2. That element is `inset: -6vw 0 0` — it **bleeds 6vw upward** past its own
   section's top edge, into the previous section's space. Sections themselves are
   flush (`margin-top: 0` on every one).
3. Each `.section-border` is clipped at its **own bottom edge** by a 6vw diagonal,
   via `clip-path: url(#section-divider-<id>)` pointing at an SVG
   `<clipPath clipPathUnits="objectBoundingBox">`.
4. Sections carry **descending z-index (6, 5, 4, 3, auto)**, so an earlier section
   paints *over* the next one. The triangle removed by an earlier section's clip is
   what reveals the next section's bled-up background.

Miss step 4 and every seam renders flat — the later section in DOM order simply
paints over the notch.

**Divider depth is a flat `6vw`** at every viewport: 23.4px @390 · 46.08 @768 ·
59.52 @992 · 86.4 @1440 · 115.2 @1920. Section `padding-bottom` is the same 6vw.

Direction alternates and is encoded in the clip path's start point:
`M2,…` → bottom edge drops left→right (**down**); `M-1,…` → rises left→right (**up**).
Latest Posts has `clip-path: none` — it is the one seam with no diagonal.

## Layout engine

Squarespace **Fluid Engine**: a real CSS Grid, not flexbox. Every content block is
an `.fe-block` with an explicit `grid-area`, declared twice — a base (mobile) rule and
a `@media (min-width: 768px)` override. Extracted verbatim into `_grid-areas.json`.

- **≥768px:** 26 columns — `(4vw − 11px)` gutter, `repeat(24, 1fr)`, `(4vw − 11px)` gutter
- **<768px:** 10 columns — `(6vw − 11px)` gutter, `repeat(8, 1fr)`, `(6vw − 11px)` gutter
- **gap: 11px** at every viewport
- **row height:** `minmax(24px, auto)` below 768; `minmax(1.979vw, auto)` above
  (= 28.5px @1440, verified against four blocks' row spans)

Rows must be `minmax(_, auto)` so they grow when text wraps to more lines than the
reference viewport did. Fixed row heights collide at in-between widths.

## Interaction model

**The page is entirely static.** See `BEHAVIORS.md` — there is no scroll-driven
state, no tabs, no carousel, no smooth-scroll library on the home page.
