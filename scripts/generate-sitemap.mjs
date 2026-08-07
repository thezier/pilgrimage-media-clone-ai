// Generates site/sitemap.xml by walking the built site.
//
//   node scripts/generate-sitemap.mjs
//
// Run automatically by scripts/publish.sh after the CMS regenerates the
// portfolio pages, so newly published projects appear in the sitemap without
// anyone remembering to add them.
//
// Every page is discovered from the filesystem rather than listed here — a page
// that exists is a page that gets submitted. Pages carrying <meta name="robots"
// content="noindex"> (currently just 404.html) are skipped: telling a crawler
// to index something you have also told it not to index is a Search Console
// warning, not a clever trick.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const ORIGIN = "https://pilgrimage.media";

// Rough guidance for crawlers on what matters. The homepage and the three
// category pages are the entry points worth recrawling most often.
function priorityFor(urlPath) {
  if (urlPath === "/") return "1.0";
  if (/^\/(fitness-athletes|sports-events|health-adventure)\/$/.test(urlPath)) return "0.9";
  if (urlPath === "/contact/" || urlPath === "/about/") return "0.8";
  if (urlPath.startsWith("/portfolio/")) return "0.7";
  return "0.5";
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // Finder/iCloud leaves empty "name 2"/"name 3" duplicate directories
    // around; they contain nothing and must never reach the sitemap.
    if (entry.isDirectory()) {
      if (/ \d+$/.test(entry.name)) continue;
      yield* walk(full);
    } else if (entry.name === "index.html") {
      yield full;
    }
  }
}

// The commit that last touched the file, so lastmod means something. A file
// that git doesn't know about yet (newly generated, not committed) falls back
// to its mtime.
async function lastModified(file) {
  try {
    const { stdout } = await run("git", ["log", "-1", "--format=%cI", "--", file], { cwd: ROOT });
    const iso = stdout.trim();
    if (iso) return iso.slice(0, 10);
  } catch {
    /* not a git checkout, or git unavailable */
  }
  return (await stat(file)).mtime.toISOString().slice(0, 10);
}

const pages = [];
for await (const file of walk(SITE)) {
  const html = await readFile(file, "utf8");
  if (/<meta\s+name="robots"[^>]*noindex/i.test(html)) continue;

  const rel = path.relative(SITE, path.dirname(file));
  const urlPath = rel === "" ? "/" : `/${rel.split(path.sep).join("/")}/`;
  pages.push({ urlPath, lastmod: await lastModified(file) });
}

pages.sort((a, b) => a.urlPath.localeCompare(b.urlPath));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map(({ urlPath, lastmod }) =>
    [
      "  <url>",
      `    <loc>${ORIGIN}${urlPath}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <priority>${priorityFor(urlPath)}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");

await writeFile(path.join(SITE, "sitemap.xml"), xml);
console.log(`  sitemap.xml — ${pages.length} page(s)`);
