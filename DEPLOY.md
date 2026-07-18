# Deploying KM.BBQ to Cloudflare

The site runs as a **Cloudflare Worker** (not Pages) via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). `next-on-pages`
is the older path and is not used here.

| | |
|---|---|
| Adapter | `@opennextjs/cloudflare` ^1.20.1 |
| Wrangler | ^4.112.0 |
| Next.js | 16.2.9 |
| Worker entry | `.open-next/worker.js` |
| Static assets | `.open-next/assets` |
| Config | [`wrangler.jsonc`](wrangler.jsonc), [`open-next.config.ts`](open-next.config.ts) |

---

## Commands

```bash
npm run build      # next build --webpack (plain Next build; prebuild regenerates the image manifest)
npm run preview    # adapter build + run the real Worker locally
npm run deploy     # adapter build + deploy and promote
npm run upload     # adapter build + upload a version WITHOUT promoting it
npm run cf-typegen # regenerate cloudflare-env.d.ts from wrangler.jsonc bindings
```

`opennextjs-cloudflare build` runs `next build` itself and then rewrites the
output into a Workers bundle. Never treat it as a substitute for one or the
other — run it, not `next build`, when you mean to produce a deployable artifact.

### Two build settings that are not optional

**`next build --webpack`.** Next 16 defaults to Turbopack. The adapter bundles
fine from a Turbopack build, but the Worker then fails at runtime with
`ChunkLoadError: Failed to load chunk server/chunks/[root-of-the-server]__*.js`
on every dynamic route — the emitted chunk filenames do not resolve through the
adapter's `requireChunk`. Every route 500s while static assets still 200, which
makes it look like a routing problem rather than a bundler one. Building with
webpack fixes it. The `build` script carries the flag so local and CI builds
cannot diverge.

**`output: "standalone"` in `next.config.ts`.** The adapter bundles out of
`.next/standalone`. Turbopack emits that directory implicitly; the webpack
builder does not, and the build dies with
`ENOENT: scandir '.next/standalone/.next'`. The two settings are a pair — do not
remove one without the other.

---

## First deploy (dashboard)

1. **Workers & Pages → Create → Workers → Connect to Git**, pick this repo.
2. Set the build configuration:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** `/`
   - There is **no "output directory" field** on Workers Builds. That is a Pages
     concept; here the paths come from `wrangler.jsonc`.
3. Confirm the Worker name matches `name` in `wrangler.jsonc`
   (`km-bbq-website`), or change it in both places.
4. Deploy, then attach the custom domain under **Settings → Domains & Routes**.

Non-production branches default to `npx wrangler versions upload`, which builds
a preview version without promoting it. That is usually what you want.

CLI alternative for a one-off: `npm run deploy`.

---

## Environment variables

**The site currently needs none.** This is worth stating plainly, because it is
easy to assume otherwise:

- There is **no `process.env` reference anywhere in `src/`**.
- There is **no Google Maps API key**. `ContactMap` renders a static image
  (`/images/contact-map.jpg`) with a plain "Get directions" link to
  google.com/maps. That was a deliberate choice and it needs no key, so there is
  nothing to set and nothing to fall back to. If a live embed is ever restored,
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` would need adding here and to the dashboard.
- Business details (address, hours, phone, socials, `SITE_URL`) are compile-time
  constants in [`src/lib/restaurant.ts`](src/lib/restaurant.ts), not env vars.

`.dev.vars` holds `NEXTJS_ENV=development` for local preview only. It is
gitignored and has no dashboard counterpart.

---

## Domain and `metadataBase`

`SITE_URL` in [`src/lib/restaurant.ts`](src/lib/restaurant.ts) is
**`https://kmbbq.com`**, hardcoded. It feeds `metadataBase`, the canonical URL,
OG/Twitter image URLs, `sitemap.xml`, `robots.txt`, and the JSON-LD `@id`.

> **Flag: confirm this domain before launch.** Nobody has verified that
> `kmbbq.com` is the domain being shipped to. If it changes, change that one
> constant — everything else derives from it. Deploying with the wrong value
> puts absolute URLs pointing at a domain you do not control into the sitemap
> and the structured data.

---

## Workers runtime audit

