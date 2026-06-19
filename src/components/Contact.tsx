"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const HOURS = [
  { day: "Monday – Thursday", time: "5:00 PM – 10:00 PM" },
  { day: "Friday – Saturday", time: "4:00 PM – 11:30 PM" },
  { day: "Sunday", time: "4:00 PM – 9:30 PM" },
];

export function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Wire up to a real form endpoint (Resend, Formspree, etc.)
    setSubmitted(true);
  }

  return (
    <section
      id="contact"
      className="bg-white py-28 px-6"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              Find Us
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="contact-heading"
              className="font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              {/* TODO: heading */}
              Come to the Table
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left — info */}
          <div className="space-y-12">
            {/* Hours */}
            <ScrollReveal>
              <div>
                <h3 className="font-serif text-2xl font-light text-foreground mb-5">
                  Hours
                </h3>
                <dl className="space-y-3">
                  {HOURS.map(({ day, time }) => (
                    <div
                      key={day}
                      className="flex items-start justify-between border-b border-neutral-100 pb-3 font-sans text-sm"
                    >
                      <dt className="text-foreground/70">{day}</dt>
                      <dd className="font-medium text-foreground">{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>

            {/* Address */}
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="font-serif text-2xl font-light text-foreground mb-4">
                  Location
                </h3>
                <address className="not-italic font-sans text-sm font-light leading-relaxed text-foreground/70">
                  {/* TODO: Replace with real address */}
                  123 Main Street, Suite 100
                  <br />
                  [City, State ZIP]
                  <br />
                  <a
                    href="tel:+10000000000"
                    className="mt-2 inline-block text-brand-orange hover:underline underline-offset-4"
                  >
                    {/* TODO: Replace with real phone */}
                    (000) 000-0000
                  </a>
                  <br />
                  <a
                    href="mailto:hello@kmbbq.com"
                    className="text-brand-orange hover:underline underline-offset-4"
                  >
                    {/* TODO: Replace with real email */}
                    hello@kmbbq.com
                  </a>
                </address>
              </div>
            </ScrollReveal>

            {/* Map placeholder */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                {/* TODO: Replace with Google Maps embed or Mapbox */}
                <p className="font-sans text-sm text-neutral-400">
                  TODO: Map embed
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — contact form */}
          <ScrollReveal direction="left" delay={0.1}>
            <div>
              <h3 className="font-serif text-2xl font-light text-foreground mb-7">
                Send a Message
              </h3>

              {submitted ? (
                <div className="rounded border border-brand-orange/30 bg-brand-orange/5 p-6 font-sans text-sm text-foreground/70">
                  {/* TODO: Customise confirmation copy */}
                  Thank you! We&apos;ll be in touch shortly.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                  aria-label="Contact form"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="font-sans text-xs font-medium tracking-wide text-foreground/60">
                        Name
                      </span>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, name: e.target.value }))
                        }
                        className="border border-neutral-200 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-blue"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="font-sans text-xs font-medium tracking-wide text-foreground/60">
                        Phone (optional)
                      </span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={formState.phone}
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, phone: e.target.value }))
                        }
                        className="border border-neutral-200 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-blue"
                        placeholder="(000) 000-0000"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-sans text-xs font-medium tracking-wide text-foreground/60">
                      Email
                    </span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, email: e.target.value }))
                      }
                      className="border border-neutral-200 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-blue"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-sans text-xs font-medium tracking-wide text-foreground/60">
                      Message
                    </span>
                    <textarea
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((s) => ({
                          ...s,
                          message: e.target.value,
                        }))
                      }
                      className="border border-neutral-200 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-blue resize-none"
                      placeholder="Reservations, catering inquiries, anything…"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-brand-blue py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-85"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
