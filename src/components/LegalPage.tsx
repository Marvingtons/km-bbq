import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Shared shell for the simple text pages (/privacy, /terms) so they match the
// site's cream/serif treatment without repeating the layout in each route.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="bg-cream px-6 pt-32 pb-24 sm:pt-36">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">
            Last updated {updated}
          </p>
          <div className="mt-10 space-y-8 font-sans text-sm font-light leading-relaxed text-foreground/75 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_p]:mt-3">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