| Concern | Status |
|---|---|
| `node:fs` / `process.cwd()` | **Fixed.** See below. |
| `sharp` / image optimization | **Handled.** See "Images". |
| Hero video | **Fine.** Streams from R2 at an absolute URL, no local path. |
| Node middleware | Not used. |
| Persistent DB connections | None. |
| Worker size | **746 bytes gzipped** — the cap is 3 MiB free / 10 MiB paid. |
| Static assets | 102 files, 122 MB, largest 3.0 MB — under the 20,000-file and 25 MiB-per-file limits. |

### The `fs` fix

`src/app/menu/page.tsx` decided whether a dish photo exists with:

```ts
fs.existsSync(path.join(process.cwd(), "public", image))
```

That works on Node only because the page is prerendered on the build machine.
Workers has no filesystem and no meaningful `process.cwd()`, so had that check
ever run at request time it would have reported **every** photo missing and
rendered the entire menu as lettered placeholders — silently, with no error.

It now reads from `src/lib/imageManifest.generated.ts`, produced by
[`tools/gen-image-manifest.mjs`](tools/gen-image-manifest.mjs) and regenerated on
every `prebuild`. Same behaviour, and `node:fs` is out of the Worker graph.
Run `npm run gen:images` by hand after adding photos if you want the change
reflected without a full build.

---

## Images

**Chosen strategy: the Cloudflare Images binding**, declared in `wrangler.jsonc`:

```jsonc
"images": { "binding": "IMAGES" }
```

Next's own optimizer cannot run on Workers (it needs `sharp`). This binding
takes over the resizing behind `/_next/image`, so `next/image` keeps working
unchanged and `formats: ["image/avif", "image/webp"]` is still honoured.

Verified against the local Worker:

```
/images/bulgogi.png                        2,766,600 bytes  (raw PNG)
/_next/image?...&w=640  Accept: image/avif     41,425 bytes  (image/avif)
```

A 67× reduction, negotiated per request.

### Why not `unoptimized: true`

> **Flag: the dish photos have NOT been pre-converted.** `public/images` is
> **119 MB across 50 PNGs**, the largest 3.0 MB, with only 2 WebP files present.
> Switching to `unoptimized` today would ship those multi-megabyte PNGs to
> phones at full size — the menu page alone references 72 of them.

`unoptimized` is the cheaper end state and it does avoid the Cloudflare Images
per-request billing. To get there:

1. Convert `public/images/*.png` to WebP/AVIF at a sane max width (~1600px).
2. Update the `image:` paths in `src/app/menu/page.tsx` and
   `src/components/About.tsx`.
3. Set `images: { unoptimized: true }` in `next.config.ts` and drop the
   `images` binding from `wrangler.jsonc`.

Until that happens the binding is what keeps the site fast, so it stays.

---

## Post-deploy checklist

Against the **production domain**, not the `*.workers.dev` preview:

- [ ] `/` and `/menu` render, and menu photos are real images rather than
      lettered placeholders (this is the `fs` fix; if the menu is all
      placeholders, `imageManifest.generated.ts` is stale or missing).
- [ ] Hero video plays — it streams from `pub-364f647b29874b09922e1889f267c323.r2.dev`,
      so check the network tab, not just the poster frame.
- [ ] **Favicon**: the K badge shows in the tab. Hard-reload; browsers cache
      favicons aggressively and will keep serving the old one.
- [ ] `/favicon.ico`, `/favicon-16.png`, `/favicon-32.png`, `/icon-192.png`,
      `/icon-512.png`, `/icon-maskable-512.png`, `/apple-icon.png` all 200.
- [ ] `/manifest.webmanifest` resolves and its icon URLs 200.
- [ ] **OG image**: paste the URL into a card validator and confirm
      `https://<domain>/og.png` loads (this is what `metadataBase` governs).
- [ ] `/sitemap.xml` and `/robots.txt` resolve, and **every `<loc>` uses the
      production domain** — a stale `SITE_URL` shows up here first.
- [ ] View source on `/`: the JSON-LD `@id` and `url` use the production domain.
- [ ] `/privacy`, `/terms`, and a 404 all render.
- [ ] Spot-check that no page says "live charcoal" — the grills are gas **or**
      charcoal, and that claim was removed sitewide.
- [ ] Observability is on (`wrangler.jsonc`); check **Workers → Logs** for
      runtime errors after the first real traffic.
