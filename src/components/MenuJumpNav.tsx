"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import { useActiveSection } from "@/lib/useActiveSection";
import { NAV_H } from "@/lib/motion";

export interface JumpTarget {
  label: string;
  id: string;
}

/* THE PILLS MATCH `PillLink`, because they are the same object at a smaller
   size: active is the flame FILL with a sand label, inactive is the chrome
   hairline that fills to flame on hover. They were a bespoke pair — sand-2/60
   with an ink/60 label — which is a fourth button recipe on a site whose whole
   button story is "there is one". */
const PILL =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-[var(--dur-base)] ease-house active:translate-y-px active:duration-[var(--dur-press)] motion-reduce:transition-none";
const PILL_ON = "border-flame bg-flame text-sand";
const PILL_OFF =
  "border-steel/55 bg-transparent text-ink hover:border-flame hover:bg-flame hover:text-sand";

// Smooth-scroll to a section when Lenis owns the scroll, keeping the hash
// shareable. Depends on nothing in the component, so it lives at module scope
// rather than being rebuilt on every render. Without Lenis (e.g. it failed to
// init) the plain anchor still works via the sections' scroll-mt.
//
// THE TARGET IS A NUMBER, NOT "#id". Handed a selector, Lenis resolves it as
// rect.top + its OWN animatedScroll − scroll-margin. Two things went wrong:
//  - animatedScroll is stale whenever the window moved natively and Lenis has
//    not seen the scroll event yet (touch scrolling, which Lenis does not own,
//    or a tap during momentum). On a phone the jump nav starts below the fold,
//    so the heading landed short by however far the page had just moved.
//  - Lenis already subtracts scroll-margin, so a separate `offset` counted the
//    bars twice and left a ~135px empty band under them on every width.
// So: absolute position from the live window.scrollY, and the section's
// scroll-mt as the one clearance, shared with native hash navigation.
function jump(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const lenis = getLenis();
  const section = document.getElementById(id);
  if (lenis && section) {
    e.preventDefault();
    const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - margin;
    // Bring Lenis level with the real scroll first, or it animates from where
    // it last thought the page was and the first frame jumps.
    if (Math.abs(lenis.animatedScroll - window.scrollY) > 1) {
      lenis.scrollTo(window.scrollY, { immediate: true });
    }
    lenis.scrollTo(top);
    history.replaceState(null, "", `#${id}`);
  }
}

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

  return (
    <nav
      aria-label="Menu categories"
      className="sticky z-nav border-b border-sand-3 bg-sand/95 backdrop-blur-sm"
      style={{ top: NAV_H }}
    >
      <ul
        ref={listRef}
        role="list"
        className="track flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`${PILL} ${isActive ? PILL_ON : PILL_OFF}`}
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
