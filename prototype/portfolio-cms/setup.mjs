// Creates the admin account and the `projects` collection.
// Idempotent-ish: safe to re-run; it skips anything that already exists.
//
//   node setup.mjs
//
// Schema is defined here rather than clicked together in the UI so it can be
// recreated from scratch, code-reviewed, and moved to the Pi unchanged.
const PB = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_EMAIL || "mike@thezier.com";
const PASSWORD = process.env.PB_PASSWORD || "prototype-password-change-me";

const api = async (path, opts = {}, token) => {
  const res = await fetch(`${PB}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...opts.headers,
    },
  });
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    json = body;
  }
  if (!res.ok) throw new Error(`${res.status} ${path} — ${JSON.stringify(json)}`);
  return json;
};

// --- 1. authenticate --------------------------------------------------------
// The first superuser cannot be created over the API (PocketBase refuses it
// unauthenticated, by design). start.sh creates it via the CLI first:
//     ./pocketbase superuser upsert <email> <password>
const auth = await api("/api/collections/_superusers/auth-with-password", {
  method: "POST",
  body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
});
const token = auth.token;
console.log("  authenticated");

// --- 2. the projects collection --------------------------------------------
// Field notes:
//   slug     — drives the URL: /portfolio/<slug>/
//   cover    — single image, used on the index grid and as the OG image
//   gallery  — the project's photos, in the order you arrange them
//   published— the build script only ever emits published projects, so you can
//              stage a project over several sittings without it going live
const projects = {
  name: "projects",
  type: "base",
  // Public read of published rows only, so the build script needs no secret.
  listRule: "published = true",
  viewRule: "published = true",
  createRule: null, // admin-only via the dashboard
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: "title", type: "text", required: true, max: 120 },
    {
      name: "slug",
      type: "text",
      required: true,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", // lowercase-hyphenated, URL safe
      max: 80,
    },
    { name: "summary", type: "text", max: 200 },
    { name: "body", type: "editor" },
    {
      name: "category",
      type: "select",
      maxSelect: 1,
      values: ["Athletes & Fitness", "Sports & Events", "Health & Adventure"],
    },
    { name: "shot_on", type: "date" },
    {
      name: "cover",
      type: "file",
      maxSelect: 1,
      maxSize: 15728640, // 15MB — camera JPEGs exceed PocketBase's 5MB default
      mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      thumbs: ["400x500", "1200x0"],
    },
    {
      name: "gallery",
      type: "file",
      maxSelect: 60,
      maxSize: 15728640,
      mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      thumbs: ["400x500", "1600x0"],
    },
    { name: "published", type: "bool" },
    { name: "sort_order", type: "number" },
  ],
};

const existing = await api("/api/collections?perPage=200", {}, token);
const found = existing.items?.find((c) => c.name === "projects");
if (found) {
  console.log("  collection `projects` already exists — leaving it alone");
} else {
  await api("/api/collections", { method: "POST", body: JSON.stringify(projects) }, token);
  console.log("  created collection `projects`");
}

console.log(`\nAdmin UI: ${PB}/_/`);
console.log(`Login:    ${EMAIL} / ${PASSWORD}`);
