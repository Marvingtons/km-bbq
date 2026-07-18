"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import { useActiveSection } from "@/lib/useActiveSection";
import { NAV_H } from "@/lib/motion";

export interface JumpTarget {
  label: string;
  id: string;
}

// Clearance for content jumped to: fixed site header (NAV_H) plus this bar.
// Sections also carry scroll-mt as a fallback for native hash navigation.
const SCROLL_OFFSET = -(NAV_H + 60);

export function MenuJumpNav({ targets }: { targets: JumpTarget[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  // Highlight the category whose section currently crosses the upper part of
  // the viewport. Sections are tall and contiguous, so a narrow band keeps
  // exactly one active at a time. Shared observer logic with the site navbar.
  const [active] = useActiveSection(
    targets.map(({ id }) => id),
    { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.1, 0.5, 1] }
  );

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
      className="sticky z-40 border-b border-paper-line bg-cream/95 px-6 backdrop-blur-sm"
      style={{ top: NAV_H }}
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
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-ember-deep bg-ember-deep text-white"
                    : "border-paper-line bg-white/60 text-foreground/60 hover:border-ember-deep/50 hover:text-ember-deep"
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
