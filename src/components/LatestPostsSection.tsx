import Image from "next/image";
import { GALLERY_POSTS, INSTAGRAM_URL } from "@/lib/content";

const HEADING = "Latest Posts";

export function LatestPostsSection() {
  return (
    <section className="section section--no-pad text-black">
      <div className="section-border bg-white" />
      <div className="section-content fe-pad fe-grid [--fe-rows:18] md:[--fe-rows:17]">
        <h2 className="text-start text-black [grid-area:3/2/5/10] md:[grid-area:3/4/5/24]">
          {HEADING}
        </h2>

        {/* Squarespace's gallery grid has NO gap — measured slide pitch equals
            slide width exactly (280.5 vs 281 @1440, 182 vs 182 @390). The cell
            ratio is a clean 3:4 at desktop; at mobile the measured ratio is
            slightly narrower (171.5 x 235.5), so it is set from measurement. */}
        <div className="grid grid-cols-2 gap-0 [grid-area:5/2/17/10] md:grid-cols-4 md:[grid-area:5/4/16/24]">
          {GALLERY_POSTS.map((post) => {
            const image = (
              <Image
                src={post.src}
                alt={post.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            );

            return post.href ? (
              <a
                key={post.src}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[0.7282] md:aspect-[3/4]"
              >
                {image}
              </a>
            ) : (
              <div key={post.src} className="relative aspect-[0.7282] md:aspect-[3/4]">
                {image}
              </div>
            );
          })}
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid [grid-area:17/4/19/8] md:[grid-area:16/11/18/17]"
        >
          More posts
        </a>
      </div>
    </section>
  );
}
