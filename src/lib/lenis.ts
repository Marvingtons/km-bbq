import type Lenis from "@studio-freight/lenis";

// The Lenis instance lives in the SmoothScroll provider; anything that needs
// programmatic smooth scrolling (e.g. the menu jump nav) reads it from here.
// Native scrollTo/scrollIntoView must not be used while Lenis is active — it
// animates window scroll every frame and immediately overrides them.
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}
