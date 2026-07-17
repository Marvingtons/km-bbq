import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PHONE, ADDRESS } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Privacy Policy — KM.BBQ",
  description:
    "How KM.BBQ in Oceanside, CA handles information collected through our website.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 1, 2026">
      <section>
        <h2>Overview</h2>
        <p>
          KM.BBQ (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates the website
          kmbbq.vercel.app. This policy describes what information is handled
          when you visit our site. We are a restaurant, not a data business —
          we collect as little as possible.
        </p>
      </section>
      <section>
        <h2>Information We Collect</h2>
        <p>
          Our website does not have accounts, forms, or ordering. We do not ask
          for or store your name, email address, or payment information. Like
          most websites, our hosting provider may log basic technical data
          (such as IP address, browser type, and pages visited) for security
          and performance monitoring.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          We do not set advertising or tracking cookies. Your browser&rsquo;s
          session storage may be used only to remember that the site&rsquo;s
          intro animation has already played.
        </p>
      </section>
      <section>
        <h2>Third-Party Services</h2>
        <p>
          Our contact section embeds a Google Map; loading it is subject to
          Google&rsquo;s own privacy policy. Links to Instagram, TikTok, and
          Yelp take you to those platforms, which have their own policies.
        </p>
      </section>
      <section>
        <h2>Children&rsquo;s Privacy</h2>
        <p>
          Our website is a general-audience site and does not knowingly collect
          personal information from children under 13.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Call us at {PHONE.display} or visit us at{" "}
          {ADDRESS.street}, {ADDRESS.region}.
        </p>
      </section>
    </LegalPage>
  );
}
