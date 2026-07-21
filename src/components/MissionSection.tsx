const EYEBROW_TEXT = "Athleticism is for everyone";
const HEADING_TEXT =
  "A healthier world starts with living vibrantly and leading by example.";

export function MissionSection() {
  return (
    <section className="section z-[4]">
      <div className="section-border divider-down bg-[var(--olive)]" />
      <div className="section-content fe-pad fe-grid [--fe-rows:11] md:[--fe-rows:7]">
        <div className="[grid-area:2/2/11/10] md:[grid-area:2/9/7/19]">
          <p className="text-center font-sans text-[length:var(--fs-em)] leading-[1.171] tracking-[0.07em] font-semibold italic uppercase text-white">
            <em>{EYEBROW_TEXT}</em>
          </p>
          <h2 className="mt-8 text-center text-white">{HEADING_TEXT}</h2>
        </div>
      </div>
    </section>
  );
}
