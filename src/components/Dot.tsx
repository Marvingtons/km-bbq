/**
 * The dot in KM.BBQ, and the separators between phrases.
 *
 * THIS COMPONENT NO LONGER SETS A COLOUR. It used to set the logo pink, on the
 * rule that "pink's second job is punctuation" — the mark carries a pink dot
 * between KM and BBQ, so wherever the name was set as type the dot matched.
 *
 * That rule died with the palette. There is nothing pink, neon or lit-sign
 * anywhere in the restaurant, so --color-neon-pink is gone (DIRECTION.md
 * constraint 4), and the accent that replaced it has one job that a
 * punctuation glyph is not. Colouring the dot with the interaction accent
 * would say "this is clickable" about a full stop.
 *
 * So the glyph inherits. On the warm ground it is ink, in the footer it is
 * sand, and it is never a colour decision of its own. The mark's own SVG keeps
 * its real pink — Law 3 forbids restyling it — so the wordmark and the typeset
 * name no longer match on that one glyph. That is the correct trade: the mark
 * is the mark, and the page is the page.
 *
 * The glyph stays in the text run rather than being drawn as a shape, so it
 * copies, reads aloud, and wraps exactly as it always did.
 *
 * ACCESSIBILITY, unchanged by the colour removal:
 *   the "." in KM.BBQ  — part of the restaurant's name, not decoration, so it
 *                        stays in the accessibility tree.
 *   the "·" separators — aria-hidden. They carry no information that the
 *                        spacing does not already carry.
 * Both now inherit a colour that already clears AA in its context, so the
 * measured-contrast note this file used to carry has nothing left to warn
 * about: there is no longer a glyph on the site set in a colour that cannot
 * reach 4.5:1 against its own ground.
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
    <span aria-hidden={isWordmarkDot ? undefined : "true"} className={className}>
      {char}
    </span>
  );
}
