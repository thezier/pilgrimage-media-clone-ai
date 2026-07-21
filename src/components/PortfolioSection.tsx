import Image from "next/image";
import Link from "next/link";
import {
  CONTACT_URL,
  PORTFOLIO_BODY,
  PORTFOLIO_CATEGORIES,
} from "@/lib/content";

// Grid-area pairs (mobile, then md:) for the 3 category headings, in the
// same order as PORTFOLIO_CATEGORIES.
const CATEGORY_AREAS = [
  "[grid-area:11/2/13/11] md:[grid-area:10/11/12/26]",
  "[grid-area:14/2/16/11] md:[grid-area:12/11/14/26]",
  "[grid-area:17/2/19/11] md:[grid-area:14/11/16/26]",
];

export function PortfolioSection() {
  return (
    <section id="portfolio" className="section z-[5]">
      <div className="section-border divider-up bg-olive">
        <Image
          src="/images/portfolio-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="section-content fe-grid [--fe-rows:29] md:[--fe-rows:24]">
        <h1 className="[grid-area:3/2/6/10] md:[grid-area:5/11/9/26] text-white">
          View the Galleries
        </h1>

        <hr className="rule text-white [grid-area:6/2/7/10] md:[grid-area:7/11/8/20]" />

        <p className="italic text-white [grid-area:7/2/8/10] md:[grid-area:8/11/9/20]">
          Portfolio image categories
        </p>

        {PORTFOLIO_CATEGORIES.map((category, index) => (
          <h3
            key={category.href}
            className={`${CATEGORY_AREAS[index]} text-white`}
          >
            <Link href={category.href}>{category.label}</Link>
          </h3>
        ))}

        <p className="text-white [grid-area:20/2/25/9] md:[grid-area:17/11/19/21]">
          {PORTFOLIO_BODY}
        </p>

        <Link
          href={CONTACT_URL}
          className="btn btn-outline [grid-area:25/2/27/7] md:[grid-area:20/11/22/15]"
        >
          Let&apos;s Connect
        </Link>
      </div>
    </section>
  );
}
