import type Lenis from "lenis";

// The Lenis instance lives in the SmoothScroll provider; anything that needs
// programmatic smooth scrolling (e.g. the menu jump nav) reads it from here.
// Native scrollTo/scrollIntoView must not be used while Lenis is active — it
// animates window scroll every frame and immediately overrides them.
let lenis: Lenis | null = null;

type Listener = (instance: Lenis | null) => void;
const listeners = new Set<Listener>();

export function setLenis(instance: Lenis | null) {
  lenis = instance;
  for (const fn of listeners) fn(instance);
}

export function getLenis() {
  return lenis;
}

/**
 * SUBSCRIBE TO THE INSTANCE, NOT TO ITS EXISTENCE AT ONE MOMENT.
 *
 * `getLenis()` is a snapshot, and a consumer that reads it in an effect is
 * racing the provider: SmoothScroll creates Lenis in its own effect, and effect
 * order is DOM order, so a component mounted above it sees null and a component
 * below it sees an instance. Whichever way it falls today, it changes the first
 * time someone moves a component in the tree.
 *
 * This fires immediately with the current value (null included) and again on
 * every change, so a consumer expresses "attach to Lenis when there is one,
 * fall back to the window when there is not" once and is correct in both
 * orders — and under reduced motion, where there is never an instance at all.
 *
 * Returns an unsubscribe.
 */
export function onLenis(fn: Listener) {
  listeners.add(fn);
  fn(lenis);
  return () => {
    listeners.delete(fn);
  };
}
