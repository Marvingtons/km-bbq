import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Re-measure ScrollTrigger once async content settles. Pinned sections measure
 * their start/end against layout that shifts as fonts and the final window load
 * land; measuring against stale sizes is what makes a pin jump on first scroll.
 * About and Gallery both need this identical plumbing — one helper, one place.
 */
export function useScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);
}
