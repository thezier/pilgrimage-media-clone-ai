import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route on this site is statically prerenderable, so we export a plain
  // directory of files. That lets the Pi's existing shared Caddy container serve
  // it the same way as the other sites — no Node process, no new port, no
  // docker-compose changes.
  output: "export",

  // next/image's default loader optimises on demand at runtime, which a static
  // export has no server for. The source images are already CDN-resized
  // (1.8MB total, largest 280KB), so serving them as-is is a fair trade for
  // dropping the server requirement.
  images: { unoptimized: true },

  // Emit `about/index.html` rather than `about.html`, so clean URLs resolve
  // without needing rewrite rules in Caddy.
  trailingSlash: true,
};

export default nextConfig;
