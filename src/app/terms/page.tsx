import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PHONE, ADDRESS } from "@/lib/restaurant";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms of Service",
  description:
    "The terms for using the KM.BBQ website, all-you-can-eat Korean BBQ in Oceanside, CA.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 1, 2026">
      <section>
        <h2>Acceptance of Terms</h2>
        <p>
          By using the KM.BBQ website you agree to these terms. If you do not
          agree, please do not use the site, but do come eat with us anyway.
        </p>
      </section>
      <section>
        <h2>Menu &amp; Pricing</h2>
        <p>
          Menu items, prices, and hours shown on this site are for
          informational purposes and may change without notice. Availability
          of specific cuts and dishes can vary by day. The menu and prices
          posted in the restaurant are authoritative.
        </p>
      </section>
      <section>
        <h2>All-You-Can-Eat Policy</h2>
        <p>
          Our all-you-can-eat service is per person, for dine-in only, and may
          not be shared. To help us keep food waste (and prices) down, we may
          apply a charge for excessive uneaten food. Some signature items may
          have per-person limits, noted on the menu.
        </p>
      </section>
      <section>
        <h2>Intellectual Property</h2>
        <p>
          All content on this site, including text, photography, logos, and
          design, is the property of KM.BBQ or its licensors and may not be
          reproduced without permission.
        </p>
      </section>
      <section>
        <h2>Disclaimer &amp; Limitation of Liability</h2>
        <p>
          This site is provided &ldquo;as is&rdquo; without warranties of any
          kind. To the fullest extent permitted by law, KM.BBQ is not liable
          for any damages arising from your use of the site. Consuming raw or
          undercooked meats or seafood may increase your risk of foodborne
          illness, so please grill thoroughly.
        </p>
      </section>
      <section>
        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of the State of California. Any
          disputes shall be resolved in the courts of San Diego County.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          For questions, call {PHONE.display} or visit us at {ADDRESS.street},{" "}
          {ADDRESS.region}.
        </p>
      </section>
    </LegalPage>
  );
}
