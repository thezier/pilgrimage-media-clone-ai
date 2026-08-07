// Instagram "Latest Posts" — Graph API fetch, with the IMAGES cached by us.
//
// GET  /api/latest-posts   — serves the cached post list (fast; never calls the
//                             Graph API on a visitor's request).
// GET  /api/ig/<id>        — serves a cached image out of KV.
// POST /api/refresh-posts  — manually re-runs the fetch, protected by
//                             REFRESH_SECRET.
// The scheduled() handler in contact.js calls refreshInstagramCache() on the
// cron in wrangler.jsonc (`triggers.crons`).
//
// WHY WE STORE THE BYTES, NOT THE URL
// -----------------------------------
// Instagram's `media_url` is a SIGNED CDN link that expires after days. Storing
// it means the cache can be perfectly valid JSON pointing at eight dead images
// — which is exactly what happened: Meta blocked the developer account on
// 2026-07-25, the refresh stopped succeeding, the URLs went 403, and the
// homepage's Latest Posts section went blank.
//
// The fix leans on one detail: a post's `id` is STABLE even though its URL
// rotates. So the id is the storage key. Each run we diff the returned ids
// against what we already hold and download only genuinely new posts, while
// their signed URL is still fresh. Everything else is already ours.
//
// The consequence worth understanding: an API outage no longer breaks anything
// visible. It means the feed stops UPDATING — the last known-good posts keep
// serving indefinitely and look completely normal. That is why there is no
// staleness guard here any more; it existed only because expiring URLs made
// stale data dangerous, and it isn't once we hold the bytes.
//
// Secrets (via `wrangler secret put`, not committed):
//   INSTAGRAM_ACCESS_TOKEN  — "IGAA…" token from the app's "API setup with
//                             Instagram login" flow. Only valid against
//                             graph.instagram.com, NOT graph.facebook.com.
//   INSTAGRAM_ACCOUNT_ID    — the Instagram-scoped account ID
//   REFRESH_SECRET          — shared secret for POST /api/refresh-posts
//
// KV binding: INSTAGRAM_CACHE — holds both the post list and the image bytes,
// separated by key prefix. (R2 is the more idiomatic store for binary, but it
// needs a one-time account activation and eight small images sit far inside
// KV's limits. Swapping later is contained to readImage/writeImage/pruneImages.)

const GRAPH_API = "https://graph.instagram.com/v21.0";
const CACHE_KEY = "latest-posts";
const IMG_PREFIX = "img:";
const POST_LIMIT = 8;
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

// KV caps a single value at 25 MiB. Instagram serves ~1080px JPEGs (a few
// hundred KB), so this only ever trips on something unexpected.
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const imgKey = (id) => `${IMG_PREFIX}${id}`;

export async function handleLatestPosts(env) {
  const cached = await env.INSTAGRAM_CACHE.get(CACHE_KEY, "json");
  if (!cached) return json({ ok: false, error: "Not cached yet" }, 503);
  return json({ ok: true, posts: cached.posts, updated: cached.updated });
}

