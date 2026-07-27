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
      <main
        id="main-content"
        tabIndex={-1}
        className="grain bg-cream pt-32 pb-section focus:outline-none sm:pt-36"
      >
        <div className="grid-page">
        <article className="col-text">
          <h1 className="h2-scale">
            {title}
          </h1>
          <p className="eyebrow mt-3 text-foreground/40">
            Last updated {updated}
          </p>
          <div className="copy measure mt-10 space-y-8 [&_h2]:font-serif [&_h2]:text-lead [&_h2]:font-light [&_h2]:text-foreground [&_p]:mt-3">
            {children}
          </div>
        </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
