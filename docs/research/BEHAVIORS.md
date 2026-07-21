# Behaviours — pilgrimage.media (home)

## Interaction model: STATIC

This was checked before anything was built, by scrolling first and clicking second.

### Scroll sweep — no scroll-driven behaviour

`#header` computed styles were captured at `scrollY = 0` and again at `scrollY = 800`
and diffed property by property. **Every property is identical:**

```
position: absolute      top: 0px            backgroundColor: rgba(0,0,0,0)
boxShadow: none         height: 134.5px     transform: none
opacity: 1              zIndex: 10          color: rgb(255,255,255)
```

The header is `position: absolute` — it is **not sticky and not fixed**. It scrolls
away with the hero, and sits transparently over the hero's own background so the two
read as one continuous surface.

It does carry an inherited transition
(`background .3s ease-in-out, padding .14s ease-in-out, transform .14s ease-in-out .14s`)
but nothing on the home page ever triggers it.

Also absent: `scroll-snap` on any container, parallax layers, `animation-timeline`,
and any smooth-scroll library (no `.lenis`, no Locomotive). `scroll-behavior` is the
site's own `smooth` on `html`, used only for the `/#portfolio` and `/#services`
anchor jumps in the nav.

### Entrance animations

Squarespace attaches `.preFade` with `transition-duration: 0.9s` and a staggered
`transition-delay` to text blocks. These fire once on load. Reproducing the stagger
is not attempted — it is a load-time flourish, not a scroll behaviour.

### Click sweep

No tabs, pills, accordions, modals, dropdowns or carousels exist on the home page.
Every clickable element is a plain navigation link:

| Element | Target |
|---|---|
| Nav: Portfolio / Services | `/#portfolio`, `/#services` (anchor jump) |
| Nav: About / Contact | `/about`, `/contact` |
| ATHLETES & FITNESS | `/fitness-athletes` |
| SPORTS & EVENTS | `/sports-events` |
| HEALTH & ADVENTURE | `/health-adventure` |
| LET'S CONNECT / Let's Connect | `/contact` |
| More posts | `https://instagram.com/pilgrimagemedia` |
| 5 of 8 gallery thumbnails | individual `instagram.com/p/…` posts |

Below 800px the burger toggles a full-screen overlay menu — the only stateful UI
on the page.

### Hover sweep

Only two transitions are declared, both on buttons:

- **Outline button** (`LET'S CONNECT`): `background-color .1s linear, color .1s linear`
  — inverts to white background / black text.
- **Solid olive buttons** (`Let's Connect`, `Sign up`, `More posts`):
  `opacity .1s linear`.

Nav links, category headings and gallery thumbnails declare **no hover transition**.
(An earlier hand-built clone added a `scale(1.05)` zoom on gallery thumbnails and
hover colour changes on nav links — neither exists on the live site.)

### Responsive sweep

| Breakpoint | What changes |
|---|---|
| **800px** | Nav collapses to burger; header padding switches from `1.4vw 4vw` to `6vw` all round |
| **768px** | Fluid Engine grid switches 26 cols → 10 cols; every block takes its mobile `grid-area`; type scale switches from fluid to the fixed mobile scale; gallery goes 4 columns → 2 |

Type scale is fluid only at ≥768px. Below that it is **fixed** — and notably
*larger* than at 768px (h1 is 48.4px on mobile vs 43.6px at 768px).
