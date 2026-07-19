import { useEffect, useState } from "react";

/**
 * Track which of the given section ids the viewer is currently reading, via a
 * single IntersectionObserver. Shared by the site navbar and the menu jump nav
 * — they pass different rootMargins for their different layouts, but the
 * observer logic (pick the most-visible intersecting section) is identical.
 */
export function useActiveSection(
  ids: string[],
  {
    rootMargin = "-45% 0px -45% 0px",
    threshold = [0, 0.25, 0.5, 1],
    enabled = true,
    initial = null,
  }: {
    rootMargin?: string;
    threshold?: number | number[];
    enabled?: boolean;
    initial?: string | null;
  } = {}
) {
  const [active, setActive] = useState<string | null>(initial);
  const key = ids.join(",");

  useEffect(() => {
    if (!enabled) return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin, threshold }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rootMargin, enabled]);

  return [active, setActive] as const;
}