// GET /api/ig/<id> — the images the homepage actually points at.
export async function handleInstagramImage(request, env, id) {
  if (!/^[0-9_]+$/.test(id)) return new Response("Not found", { status: 404 });

  const obj = await env.INSTAGRAM_CACHE.getWithMetadata(imgKey(id), "arrayBuffer");
  if (!obj || !obj.value) return new Response("Not found", { status: 404 });

  return new Response(obj.value, {
    headers: {
      "content-type": (obj.metadata && obj.metadata.contentType) || "image/jpeg",
      // Immutable is safe here precisely BECAUSE the key is the post id: a
      // given id's bytes never change. Cloudflare's edge cache then absorbs
      // essentially all of this traffic and KV is barely touched.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export async function handleRefreshPosts(request, env) {
  const url = new URL(request.url);
  const provided = request.headers.get("x-refresh-secret") || url.searchParams.get("secret");
  if (!env.REFRESH_SECRET || provided !== env.REFRESH_SECRET) {
    return json({ ok: false, error: "Not authorized" }, 401);
  }
  // ?force=1 re-downloads every image even if we already hold it. Normally the
  // dedupe is the point, but it means a change to how images are stored (a new
  // size, say) would only reach posts published after the change. This is the
  // escape hatch for that.
  const force = url.searchParams.get("force") === "1";
  const result = await refreshInstagramCache(env, { force });
  return json(result, result.ok ? 200 : 502);
}

// Downloads one image into KV. Returns true only if the bytes are actually
// stored — callers rely on that to guarantee the post list never references an
// image that isn't there.
async function writeImage(env, id, sourceUrl) {
  try {
    // Instagram serves ~1080px originals — up to 1MB each, and eight of those
    // is ~5MB for a grid that renders them about 280px wide. Ask Cloudflare to
    // resize on the way in. If the zone doesn't have Image Resizing the `cf`
    // options are simply ignored and the original comes back, which still
    // works — so this is an optimisation, never a dependency.
    let res = await fetch(sourceUrl, {
      cf: { image: { width: 800, quality: 80, format: "jpeg", fit: "scale-down" } },
    });
    if (!res.ok) res = await fetch(sourceUrl); // resizing refused it; take the original
    if (!res.ok) {
      console.error(`Instagram image ${id}: HTTP ${res.status}`);
      return false;
    }
    const buf = await res.arrayBuffer();
    if (!buf.byteLength || buf.byteLength > MAX_IMAGE_BYTES) {
      console.error(`Instagram image ${id}: unusable size ${buf.byteLength}`);
      return false;
    }
    await env.INSTAGRAM_CACHE.put(imgKey(id), buf, {
      metadata: { contentType: res.headers.get("content-type") || "image/jpeg" },
    });
    return true;
  } catch (err) {
    console.error(`Instagram image ${id} failed:`, err.message);
    return false;
  }
}

const hasImage = async (env, id) => (await env.INSTAGRAM_CACHE.get(imgKey(id), "stream")) !== null;

// Drop images for posts that have fallen out of the current set, so KV doesn't
// grow without bound as Mike keeps posting.
async function pruneImages(env, keepIds) {
  const keep = new Set(keepIds.map(imgKey));
  let cursor;
  do {
    const listed = await env.INSTAGRAM_CACHE.list({ prefix: IMG_PREFIX, cursor });
    for (const k of listed.keys) {
      if (!keep.has(k.name)) await env.INSTAGRAM_CACHE.delete(k.name);
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
}

// Shared by the cron trigger and the manual-refresh route.
export async function refreshInstagramCache(env, { force = false } = {}) {
  if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_ACCOUNT_ID) {
    console.error("Instagram refresh skipped: INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID missing");
    return { ok: false, error: "Not configured" };
  }

  const apiUrl =
    `${GRAPH_API}/${env.INSTAGRAM_ACCOUNT_ID}/media` +
    `?fields=${FIELDS}&limit=25&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Instagram Graph API error", res.status, detail);
    // Deliberately leave the existing cache alone. The stored images are ours
    // and don't expire, so the homepage keeps showing the last good set.
    return { ok: false, error: `Graph API ${res.status}` };
  }

  const data = await res.json();
  const candidates = (data.data || [])
    .filter((p) => p.media_url || p.thumbnail_url)
    .slice(0, POST_LIMIT)
    .map((p) => ({
      id: p.id,
      // VIDEO posts only expose a cover frame via thumbnail_url — media_url
      // for those is the raw video file, not something to put in an <img>.
      source: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url || p.thumbnail_url,
      permalink: p.permalink,
      caption: (p.caption || "").slice(0, 200),
      timestamp: p.timestamp,
    }));

  // Only fetch bytes for posts we don't already hold. A normal run downloads
  // nothing at all; a run after Mike posts downloads exactly one.
  const posts = [];
  let downloaded = 0;
  for (const c of candidates) {
    let stored = force ? false : await hasImage(env, c.id);
    if (!stored) {
      stored = await writeImage(env, c.id, c.source);
      if (stored) downloaded++;
    }
    // A post whose image we couldn't store is skipped entirely rather than
    // listed with a broken link — this is what lets the client trust the list.
    if (stored) {
      posts.push({
        id: c.id,
        image: `/api/ig/${c.id}`,
        permalink: c.permalink,
        caption: c.caption,
        timestamp: c.timestamp,
      });
    }
  }

  if (!posts.length) {
    console.error("Instagram refresh stored zero usable posts — keeping previous cache");
    return { ok: false, error: "No usable posts" };
  }

  const updated = new Date().toISOString();
  await env.INSTAGRAM_CACHE.put(CACHE_KEY, JSON.stringify({ posts, updated }));
  await pruneImages(env, posts.map((p) => p.id));

  return { ok: true, count: posts.length, downloaded, updated };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
}
