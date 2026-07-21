// Seeds two sample projects using the real photos already downloaded from the
// live site, so the build script has honest content to render.
//   node seed.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";

const PB = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_EMAIL || "mike@thezier.com";
const PASSWORD = process.env.PB_PASSWORD || "prototype-password-change-me";
const IMAGES = path.resolve(import.meta.dirname, "../../public/images");

const auth = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
}).then((r) => r.json());

const file = async (rel) => {
  const buf = await readFile(path.join(IMAGES, rel));
  return new File([buf], path.basename(rel), { type: "image/jpeg" });
};

const PROJECTS = [
  {
    title: "Kalia — Strength Sessions",
    slug: "kalia-strength-sessions",
    summary: "A morning of lifting, breath and quiet effort.",
    body: "<p>Shot over a single session at first light. The brief was to show the work rather than the result — the setup, the reset between sets, the moment before the lift.</p><p>Natural light throughout, no strobes.</p>",
    category: "Athletes & Fitness",
    shot_on: "2025-03-14 09:00:00Z",
    published: true,
    sort_order: 1,
    cover: "hero-1.jpg",
    gallery: ["hero-1.jpg", "portfolio-bg.jpg", "posts/post-1.jpg", "posts/post-3.jpg"],
  },
  {
    title: "Trail Series — Season Opener",
    slug: "trail-series-season-opener",
    summary: "Race-day coverage from the first event of the season.",
    body: "<p>Event coverage across the course, from the start pen to the last runner in. Delivered same-week for the organiser's social channels.</p>",
    category: "Sports & Events",
    shot_on: "2025-04-20 07:30:00Z",
    published: true,
    sort_order: 2,
    cover: "hero-2.jpg",
    gallery: ["hero-2.jpg", "hero-3.jpg", "posts/post-5.jpg", "posts/post-7.jpg", "posts/post-8.jpg"],
  },
  {
    // Deliberately unpublished — proves the build script skips drafts.
    title: "Untitled Draft",
    slug: "untitled-draft",
    summary: "Should never appear on the site.",
    body: "<p>Draft.</p>",
    category: "Health & Adventure",
    published: false,
    sort_order: 3,
    cover: "services-bg.jpg",
    gallery: [],
  },
];

for (const p of PROJECTS) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(p)) {
    if (k === "cover" || k === "gallery") continue;
    fd.append(k, typeof v === "boolean" ? String(v) : v);
  }
  fd.append("cover", await file(p.cover));
  for (const g of p.gallery) fd.append("gallery", await file(g));

  const res = await fetch(`${PB}/api/collections/projects/records`, {
    method: "POST",
    headers: { Authorization: auth.token },
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`  FAILED ${p.slug}:`, JSON.stringify(json).slice(0, 300));
  } else {
    console.log(`  ${p.published ? "published" : "draft    "}  ${json.slug}  (${p.gallery.length} images)`);
  }
}
