// Instagram "Latest Posts" — Graph API fetch, cached in Workers KV.
//
// GET /api/latest-posts    — serves the cached JSON (fast; never calls the
//                             Graph API on a visitor's request).
// POST /api/refresh-posts  — manually re-runs the fetch, protected by
//                             REFRESH_SECRET. Mainly for populating the cache
//                             right after setup, without waiting for the
//                             next cron tick.
// The scheduled() handler in contact.js calls refreshInstagramCache() on the
// cron defined in wrangler.jsonc (`triggers.crons`) to keep the cache warm.
//
// Secrets (set via `wrangler secret put`, not committed):
//   INSTAGRAM_ACCESS_TOKEN  — long-lived Page Access Token (pages_show_list,
//                             pages_read_engagement, instagram_basic)
//   INSTAGRAM_ACCOUNT_ID    — the linked Instagram Business Account's numeric ID
//   REFRESH_SECRET          — shared secret for POST /api/refresh-posts
//
// KV binding: INSTAGRAM_CACHE (see wrangler.jsonc kv_namespaces)

const GRAPH_API = "https://graph.facebook.com/v21.0";
const CACHE_KEY = "latest-posts";
const POST_LIMIT = 8;
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

export async function handleLatestPosts(env) {
  const cached = await env.INSTAGRAM_CACHE.get(CACHE_KEY, "json");
  if (!cached) return json({ ok: false, error: "Not cached yet" }, 503);
  return json({ ok: true, posts: cached.posts, updated: cached.updated });
}

export async function handleRefreshPosts(request, env) {
  const url = new URL(request.url);
  const provided = request.headers.get("x-refresh-secret") || url.searchParams.get("secret");
  if (!env.REFRESH_SECRET || provided !== env.REFRESH_SECRET) {
    return json({ ok: false, error: "Not authorized" }, 401);
  }
  const result = await refreshInstagramCache(env);
  return json(result, result.ok ? 200 : 502);
}

// Shared by the cron trigger and the manual-refresh route.
export async function refreshInstagramCache(env) {
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
    return { ok: false, error: `Graph API ${res.status}` };
  }

  const data = await res.json();
  const posts = (data.data || [])
    .filter((p) => p.media_url || p.thumbnail_url)
    .slice(0, POST_LIMIT)
    .map((p) => ({
      id: p.id,
      // VIDEO posts only expose a cover frame via thumbnail_url — media_url
      // for those is the raw video file, not something to put in an <img>.
      image: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url || p.thumbnail_url,
      permalink: p.permalink,
      caption: (p.caption || "").slice(0, 200),
      timestamp: p.timestamp,
    }));

  if (!posts.length) {
    console.error("Instagram refresh got zero usable posts — keeping previous cache");
    return { ok: false, error: "No usable posts returned" };
  }

  const updated = new Date().toISOString();
  await env.INSTAGRAM_CACHE.put(CACHE_KEY, JSON.stringify({ posts, updated }));
  return { ok: true, count: posts.length, updated };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
}
