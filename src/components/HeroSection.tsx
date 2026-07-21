import { Fragment } from "react";
import Image from "next/image";
import { HERO_HEADING } from "@/lib/content";

export function HeroSection() {
  return (
    <section className="section z-[6] pt-[var(--header-h)]">
      <div className="section-border section-border--flush divider-down bg-[var(--dark)]">
        <Image
          src="/images/topographic2.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="section-content fe-pad fe-grid [--fe-rows:24] md:[--fe-rows:21]">
        <h2 className="text-white [grid-area:1/2/7/11] md:[grid-area:2/11/9/21]">
          {HERO_HEADING.map((line, i) => (
            <Fragment key={line}>
              {line}
              {i < HERO_HEADING.length - 1 && <br />}
            </Fragment>
          ))}
        </h2>
        <div className="relative [grid-area:6/6/16/11] md:[grid-area:1/2/18/10]">
          <Image
            src="/images/hero-1.jpg"
            alt=""
            fill
            preload
            sizes="(min-width: 768px) 30vw, 45vw"
            className="object-contain"
          />
        </div>
        <div className="relative [grid-area:11/1/17/7] md:[grid-area:13/9/22/19]">
          <Image
            src="/images/hero-2.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 36vw, 50vw"
            className="object-contain"
          />
        </div>
        <div className="relative [grid-area:15/5/23/8] md:[grid-area:9/16/20/24]">
          <Image
            src="/images/hero-3.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 20vw, 35vw"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
