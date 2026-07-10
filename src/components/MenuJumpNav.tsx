"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";

export interface JumpTarget {
  label: string;
  id: string;
}

// Clearance for content jumped to: fixed site header (~68px) plus this bar.
// Sections also carry scroll-mt as a fallback for native hash navigation.
const SCROLL_OFFSET = -128;

export function MenuJumpNav({ targets }: { targets: JumpTarget[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Highlight the category whose section currently crosses the upper part of
  // the viewport. Sections are tall and contiguous, so a narrow band keeps
  // exactly one active at a time.
  useEffect(() => {
    const sections = targets
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.1, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [targets]);

  // Keep the active pill visible in the horizontally scrollable strip.
  useEffect(() => {
    if (!active || !listRef.current) return;
    const pill = listRef.current.querySelector<HTMLElement>(
      `[data-target="${active}"]`
    );
    pill?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const lenis = getLenis();
    if (lenis) {
      // Lenis owns window scroll; let it animate and keep the hash shareable.
      e.preventDefault();
      lenis.scrollTo(`#${id}`, { offset: SCROLL_OFFSET });
      history.replaceState(null, "", `#${id}`);
    }
    // Without Lenis (e.g. it failed to init) the plain anchor still works via
    // the sections' scroll-mt.
  };

  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-[64px] z-40 border-b border-ink/10 bg-cream/95 px-6 backdrop-blur-sm"
    >
      <ul
        ref={listRef}
        role="list"
        className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {targets.map(({ label, id }) => {
          const isActive = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                data-target={id}
                onClick={(e) => jump(e, id)}
                aria-current={isActive ? "true" : undefined}
                className={`inline-block whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-ember bg-ember text-white"
                    : "border-ink/15 bg-cream/60 text-foreground/60 hover:border-ember/50 hover:text-ember-deep"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
