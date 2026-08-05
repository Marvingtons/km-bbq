import {
  graph,
  restaurantNode,
  websiteNode,
  menuNode,
  breadcrumbNode,
  faqNode,
  assertClean,
} from "@/lib/schema";
import { FAQS } from "@/data/faq";

/* ===========================================================================
   THE PAGE GRAPHS.

   These are thin: every node is built in src/lib/schema.ts from the same
   records the page renders, so nothing here decides anything about the
   restaurant. What lives in this file is WHICH nodes a route emits and the
   single <script> that carries them.

   ONE `@graph` PER PAGE, not one <script> per node. Nodes reference each other
   by `@id` (the Menu points at the Restaurant, the Restaurant points back at
   the Menu), and a parser can only resolve those references inside one
   document. Three separate scripts describe three unlinked things.

   `assertClean` runs at RENDER TIME, which on these static routes is build
   time — so an empty string, a stray TODO or a relative URL fails the build
   rather than shipping to a crawler. See lib/schema.ts.
   =========================================================================== */

function JsonLd({ data }: { data: object }) {
  assertClean(data);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes nothing dangerous here — every value is a
      // build-time constant from our own data files, and `<` cannot appear.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The homepage: the restaurant itself, the site it belongs to, and the eight
 * questions the page visibly answers.
 */
export function RestaurantSchema() {
  return (
    <JsonLd data={graph(restaurantNode(), websiteNode(), faqNode(FAQS))} />
  );
}

/**
 * /menu: the full menu generated from data/menu.ts, the restaurant it belongs
 * to (so the two are one entity to a parser), and the trail back to home.
 */
export function MenuSchema({
  breadcrumbs,
}: {
  breadcrumbs: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={graph(menuNode(), restaurantNode(), breadcrumbNode(breadcrumbs))}
    />
  );
}

/** A trail on its own, for routes with nothing else to say. */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return <JsonLd data={graph(breadcrumbNode(items))} />;
}
