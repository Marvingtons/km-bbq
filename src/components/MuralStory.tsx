import Image from "next/image";
import { Reveal } from "./Reveal";

/**
 * The brand's hand-painted mural as a full-bleed story band. The PNG's own
 * background is the site cream (#FAEEE3), so it melts into the page and the
 * illustrated tiger, fire mascot, and folk doodles frame the copy. The mural's
 * center is empty by design — that's where the text sits.
 */
export function MuralStory() {
  return (
    <section
      id="about"
      className="relative scroll-mt-20 overflow-hidden bg-brand-cream"
    >
      <Image
        src="/images/korea-bbq-mural.png"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="relative mx-auto flex min-h-[30rem] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[36rem]">
        <Reveal>
          <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-red-deep">
            The KM way
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-ink sm:text-5xl">
            Meat, fire &amp;
            <br />
            good company
          </h2>
          <p className="mt-6 text-base leading-relaxed text-brand-ink/80 sm:text-lg">
            KM.BBQ is Oceanside&rsquo;s self-serve Korean barbecue joint. Pick
            your cuts from the line, drop them on live charcoal, and take your
            time — no servers hovering, no per-plate math. Just a loud, happy
            room that smells like grilled galbi.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
