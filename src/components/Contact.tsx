"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const HOURS = [
  { day: "Sunday – Thursday", time: "12:00 PM – 9:30 PM" },
  { day: "Friday – Saturday", time: "12:00 PM – 10:00 PM" },
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
                  2216 S El Camino Real #108 #109
                  <br />
                  Oceanside, CA 92054
                  <br />
                  <a
                    href="tel:+17604331888"
                    className="mt-2 inline-block text-brand-orange hover:underline underline-offset-4"
                  >
                    (760) 433-1888
                  </a>
                </address>

                {/* Socials */}
                <div className="mt-6 flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/kmkoreanbbq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="KM BBQ on Instagram"
                    className="text-foreground/60 transition-colors hover:text-brand-orange"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@kmkoreanbbq"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="KM BBQ on TikTok"
                    className="text-foreground/60 transition-colors hover:text-brand-orange"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-1.02-.09z" />
                    </svg>
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Map placeholder */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-video w-full overflow-hidden border border-neutral-200">
                <iframe
                  title="Map to KM BBQ Oceanside"
                  src="https://www.google.com/maps?q=2216+S+El+Camino+Real+%23108,+Oceanside,+CA+92054&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
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
