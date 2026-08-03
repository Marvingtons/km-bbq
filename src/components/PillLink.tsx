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
 *   solid    the primary action in its region. Flame fill, bone label.
 *   outline  everything secondary. A char-3 hairline that fills to flame on
 *            hover, so both states are the same two colours.
 *
 * No third tone and no colour surgery through `className`. If a button needs
 * to look different, the answer is `tone`, not a new recipe.
 */
const BASE =
  "group relative isolate inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-7 py-3 font-sans text-sm font-semibold transition-colors duration-[var(--dur-base)] ease-house";

const TONES = {
  solid: "bg-flame text-bone hover:bg-ember hover:text-char",
  outline:
    "border border-char-3 bg-char-2/60 text-bone hover:border-flame hover:bg-flame hover:text-bone",
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
          className="transition-transform duration-[var(--dur-base)] ease-house group-hover:translate-x-0.5"
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
