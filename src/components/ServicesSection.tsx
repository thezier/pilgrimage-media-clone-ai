import Image from "next/image";
import Link from "next/link";
import { CONTACT_URL, SERVICE_LINES } from "@/lib/content";

const SERVICES_HEADING = "Services";
const SERVICES_EYEBROW = "Photography / Videography";

// Only the first lead is <strong><em> on the live site (weight 700); the rest
// are a plain <em> at the inherited 600. Likewise the first paragraph carries
// margin `0 0 16px` and the others `16px 0`.
const leadWeight = (i: number) => (i === 0 ? "font-bold" : "font-semibold");

// Measured on the live site: `0 0 16px`, `16px 0`, then `16px 0 0` — the last
// paragraph has no bottom margin, which is worth 16px of section height.
const paragraphMargin = (i: number, last: number) =>
  i === 0 ? "mb-4" : i === last ? "mt-4" : "my-4";

export function ServicesSection() {
  return (
    <section id="services" className="section relative z-[3]">
      <div className="section-border divider-up bg-white">
        <Image
          src="/images/services-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="section-content fe-grid text-black [--fe-rows:32] md:[--fe-rows:20]">
        <h1 className="[grid-area:3/2/5/10] text-black md:[grid-area:4/2/6/14]">
          {SERVICES_HEADING}
        </h1>
        <hr className="rule text-black [grid-area:5/2/6/10] md:[grid-area:6/2/7/11]" />
        <p className="not-italic font-sans font-semibold uppercase tracking-[0.07em] text-[length:var(--fs-em)] leading-[1.17] text-black [grid-area:6/2/8/10] md:[grid-area:8/2/9/14]">
          {SERVICES_EYEBROW}
        </p>
        <div className="font-mono text-base leading-6 tracking-[-0.02em] text-black [grid-area:8/2/16/9] md:[grid-area:9/2/14/14]">
          {SERVICE_LINES.map((line, index) => (
            <p
              key={line.lead}
              className={paragraphMargin(index, SERVICE_LINES.length - 1)}
            >
              <em className={`italic ${leadWeight(index)}`}>{line.lead}</em>
              {line.body}
            </p>
          ))}
        </div>
        <Link
          href={CONTACT_URL}
          className="btn btn-solid [grid-area:27/3/29/9] md:[grid-area:15/2/17/7]"
        >
          Let&apos;s Connect
        </Link>
      </div>
    </section>
  );
}
