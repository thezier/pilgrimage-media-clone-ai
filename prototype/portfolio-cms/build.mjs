// Reads published projects out of PocketBase and writes plain static HTML.
//
//   node build.mjs
//
// Nothing dynamic ships. PocketBase is only ever the place you type and upload;
// visitors get files. That keeps the public site fast, indexable, and hostable
// anywhere — including somewhere that isn't a Pi on a coffee shop's uplink.
//
// Images are resized to responsive WebP here, at build time, so the origin
// never does image work per-request.
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// The Pi over the tailnet is the real instance. Override with PB_URL for a
// local copy. It is bound to the tailnet address only, so this requires
// Tailscale to be up — which is the point: the CMS has no public surface.
const PB = process.env.PB_URL || "http://100.123.155.98:8090";
const ROOT = import.meta.dirname;
// Writes straight into the hand-written static site, so there is one site
// rather than two. The generated pages ARE committed: Cloudflare Pages builds
// from git and can't reach PocketBase, so whatever is in the repo is what
// publishes. That also gives published content a version history.
const OUT = path.resolve(ROOT, "../../site/portfolio");
// A full-width gallery row is ~1325px at a 1440 viewport, so 2400 covers it on
// a retina screen. Variants wider than the source are skipped, so small uploads
// simply produce fewer of these rather than being blown up.
const WIDTHS = [640, 1024, 1600, 2400];
const CARD_WIDTH = 800;

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const tpl = async (name) => readFile(path.join(ROOT, "templates", name), "utf8");
const fill = (t, vars) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ""));

// --- fetch ------------------------------------------------------------------
// No auth token: the collection's list rule is `published = true`, so drafts are
// invisible to this request by construction rather than by us remembering to
// filter. One less way to leak an unfinished project.
const res = await fetch(`${PB}/api/collections/projects/records?perPage=200&sort=sort_order,-shot_on`);
if (!res.ok) throw new Error(`PocketBase unreachable at ${PB} (${res.status}) — is it running?`);
const { items: projects } = await res.json();
console.log(`  ${projects.length} published project(s)`);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// --- images -----------------------------------------------------------------
async function responsive(record, filename, slug, widths) {
  const src = `${PB}/api/files/${record.collectionId}/${record.id}/${filename}`;
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  const base = path.parse(filename).name;
  const dir = path.join(OUT, slug, "img");
  await mkdir(dir, { recursive: true });

  const meta = await sharp(buf).metadata();
  const made = [];
  for (const w of widths) {
    if (w > meta.width) continue; // never upscale
    const out = `${base}-${w}.webp`;
    await sharp(buf).resize({ width: w }).webp({ quality: 82 }).toFile(path.join(dir, out));
    made.push({ w, url: `/portfolio/${slug}/img/${out}` });
  }
  if (!made.length) {
    const out = `${base}-${meta.width}.webp`;
    await sharp(buf).webp({ quality: 82 }).toFile(path.join(dir, out));
    made.push({ w: meta.width, url: `/portfolio/${slug}/img/${out}` });
  }
  return { sizes: made, width: meta.width, height: meta.height };
}

const picture = ({ sizes, width, height }, alt, sizesAttr) => {
  const largest = sizes[sizes.length - 1];
  const srcset = sizes.map((s) => `${s.url} ${s.w}w`).join(", ");
  // width/height are the intrinsic dims so the browser reserves space and the
  // page doesn't jump as images load.
  return `<img src="${largest.url}" srcset="${srcset}" sizes="${sizesAttr}"
        width="${width}" height="${height}" alt="${esc(alt)}" loading="lazy" decoding="async" />`;
};

// --- render -----------------------------------------------------------------
// The three homepage/footer links (Athletes & Fitness, Sports & Events,
// Health & Adventure) point at these root-level URLs. They used to 404 —
// nothing ever generated them. Mapped here rather than derived from the
// category string so a typo'd or renamed category in PocketBase can't
// silently break a live URL.
const CATEGORY_SLUGS = {
  "Athletes & Fitness": "fitness-athletes",
  "Sports & Events": "sports-events",
  "Health & Adventure": "health-adventure",
};
const SITE = path.resolve(ROOT, "../../site");

const projectTpl = await tpl("project.html");
const indexTpl = await tpl("index.html");
const categoryTpl = await tpl("category.html");
const cards = [];
const cardsByCategory = {};

