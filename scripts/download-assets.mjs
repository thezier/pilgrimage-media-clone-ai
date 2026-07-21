// Downloads every real asset used by pilgrimage.media into public/.
// URLs were enumerated from the live DOM (see docs/research/_assets.json and
// docs/research/_detail.json), so this is the site's own CDN content, not
// stand-ins. Safe to re-run: existing files are overwritten.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CDN = 'https://images.squarespace-cdn.com/content/v1/682ce02bc0c702098fd3e26d';

const assets = [
  // hero
  ['images/topographic2.png', `${CDN}/89e074f7-48e4-4c4e-a5d6-66b3bd2604ee/topographic2.png?format=1500w`],
  ['images/hero-1.jpg', `${CDN}/2d9fe28a-430b-4dd4-a593-bc239b6acf66/2025-03-Kalia-Fitness-218.jpg?format=1000w`],
  ['images/hero-2.jpg', `${CDN}/7db8a7f0-3fad-4372-afd9-25def62e5ffe/2055483-R1-E024.jpg?format=1000w`],
  ['images/hero-3.jpg', `${CDN}/7ffd5837-da84-4512-bb58-e3befc572f44/LauraHeikkila-20220420-104.jpg?format=1000w`],
  // full-bleed section backgrounds
  ['images/portfolio-bg.jpg', `${CDN}/be5ed23f-2124-46d7-ae5c-be01fc89ddd1/2025-03-Kalia-Fitness-bg.jpg?format=2500w`],
  ['images/services-bg.jpg', `${CDN}/d1da865c-151e-478f-bcff-071f9465c49c/2025-03-Kalia-Fitness-bg2.jpg?format=2500w`],
];

// Latest Posts gallery (Instagram cross-posts), in on-page order.
const gallery = [
  ['1759780010498-DJPS89VK92TFS0S3VSJ3', 'https://www.instagram.com/p/DPeh0HdkkwX/'],
  ['1759379030290-1V2C5Z5Y71E0QQXV1JRD', null],
  ['1758904412583-O86JUH4O6VTQ9JX6MWQU', 'https://www.instagram.com/p/DPEgDesEYBD/'],
  ['1758753854282-76XY747ORXE4AR0V1KC5', 'https://www.instagram.com/p/DPAEwqMkprD/'],
  ['1757026435711-VZR45QAV9GWMUU342Q99', null],
  ['1756928494356-I7R8I4Q59SLH2887DA6L', null],
  ['1756827277679-HG2BIH34IAZH75XGECBS', 'https://www.instagram.com/p/DOGsA-IEYT8/'],
  ['1756777401915-7IFIYAE5KHYXHUJW5P4U', 'https://www.instagram.com/p/DOFMlEGiar7/'],
];
gallery.forEach(([id], i) => {
  assets.push([`images/posts/post-${i + 1}.jpg`, `${CDN}/${id}/image-asset.jpeg?format=750w`]);
});

async function download([rel, url]) {
  const dest = path.join(ROOT, 'public', rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return rel;
}

// Batches of 4 so we never open more than a handful of CDN connections at once.
let failed = 0;
for (let i = 0; i < assets.length; i += 4) {
  const results = await Promise.allSettled(assets.slice(i, i + 4).map(download));
  for (const r of results) {
    if (r.status === 'fulfilled') console.log(`  ok  ${r.value}`);
    else { failed++; console.error(`  FAIL ${r.reason.message}`); }
  }
}
console.log(failed ? `\n${failed} asset(s) failed.` : `\nAll ${assets.length} assets downloaded.`);
process.exit(failed ? 1 : 0);
