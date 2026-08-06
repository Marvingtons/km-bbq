import Link from "next/link";

/**
 * THE button. Every call to action on the site is this component — the hero,
 * About, the nav's phone CTA, the mobile takeover, the directions links. One
 * shape, one label recipe, one pair of colours, so the comment that used to
 * live here claiming "every button on the site is one object" is now true
 * rather than aspirational. Six of the seven pills it described were re-typed
 * inline with six different label recipes and five padding pairs.
 *
 * Two tones, and they are the same object at two volumes:
 *
 *   solid    the primary action in its region. Flame fill, sand label.
 *   outline  everything secondary. A CHROME hairline that fills to flame on
 *            hover, so both states are the same two colours.
 *
 * No third tone and no colour surgery through `className`. If a button needs
 * to look different, the answer is `tone`, not a new recipe.
 *
 * ON THE WARM GROUND, and why hover resolves to black. The accent is the one
 * interaction colour, so a solid pill cannot hover to a second accent — there
 * isn't one any more. It hovers to `char`, the room's ceiling black, which is
 * the site's other real surface and measures 15.80:1 against the sand label.
 * Pressing a button resolves toward the structure rather than toward a colour
 * the room does not contain.
 *
 * The outline hairline is `steel` — the chrome of the downdraft ducts. It is
 * the one place every secondary action on the site touches the room's own
 * material.
 */
/**
 * PRESS IS A REAL STATE, and it is one pixel.
 *
 * Every control on the site hovered and then did nothing on the way down, so a
 * tap on a phone — which has no hover at all — got no acknowledgement between
 * touch and navigation. `active:translate-y-px` is the whole affordance: the
 * button goes down under the finger and comes back. It is the same gesture the
 * game's dome already had (`--ease-press`), applied to the object every other
 * action on the site is made of.
 *
 * Transitions cover transform as well as colour now, and press is faster than
 * release (`--dur-press` down, `--dur-base` back) because that is what a real
 * button feels like — see MOTION.dur in lib/motion.ts, which documents that
 * asymmetry and had nothing using it.
 */
const BASE =
  "group relative isolate inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-7 py-3 font-sans text-sm font-semibold transition-[color,background-color,border-color,transform] duration-[var(--dur-base)] ease-house active:translate-y-px active:duration-[var(--dur-press)] motion-reduce:active:translate-y-0 motion-reduce:transition-none";

/**
 * `.pill-outline` is a HOOK, not a style — it carries no rules of its own on
 * the warm ground. Inside a `.section-dark` band it lifts the resting stroke
 * from steel/55, which measures 2.2:1 on char and misses the 3:1 a control's
 * own boundary has to clear, to sand/40 at 3.43:1. The LABEL needs no hook:
 * `text-ink` is a token the band already remaps.
 *
 * The gallery's two chevrons carry the same class, because they are the same
 * object drawn round instead of as a stadium.
 */
const TONES = {
  solid: "bg-flame text-sand hover:bg-char hover:text-sand",
  outline:
    "pill-outline border border-steel/55 bg-transparent text-ink hover:border-flame hover:bg-flame hover:text-sand",
} as const;

export function PillLink({
  href,
  children,
  arrow = false,
  tone = "solid",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  tone?: keyof typeof TONES;
  external?: boolean;
  className?: string;
}) {
  const cls = `${BASE} ${TONES[tone]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          // 3px, and 0.2s. It was 2px (`translate-x-0.5`) over 0.3s, which is
          // slow enough and small enough that the arrow reads as drifting
          // rather than as answering the cursor.
          className="transition-transform duration-200 ease-house group-hover:translate-x-[3px] motion-reduce:transition-none"
        >
          →
        </span>
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