for (const p of projects) {
  const coverImg = p.cover ? await responsive(p, p.cover, p.slug, [CARD_WIDTH, 1600]) : null;

  const figures = [];
  for (const [i, g] of (p.gallery ?? []).entries()) {
    const img = await responsive(p, g, p.slug, WIDTHS);
    // Every third figure spans the full row (see .project-gallery in the CSS),
    // so it needs a different `sizes` hint. Declaring 50vw for all of them made
    // the browser under-select on exactly the images that need most resolution.
    const isFullWidth = i % 3 === 0;
    const sizesAttr = isFullWidth ? "(min-width: 768px) 92vw, 100vw" : "(min-width: 768px) 46vw, 100vw";
    // Cap the figure at the photo's own width so a modest upload is never
    // stretched past 1:1 — a 720px source in a 1325px row would otherwise be
    // upscaled ~2x and render visibly soft. With real camera files this never
    // binds; it only protects against small ones.
    figures.push(
      `<figure style="max-width:${img.width}px">${picture(img, `${p.title} — photograph`, sizesAttr)}</figure>`,
    );
  }

  const shotOn = p.shot_on
    ? new Date(p.shot_on).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    dateCreated: p.shot_on || undefined,
    genre: p.category || undefined,
    url: `https://pilgrimage.media/portfolio/${p.slug}/`,
    image: coverImg ? `https://pilgrimage.media${coverImg.sizes.at(-1).url}` : undefined,
    creator: { "@type": "Organization", name: "Pilgrimage Media" },
  });

  const html = fill(projectTpl, {
    title: esc(p.title),
    slug: p.slug,
    summary: esc(p.summary),
    category: esc(p.category),
    shotOn: shotOn ? `Shot ${shotOn}` : "",
    body: p.body || "", // rich text from the editor field, intentionally raw
    gallery: figures.join("\n        "),
    ogImage: coverImg ? `https://pilgrimage.media${coverImg.sizes.at(-1).url}` : "",
    jsonld,
  });

  await mkdir(path.join(OUT, p.slug), { recursive: true });
  await writeFile(path.join(OUT, p.slug, "index.html"), html);
  console.log(`  /portfolio/${p.slug}/  — ${figures.length} images`);

  const card = `<a class="project-card" href="/portfolio/${p.slug}/">
          ${coverImg ? picture(coverImg, p.title, "(min-width: 768px) 33vw, 100vw") : ""}
          <h3>${esc(p.title)}</h3>
          <p class="project-eyebrow">${esc(p.category)}</p>
        </a>`;
  cards.push(card);

  // Category pages already say the category in their own heading, so their
  // cards show each project's own one-line summary underneath instead —
  // more useful than repeating the category on every card.
  const categoryCard = `<a class="project-card" href="/portfolio/${p.slug}/">
          ${coverImg ? picture(coverImg, p.title, "(min-width: 768px) 33vw, 100vw") : ""}
          <h3>${esc(p.title)}</h3>
          <p class="project-eyebrow">${esc(p.summary)}</p>
        </a>`;
  (cardsByCategory[p.category] ??= []).push(categoryCard);
}

await writeFile(
  path.join(OUT, "index.html"),
  fill(indexTpl, { cards: cards.join("\n        "), count: String(projects.length) }),
);
// Lives with the rest of the site's stylesheets, not inside /portfolio/,
// because the project pages share /css/style.css for tokens and chrome.
await writeFile(path.resolve(OUT, "../css/portfolio.css"), await tpl("portfolio.css"));

// --- category pages -----------------------------------------------------
// Root-level, not under /portfolio/ — that's the URL the homepage and
// footer links already use (/fitness-athletes/, etc.), so this is the only
// change needed to make those links resolve.
for (const [category, slug] of Object.entries(CATEGORY_SLUGS)) {
  const catCards = cardsByCategory[category] ?? [];
  const dir = path.join(SITE, slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "index.html"),
    fill(categoryTpl, {
      heading: esc(category),
      // Wraps just the "&" in a span so it can be colored separately from
      // the rest of the title (see .category-hero__title .amp in style.css).
      headingHtml: esc(category).replace(/&amp;/g, '<span class="amp">&amp;</span>'),
      description: `${category} — selected work from Pilgrimage Media.`,
      path: `/${slug}/`,
      count: String(catCards.length),
      cards: catCards.join("\n        "),
    }),
  );
  console.log(`  /${slug}/  — ${catCards.length} project(s)`);
}

console.log(`\n  wrote ${OUT}`);
