/**
 * The dot in KM.BBQ, and the separators between phrases, set in the logo pink.
 *
 * Pink's second job is punctuation. The mark itself carries a pink dot between
 * KM and BBQ; wherever the name is set as TYPE the dot should be the same
 * colour, so the wordmark and the typeset name are recognisably one thing.
 *
 * The glyph stays in the text run rather than being drawn as a shape, so it
 * copies, reads aloud, and wraps exactly as it did before — this is a colour
 * change, not a substitution.
 */
/**
 * CONTRAST, measured:
 *   the "." in KM.BBQ  — only ever set on the char-2 footer, 4.79:1, passes
 *                        AA at body size, and is never inside a link. It stays
 *                        in the accessibility tree because it is part of the
 *                        restaurant's name, not decoration.
 *   the "·" separators — 3.51:1 on cream. Pink cannot reach 4.5:1 against cream
 *                        at any opacity, so these are marked aria-hidden: they
 *                        carry no information the spacing does not already
 *                        carry, which is what makes them incidental text rather
 *                        than content that fails.
 * The rule that follows: pink is only allowed on a glyph that is either part of
 * the wordmark or explicitly ornamental. It never sets anything a reader needs.
 */
export function Dot({
  char = ".",
  className = "",
}: {
  char?: string;
  className?: string;
}) {
  const isWordmarkDot = char === ".";
  return (
    <span aria-hidden={isWordmarkDot ? undefined : "true"} className={`text-neon-pink ${className}`}>
      {char}
    </span>
  );
}
