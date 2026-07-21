import Link from "next/link";
import { FOOTER_LINKS, WORDMARK } from "@/lib/content";

// Grid-area pairs (mobile / desktop) for each of the 5 footer nav links, in
// the same order as FOOTER_LINKS. Each block is its own row, 24px tall.
const LINK_GRID_AREAS = [
  "[grid-area:5/2/6/10] md:[grid-area:4/2/5/10]",
  "[grid-area:6/2/7/10] md:[grid-area:5/2/6/10]",
  "[grid-area:7/2/8/10] md:[grid-area:6/2/7/10]",
  "[grid-area:8/2/9/10] md:[grid-area:7/2/8/10]",
  "[grid-area:9/2/10/10] md:[grid-area:8/2/9/10]",
];

export function SiteFooter() {
  return (
    <footer className="flex items-center bg-white text-black">
      <div className="fe-pad fe-grid w-full [--fe-rows:23] md:[--fe-rows:9]">
        <h3 className="[grid-area:2/2/5/6] md:[grid-area:2/2/4/14] text-left text-black">
          {WORDMARK}
        </h3>

        {FOOTER_LINKS.map((link, index) => (
          <p key={link.href} className={LINK_GRID_AREAS[index]}>
            <Link
              href={link.href}
              className="font-mono text-base leading-6 font-semibold tracking-[-0.02em] text-black"
            >
              {link.label}
            </Link>
          </p>
        ))}

        <p className="[grid-area:12/2/14/10] md:[grid-area:2/17/4/26] font-mono text-[14px] leading-[21.4px] font-semibold tracking-[-0.02em] text-black">
          Stay in the Loop
          <br />
          &mdash;
        </p>

        <div className="[grid-area:14/2/24/10] md:[grid-area:4/17/10/26]">
          <h2 className="mt-0 mb-4 text-left text-[length:var(--fs-h3)] leading-[1.2] text-black">
            Subscribe to our newsletter
          </h2>

          <form className="flex flex-wrap">
            <div className="mt-4">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                aria-label="Email address"
                className="h-[66px] w-[284px] border border-black/12 bg-white px-8 py-[22.4px] font-mono text-base leading-[19.2px] font-semibold tracking-[-0.02em] text-black"
              />
            </div>

            <div className="mt-4 py-2 pr-1 pl-0">
              <button
                type="button"
                className="btn-solid inline-flex h-16 w-[131px] items-center justify-center px-8 py-[22.4px] font-mono text-base leading-[19.2px] font-semibold whitespace-nowrap"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </footer>
  );
}
