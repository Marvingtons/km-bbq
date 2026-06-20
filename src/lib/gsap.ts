// Central GSAP + ScrollTrigger registration.
// Importing from here guarantees the plugin is registered exactly once,
// and only in the browser (App Router renders components on the server too).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// registerPlugin is idempotent, so calling it on every client import is safe.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
