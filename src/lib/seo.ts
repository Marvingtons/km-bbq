import type { Metadata } from "next";
import { SITE_URL, BUSINESS } from "./restaurant";

const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "KM.BBQ, all-you-can-eat Korean BBQ in Oceanside, California",
};

/**
 * Per-route metadata builder. Keeps title, description, canonical, Open Graph,
 * and Twitter tags consistent across every page — pass the human copy, get the
 * full set back. `titleAbsolute` bypasses the "%s | KM.BBQ" template for pages
 * (home, menu) that want a hand-tuned, keyword-led title.
 */
export function pageMeta({
  title,
  description,
  path = "/",
  titleAbsolute = false,
}: {
  title: string;
  description: string;
  path?: string;
  titleAbsolute?: boolean;
}): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: titleAbsolute ? title : `${title} | ${BUSINESS.name}`,
      description,
      url,
      siteName: BUSINESS.name,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: titleAbsolute ? title : `${title} | ${BUSINESS.name}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
