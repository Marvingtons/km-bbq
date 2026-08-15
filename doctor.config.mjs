// React Doctor configuration.
// https://react.doctor/docs/configuration/config-files
//
// Every suppression below was reviewed against the source. Each entry says why
// the finding is not a real defect — nothing here is a blanket "make it quiet".
export default {
  ignore: {
    // Files excluded from scanning entirely. These are build output and
    // standalone tooling, not application source.
    files: [
      // Build output. `.open-next/` is git-ignored but can linger on disk from
      // a previous build; scanning it produced false "weak cryptography" and
      // "unsafe JSON" hits against minified framework chunks we do not author.
      ".open-next/**",
      ".next/**",
      // Generated at build time by `npm run gen:images`; not hand-maintained.
      "src/lib/imageManifest.generated.ts",
      // Standalone dev / verification scripts: run by hand, never imported, so
      // dead-code analysis flags them as "unused files". They are tooling.
      "tools/**",
      "screenshot-menu.js",
      "verify-*.cjs",
      // This config file itself — loaded by React Doctor, imported by nothing.
      "doctor.config.mjs",
    ],
    // Per-path rule suppressions, each narrower than a blanket file ignore.
    overrides: [
      {
        // Deliberate CSS underline reveal: the hover bar must start fully
        // collapsed (scale-x-0) to be invisible at rest, then grow on hover.
        // `no-scale-from-zero` targets Framer Motion entrance animations that
        // "vanish into a point" — it does not apply to a static 1px CSS rule.
        files: ["src/components/Navbar.tsx"],
        rules: ["react-doctor/no-scale-from-zero"],
      },
      {
        // Intentional exports that nothing imports *yet*: a matched schema
        // component (BreadcrumbSchema, sibling of Restaurant/MenuSchema), a
        // public predicate (isLunchAt), and a cross-file invariant constant
        // (HERO_SCRUB) the layout math must agree with. Not dead code.
        files: [
          "src/components/RestaurantSchema.tsx",
          "src/data/info.ts",
          "src/lib/motion.ts",
        ],
        rules: ["deslop/unused-export"],
      },
    ],
  },
};
