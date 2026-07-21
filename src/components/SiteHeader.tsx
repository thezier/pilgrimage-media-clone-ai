"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WORDMARK, NAV_LINKS } from "@/lib/content";
import { BurgerIcon, CloseIcon } from "@/components/icons";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="absolute top-0 left-0 right-0 z-10 w-full text-white">
      <div className="relative min-[800px]:p-[1.4vw_4vw] max-[799px]:p-[6vw]">
        <Link
          href="/"
          className="block w-full text-center font-sans font-semibold text-[length:var(--fs-wordmark)] leading-[1.2] tracking-[0.07em] uppercase text-white"
        >
          {WORDMARK}
        </Link>

        <nav className="hidden w-full min-[800px]:flex min-[800px]:justify-center">
          <ul className="inline-flex justify-center">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="mx-[10.8px] whitespace-nowrap">
                <Link
                  href={link.href}
                  className="block py-[1.6px] text-center font-mono text-base leading-6 font-semibold tracking-[-0.02em] text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="absolute top-1/2 right-[6vw] flex -translate-y-1/2 text-white min-[800px]:hidden"
        >
          <BurgerIcon />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-[var(--dark)]">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            aria-expanded={isOpen}
            className="absolute top-[6vw] right-[6vw] text-white"
          >
            <CloseIcon />
          </button>

          <ul className="flex flex-col items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-base leading-6 font-semibold tracking-[-0.02em] text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
