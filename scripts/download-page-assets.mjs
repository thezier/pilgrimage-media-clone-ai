// Downloads the images used by the About and Contact pages into site/images/.
// URLs were read off the live DOM, so these are the site's own CDN assets.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CDN = "https://images.squarespace-cdn.com/content/v1/682ce02bc0c702098fd3e26d";

const assets = [
  // About
  ["images/about/portrait.jpg", `${CDN}/4cb9268f-75df-42f5-8eda-9cebf12bce5d/1D354D60-A7C0-42F3-961A-632FADAD3CFC_1_105_c.jpeg?format=1000w`],
  ["images/about/film-slide.jpg", `${CDN}/b755e8ad-95e4-4e7b-8896-bff4521d4646/film-slide.jpg?format=1500w`],

  // Contact — the strip images, in on-page order
  ["images/contact/strip-1.jpg", `${CDN}/bf71143f-186d-407e-a960-d3fef863a3e9/2055482-R1-E009.jpg?format=750w`],
  ["images/contact/strip-2.jpg", `${CDN}/e9b88169-b72f-4b27-b74d-335cd2c49706/2025-03-Kalia-Fitness-008.jpg?format=750w`],
  ["images/contact/strip-3.jpg", `${CDN}/7803ef21-05dd-4458-a456-2ee53f35e327/2025-03-Kalia-Fitness-209.jpg?format=750w`],
  ["images/contact/strip-4.jpg", `${CDN}/e1e49ee7-189b-4a65-919e-ffd1829bb667/Kalia-Senior-Portraits-2021-151.jpg?format=1000w`],
  ["images/contact/strip-5.jpg", `${CDN}/20f97ac0-af17-43b1-af8a-aa86eb5ba31c/2016-10-14-SJVA-Homecoming-Game-041.jpg?format=750w`],
  ["images/contact/strip-6.jpg", `${CDN}/3376d4a9-a1a6-4a1a-88f2-10d5abe0c8e3/2025-03-Kalia-Fitness-035.jpg?format=750w`],
  ["images/contact/strip-7.jpg", `${CDN}/94accdc6-dc4f-460a-af5c-c0fda43dbe1d/LauraHeikkila-20220420-053.jpg?format=750w`],
];

let failed = 0;
for (let i = 0; i < assets.length; i += 4) {
  const results = await Promise.allSettled(
    assets.slice(i, i + 4).map(async ([rel, url]) => {
      const dest = path.join(ROOT, "site", rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buf);
      return `${rel}  ${(buf.length / 1024).toFixed(0)}KB`;
    }),
  );
  for (const r of results) {
    if (r.status === "fulfilled") console.log(`  ok  ${r.value}`);
    else { failed++; console.error(`  FAIL ${r.reason.message}`); }
  }
}
console.log(failed ? `\n${failed} failed.` : `\nAll ${assets.length} downloaded.`);
process.exit(failed ? 1 : 0);
