// SVG icons lifted from the live pilgrimage.media DOM.
// The header burger is Squarespace's stock three-bar mark; the close state
// reuses the same 3 bars rotated, which is why both live in one component.
import type { SVGProps } from "react";

export function BurgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 25 19"
      width="25"
      height="19"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect y="0" width="25" height="1.5" fill="currentColor" />
      <rect y="8.75" width="25" height="1.5" fill="currentColor" />
      <rect y="17.5" width="25" height="1.5" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 25 25"
      width="25"
      height="25"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="1"
        y="0"
        width="32"
        height="1.5"
        fill="currentColor"
        transform="rotate(45 1 0)"
      />
      <rect
        x="0"
        y="23"
        width="32"
        height="1.5"
        fill="currentColor"
        transform="rotate(-45 0 23)"
      />
    </svg>
  );
}
