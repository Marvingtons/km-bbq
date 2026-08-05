import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/info";

/* ===========================================================================
   ROBOTS — AND THE AI CRAWLERS ARE NAMED ON PURPOSE.

   `User-agent: * / Allow: /` already permits every one of the agents listed
   below, so none of this changes what a compliant crawler may do today. What it
   changes is what happens the NEXT time someone edits this file: an explicit
   allow-list is a decision on the record, so a blanket `Disallow` added later
   cannot quietly take the AI assistants out with it.

   That matters more here than on most sites. A restaurant is exactly the kind
   of question people now ask an assistant rather than a search box — "all you
   can eat KBBQ Oceanside", "is KM BBQ open", "how much is KM BBQ" — and an
   assistant that cannot fetch this page answers from a third-party aggregator
   carrying whatever hours it scraped two years ago.

   The two Google agents do different jobs and both are listed:
     Googlebot        indexing and the blue links.
     Google-Extended  whether Gemini may use the page for grounding. Blocking it
                      does NOT remove the site from Search; allowing it is what
                      lets Gemini quote today's hours rather than a directory's.

   Applebot-Extended and CCBot are the same shape of decision for Siri and for
   Common Crawl, which is the corpus much of the open-model world trains on.
   =========================================================================== */

const AI_AND_SEARCH_AGENTS = [
  // OpenAI: the training crawler, the search index, and the live fetch a
  // ChatGPT user triggers by asking about you.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic: the crawler, the live user-triggered fetch, and the legacy name.
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity, which answers "near me" questions with citations.
  "PerplexityBot",
  // Google's AI grounding opt-in, separate from Googlebot.
  "Google-Extended",
  // Search proper.
  "Googlebot",
  "Bingbot",
  // Siri / Spotlight grounding, and the Common Crawl corpus.
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_AND_SEARCH_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
