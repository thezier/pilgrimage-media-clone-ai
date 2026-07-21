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

const PB = process.env.PB_URL || "http://127.0.0.1:8090";
const ROOT = import.meta.dirname;
const OUT = path.join(ROOT, "dist", "portfolio");
const WIDTHS = [640, 1024, 1600]; // covers mobile → desktop 2x-ish
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
const projectTpl = await tpl("project.html");
const indexTpl = await tpl("index.html");
const cards = [];

for (const p of projects) {
  const coverImg = p.cover ? await responsive(p, p.cover, p.slug, [CARD_WIDTH, 1600]) : null;

  const figures = [];
  for (const g of p.gallery ?? []) {
    const img = await responsive(p, g, p.slug, WIDTHS);
    figures.push(`<figure>${picture(img, `${p.title} — photograph`, "(min-width: 768px) 50vw, 100vw")}</figure>`);
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

  cards.push(
    `<a class="card" href="/portfolio/${p.slug}/">
          ${coverImg ? picture(coverImg, p.title, "(min-width: 768px) 33vw, 100vw") : ""}
          <h3>${esc(p.title)}</h3>
          <p class="eyebrow">${esc(p.category)}</p>
        </a>`,
  );
}

await writeFile(
  path.join(OUT, "index.html"),
  fill(indexTpl, { cards: cards.join("\n        "), count: String(projects.length) }),
);
await writeFile(path.join(OUT, "portfolio.css"), await tpl("portfolio.css"));

console.log(`\n  wrote ${OUT}`);
