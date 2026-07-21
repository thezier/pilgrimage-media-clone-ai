// Cloudflare Worker entry for new.pilgrimage.media.
//
// It exists for ONE dynamic route — POST /api/contact, which emails the contact
// form to the inbox via Resend. Every other request falls through to the static
// site (the ASSETS binding), so the site stays static except for this handler.
//
// Secrets/vars (set in the Cloudflare dashboard, not committed):
//   RESEND_API_KEY  — secret, from resend.com
//   CONTACT_TO      — where enquiries are delivered
//   CONTACT_FROM    — sender, on a Resend-verified domain
// Defaults for the two addresses live in wrangler.jsonc `vars`.

const REQUIRED = ["fname", "lname", "email", "message"];
const MAX_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const handler = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405);
      }
      return handleContact(request, env);
    }

    // Anything else is the static site.
    return env.ASSETS.fetch(request);
  },
};

export default handler;

async function handleContact(request, env) {
  // Accept both a JSON fetch (the enhanced form) and a plain urlencoded POST
  // (the no-JS fallback), so the form works either way.
  const wantsHtml = (request.headers.get("accept") || "").includes("text/html");
  let data;
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await request.json();
    } else {
      data = Object.fromEntries((await request.formData()).entries());
    }
  } catch {
    return reply(wantsHtml, { ok: false, error: "Could not read the form." }, 400);
  }

  // Honeypot: a field hidden from humans. If it's filled, it's a bot — return
  // success so it doesn't retry, but send nothing.
  if (data.company) return reply(wantsHtml, { ok: true }, 200);

  // Validation.
  for (const f of REQUIRED) {
    if (!data[f] || !String(data[f]).trim()) {
      return reply(wantsHtml, { ok: false, error: "Please fill in the required fields." }, 400);
    }
  }
  if (!EMAIL_RE.test(String(data.email).trim())) {
    return reply(wantsHtml, { ok: false, error: "That email address doesn't look right." }, 400);
  }
  if (String(data.message).length > MAX_LEN) {
    return reply(wantsHtml, { ok: false, error: "That message is a little too long." }, 400);
  }

  // Both are set in the dashboard, not committed (public repo). Missing either
  // is a misconfiguration, not the visitor's fault — generic message to them,
  // loud in the logs.
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    console.error(`Contact form not configured: ${!env.RESEND_API_KEY ? "RESEND_API_KEY " : ""}${!env.CONTACT_TO ? "CONTACT_TO" : ""} missing`);
    return reply(wantsHtml, { ok: false, error: "The form isn't available right now." }, 500);
  }

  // Services can arrive as repeated checkboxes (array) or a single value.
  const services = []
    .concat(data.services || [])
    .filter(Boolean)
    .join(", ");

  const name = `${data.fname} ${data.lname}`.trim();
  const rows = [
    ["Name", name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Services", services],
    ["Preferred date", data.date],
    ["Budget", data.budget],
    ["Heard about us", data.source],
    ["Newsletter", data.subscribe ? "Yes" : ""],
  ].filter(([, v]) => v && String(v).trim());

  const textBody =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nMessage:\n${data.message}`;

  const htmlBody =
    `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#696d5e"><strong>${esc(k)}</strong></td><td style="padding:4px 0">${esc(v)}</td></tr>`,
      )
      .join("") +
    `</table><p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(data.message)}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Pilgrimage Media <contact@pilgrimage.media>",
      to: [env.CONTACT_TO],
      reply_to: String(data.email).trim(), // so a reply goes straight to them
      subject: `New enquiry from ${name}`,
      text: textBody,
      html: htmlBody,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return reply(wantsHtml, { ok: false, error: "Couldn't send just now — please try again or email directly." }, 502);
  }

  return reply(wantsHtml, { ok: true }, 200);
}

// JSON for the fetch path; a simple HTML page for the no-JS form POST.
function reply(wantsHtml, body, status) {
  if (!wantsHtml) return json(body, status);
  const msg = body.ok
    ? "Thanks — your message is on its way. I'll be in touch soon."
    : body.error || "Something went wrong.";
  return new Response(page(body.ok, msg), {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function page(ok, msg) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ok ? "Message sent" : "Something went wrong"} — Pilgrimage Media</title>
<link rel="stylesheet" href="/css/style.css"></head>
<body><main style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:1.5rem;padding:0 6vw">
<h1>${ok ? "Message sent" : "Something went wrong"}</h1>
<p>${esc(msg)}</p>
<a class="btn btn-outline" href="/" style="height:68px">Back to home</a>
</main></body></html>`;
}
