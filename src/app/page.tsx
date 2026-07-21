import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { MissionSection } from "@/components/MissionSection";
import { ServicesSection } from "@/components/ServicesSection";
import { LatestPostsSection } from "@/components/LatestPostsSection";
import { SiteFooter } from "@/components/SiteFooter";

// Section order and stacking mirror the live DOM exactly. The descending
// z-index lives on each section component (6/5/4/3/auto) — it is load-bearing,
// not decoration: each section paints over the next, and the triangle its
// clip-path removes is what reveals the next section's upward-bled background.
// The header is absolutely positioned and overlaps the hero on purpose.
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <PortfolioSection />
        <MissionSection />
        <ServicesSection />
        <LatestPostsSection />
      </main>
      <SiteFooter />
    </>
  );
}
