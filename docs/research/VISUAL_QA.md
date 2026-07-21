# Visual QA — clone vs. live

Method: Playwright drives both sites at matched viewports and diffs measured
geometry, so discrepancies surface as numbers rather than impressions. Screenshot
eyeballing alone is not reliable for this site — it silently misses inverted
diagonals, wrong grid row counts, and missing copy.

Scripts live in the session scratchpad: `sections.mjs` (per-section top/height
diff), `blocks.mjs` (per-element diff), `seams.mjs` + a Theil–Sen slope estimator
(divider direction), `interact.mjs` (behaviour).

## Final geometry — section top / height, clone vs. live

| Section | 1440 Δtop / Δh | 390 Δtop / Δh |
|---|---|---|
| Hero | 0 / 0 | 0 / 0 |
| Portfolio | 0 / 0 | 0 / 0 |
| Mission | +1 / 0 | 0 / 0 |
| Services | +1 / 0 | 0 / 0 |
| Latest Posts | 0 / 0 | 0 / +1 |
| Footer | +1 / **−8** | +1 / 0 |

Total document height: 4851 → 4851 @1440, 5618 → 5619 @390.

Typography matches to sub-pixel at every level and viewport (e.g. h1 @1440
`67.84px` live vs `67.7952px` clone; letter-spacing `4.7488` vs `4.74566`).

## Diagonal seam directions — verified numerically

Slope measured by sampling luminance transitions down many x-columns of a cropped
seam band and taking the median pairwise slope (outlier-resistant; plain
least-squares gets fooled by photo texture and can return the wrong sign).

| Seam | Live | Clone |
|---|---|---|
| Hero → Portfolio | down ↘ | down ↘ |
| Portfolio → Mission | up ↗ (−0.0590) | up ↗ (−0.0595) |
| Mission → Services | down ↘ (0.0593) | down ↘ (0.0600) |
| Services → Latest Posts | up ↗ (−0.0593) | up ↗ (−0.0596) |

Slope magnitude 0.06 = 86.4/1440, i.e. the 6vw divider depth. All four match.

## Behaviour checks

- Burger appears < 800px, hidden ≥ 800px; nav is the inverse.
- Burger sits 23.4px (6vw) from the right edge.
- Menu opens with 4 links, locks body scroll, closes on Escape and restores scroll.
- Outline button hover: `rgba(0,0,0,0)` → `rgb(255,255,255)`.
- `#portfolio` and `#services` anchor targets exist.
- 5 of 8 gallery thumbnails are linked (matching the live site), 3 unlinked.

## Errors this pass caught (that screenshots did not)

1. **Grid row counts are declared, not derived.** Squarespace sets
   `grid-template-rows: repeat(N, …)` per section with *trailing empty rows*.
   Deriving N from the last block used made every section short — the page was
   384px short at 1440 before this was fixed.
2. **An entire third Services paragraph was missing** ("Content for Web & Social
   Media — …"), and paragraph 2's copy was wrong. Both came from reading a
   truncated `innerText` during extraction rather than per-`<p>` `textContent`.
3. **Buttons size from their grid area, not a fixed height.** The same button is
   212×68 in Portfolio and 323×68 in Latest Posts at 1440, and 59px tall at 390.
   A hard-coded `height: 68px` plus a `justify-self-center` had shrunk the
   "More posts" button to 165px wide.
4. **The gallery has zero gap**, not the ~19px implied by dividing the container
   width by the image width. Measured slide pitch equals slide width exactly.
5. **Latest Posts and the footer have no bottom padding** (`padding: 0px`),
   unlike the four sections above them which carry 6vw.
6. **`.content-wrapper` adds a vertical inset** (1vw ≥768, 9px below) on
   hero/mission/posts/footer — but *not* on portfolio/services.
7. The Services third paragraph's margin is `16px 0 0` — no bottom margin.

## Known remaining gaps

- **Footer is 8px short at 1440** (373 vs 381). One grid row in the newsletter
  block grows on the live site; the cause was not isolated. Invisible in practice
  (2% of footer height) and correct at 390.
- **Portfolio parallax not reproduced.** The live site scroll-pins the portfolio
  photo while text scrolls past. Deliberately out of scope per the clone brief;
  built as a static full-bleed photo.
- **Gallery thumbnail ratios simplified.** Squarespace preserves each image's
  natural aspect ratio and centres it, so a few live thumbnails render 9:16 and
  overflow their cell. We render the uniform grid the gallery's own
  `sqs-gallery-aspect-ratio-three-four-vertical` class declares. Desktop is a
  clean 3:4; the mobile cell ratio (0.7282) is set from measurement.
- **Squarespace `.preFade` load-in stagger not reproduced** — a load-time
  flourish, not a scroll behaviour.
- Only the home page is built. `/about`, `/contact` and the three gallery routes
  are linked but not implemented.
