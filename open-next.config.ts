import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Deliberately bare. Every route on this site is statically prerendered at build
// time and nothing calls revalidate(), so there is no incremental cache to
// configure — adding an R2 cache would mean an extra bucket, a
// WORKER_SELF_REFERENCE service binding, and nothing to put in it.
//
// If ISR or on-demand revalidation ever lands here, add the R2 incremental cache
// (`@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`).
// The docs specifically discourage the KV cache, which is eventually consistent.
export default defineCloudflareConfig();
