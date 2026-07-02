import { Reveal } from "./Reveal";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=KM.BBQ%2C+2216+S+El+Camino+Real+%23108-109%2C+Oceanside%2C+CA+92054";

const INFO = [
  {
    title: "Hours",
    body: (
      <>
        Sun–Thu 12:00 PM – 9:30 PM
        <br />
        Fri–Sat 12:00 PM – 10:00 PM
      </>
    ),
  },
  {
    title: "Location",
    body: (
      <>
        2216 S El Camino Real #108–109
        <br />
        Oceanside, CA 92054
      </>
    ),
  },
  {
    title: "Walk-in",
    body: (
      <>
        No reservations — just show up hungry.
        <br />
        Big group? Call ahead and we&rsquo;ll sort it.
      </>
    ),
  },
];

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-20 border-t-2 border-brand-ink bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-red-deep">
              Visit
            </p>
            <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-ink sm:text-6xl">
              Come
              <br />
              <span className="text-brand-pink-deep">hungry.</span>
            </h2>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-ink px-7 py-3.5 font-display text-base font-bold uppercase tracking-wide text-brand-cream shadow-[4px_4px_0_#f18b23] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#f18b23]"
              >
                Get directions
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href="tel:+17604331888"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-orange px-7 py-3.5 font-display text-base font-bold uppercase tracking-wide text-brand-ink shadow-[4px_4px_0_#211c18] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#211c18]"
              >
                (760) 433-1888
              </a>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {INFO.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="rounded-2xl border-2 border-brand-ink bg-brand-cream p-6 shadow-[5px_5px_0_#211c18]">
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-brand-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
