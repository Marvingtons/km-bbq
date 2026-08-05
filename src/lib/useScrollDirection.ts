import { useEffect, useRef, useState } from "react";
import { onLenis } from "./lenis";

/**
 * THE NAV BAR'S TWO SCROLL FACTS, off one subscription.
 *
 *   past    the reader has left the top of the page (the bar's surface fades in)
 *   hidden  the reader is moving DOWN, past `hideAfter` (the bar retracts)
 *
 * READ FROM LENIS, NOT FROM `window`. Lenis animates window scroll every frame
 * toward a target, so `window.scrollY` during a gesture is the SMOOTHED
 * position — it keeps changing for ~0.9s after the wheel stops, and it can
 * still be moving down while the reader has already flicked up. A bar that
 * hides on that signal retracts on the tail of a gesture the reader has
 * finished, which is the jitter this pattern is notorious for. Lenis publishes
 * the gesture itself, and `direction` is the reader's intent rather than the
 * animation's current sign.
 *
 * The window fallback is not a nicety: under reduced motion SmoothScroll never
 * constructs Lenis, and the bar still has to work.
 *
 * IT ACCUMULATES A DIRECTION; IT DOES NOT COMPARE TWO FRAMES.
 *
 * A per-frame comparison is what makes these bars notorious. Lenis emits on
 * every animated frame of a 0.9s ease, so a single wheel notch produces a long
 * tail of decreasing deltas — and any hand jitter, any trackpad rest, any
 * rubber-band at the end of the document flips the sign of one of them. The bar
 * then retracts and returns inside one gesture.
 *
 * So movement is summed while its sign holds and RESET when the sign flips, and
 * the state only changes once the run in one direction passes `travel`. A
 * reader alternating a few pixels never accumulates anything; a reader actually
 * heading down the page passes it inside one notch. `past` is exempt — it is a
 * position, not a direction, and is simply true above 60px.
 */
export function useScrollDirection({
  hideAfter = 200,
  travel = 12,
}: { hideAfter?: number; travel?: number } = {}) {
  const [past, setPast] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Refs, not state: these are written on every scroll frame and doing so must
  // not schedule a render. Only the two booleans above do that, and only when
  // they actually flip.
  const lastY = useRef(0);
  const run = useRef(0);

  useEffect(() => {
    const apply = (y: number) => {
      const d = y - lastY.current;
      lastY.current = y;
      setPast(y > 60);
      if (d === 0) return;
      // Same direction extends the run; a reversal starts a new one from this
      // frame's delta rather than from zero, so a genuine flick up is not
      // penalised one frame for having followed a scroll down.
      run.current = Math.sign(d) === Math.sign(run.current) ? run.current + d : d;
      if (run.current > travel && y > hideAfter) {
        setHidden(true);
        run.current = 0;
      } else if (run.current < -travel) {
        // Up is always a reveal, at any position.
        setHidden(false);
        run.current = 0;
      }
      // Back at the top there is nothing to get out of the way of.
      if (y <= hideAfter) setHidden(false);
    };

    let detach = () => {};
    const off = onLenis((instance) => {
      detach();
      if (instance) {
        const onScroll = () => apply(instance.scroll);
        instance.on("scroll", onScroll);
        detach = () => instance.off("scroll", onScroll);
        apply(instance.scroll);
      } else {
        const onScroll = () => apply(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        detach = () => window.removeEventListener("scroll", onScroll);
        // Seed from the real position: a reload lands mid-page with a restored
        // scroll offset, and a bar that thinks it is at the top paints its
        // transparent state over content.
        lastY.current = window.scrollY;
        setPast(window.scrollY > 60);
      }
    });

    return () => {
      off();
      detach();
    };
  }, [hideAfter, travel]);

  return { past, hidden };
}
