# CLAUDE.md — Run With Nicole

One-page marketing site for Nicole, a running coach (Hermosa Beach, CA). Content lives in Sanity; the site is a static Next.js export on Netlify.

## Stack

- **Next.js 16, Pages Router, plain JS** (`.js` / `.cjs`, no TypeScript). React 19.
- **SCSS Modules** + `classnames`. Variables/mixins are auto-injected into every `.scss` file (see below).
- **Sanity** (Studio in `studio/`) — content is pulled into JSON **at build time**; nothing fetches Sanity in the browser.
- **Static export** (`output: "export"` when `NODE_ENV=production`) → `out/`, deployed to **Netlify**.
- **Netlify Forms** for the inquiry form.
- Fonts: **Open Sans** via `next/font/google` (variable font incl. the `wdth` axis).
- Node `22.13.1` (`.nvmrc`); `preinstall` enforces it. `postinstall` installs `studio/` deps.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | generate slugs + page data from Sanity, then `next dev` |
| `npm run build` | slugs → pageData → sitemap → `_redirects`/`robots.txt` → `next build` (static export) |
| `npm run studio` | Sanity Studio on http://localhost:3333 |
| `npm run lint` | `eslint src/` (flat config from `eslint-config-next/core-web-vitals`) |

## Data flow (Sanity → JSON → pages)

1. `src/app/utils/generateSlugs.cjs` → `public/static-slugs.json`
2. `src/app/utils/generatePageData.cjs` → `public/static-page-data.json` (`{ pages: { "/": {...} }, navigation: {...} }`)
3. `src/pages/[[...slug]].js` reads those files in `getStaticPaths`/`getStaticProps`, renders `Header` + `MainContent` + `Footer`.
4. `generateSitemap.cjs` → `public/sitemap.xml`; `generateNetlifyFiles.cjs` → `public/_redirects` + `public/robots.txt`.

All four outputs are **generated and git-ignored**.

- Shared Sanity config for the scripts: `src/app/utils/sanityBuildClient.cjs`. It **exits with a readable error** if a required env var is missing or still a `your-…` placeholder.
- Dev refresh: `src/proxy.js` (Next 16's name for middleware) calls `src/pages/api/dev-regenerate.js` on page reloads during `npm run dev` (3s cooldown), so Studio edits show up on refresh.
- GROQ lives in `generatePageData.cjs`. When adding a Sanity field that needs dereferencing (images, files), update `PAGE_QUERY`.
- On Netlify (`NETLIFY=true`) Sanity asset URLs are rewritten to `/sanity-images/*` and `/sanity-files/*`, which `public/_redirects` proxies to `cdn.sanity.io` (same-origin assets).

## Deploy (Netlify)

- The GitHub repo is connected to **one Netlify site**. It builds on every push to `main` and when content is published in Sanity (a Sanity webhook POSTs to a Netlify build hook).
- `netlify.toml` → `bash scripts/netlify-build.sh` → `node on-deploy.mjs` (writes `studio/.env`, because Sanity Studio only sees `SANITY_STUDIO_*` vars) → `npm run build` → `sanity deploy` (redeploys the Studio if `SANITY_AUTH_TOKEN` is set) → publish `out/`.
- Only **published** Sanity content is used (`perspective: "published"`). Drafts only appear on the live site after they are published.
- **Secrets never use `NEXT_PUBLIC_`** (unlike the older reference projects). `SANITY_API_READ_TOKEN` and `SANITY_AUTH_TOKEN` are only read in build scripts. `NEXT_PUBLIC_*` values are inlined into browser JS.
- The static export prints an API-route/proxy warning at build time. That's expected: they're dev-only.

Full env var table and deploy checklist: `README.md`.

## Project structure

```
src/
  pages/            [[...slug]].js  404.js  _app.js (fonts)  _document.js
                    api/dev-regenerate.js (dev only)
  proxy.js          dev-only data refresh
  app/components/<name>/component.js + styles.module.scss
  app/styles/       global-styles.scss  _variables.scss  _mixins.scss  variables/  mixins/
  app/utils/        build scripts (.cjs), getButtonTheme, getSectionClasses,
                    portableTextComponents, useMediaQuery
scripts/            check-node-version.js  netlify-build.sh
public/             __forms.html (Netlify form registration)  favicon.svg
studio/             sanity.config.js  sanity.cli.js  schemaTypes/  components/  actions/  seed/
```

Imports use aliases: `@components/*`, `@utils/*`, `@/*` (jsconfig + webpack alias in `next.config.js`). **Keep both the webpack aliases and `turbopack: {}`** in `next.config.js`.

## Component conventions

- One folder per component: `component.js` (default export + named export) and `styles.module.scss`, imported as `import * as styles from "./styles.module.scss"`.
- `PropTypes` on every component. **Use default parameter values, not `defaultProps`** — React 19 ignores `defaultProps` on function components.
- Components with hooks start with `"use client"` (harmless in the Pages Router; kept for consistency).
- Rich text: `<PortableText value={body} components={portableTextComponents} />` from `@portabletext/react`, renderers in `@utils/portableTextComponents.js`.
- ESLint runs React 19's strict hook rules: no synchronous `setState` in effects (use `useSyncExternalStore`/`useMediaQuery`), no manual memoization that the compiler can't preserve.

### Registered page components

Registry: `src/app/components/mainContent/component.js` (`renderComponent` switch). Schema: `studio/schemaTypes/pageType.js` (`COMPONENTS` list + fields hidden via `onlyFor(...)`).

| `pageComponent` | Component | Notes |
| --- | --- | --- |
| `videoHero` | `VideoHero` | Muted looping MP4 (desktop > 940px only, lazy-loaded), fallback image on mobile / reduced motion, navy gradient if nothing uploaded. No bg color option. |
| `imageWithText` | `ImageWithText` | `leftOrRight`, `imageFit` cover/contain (see below). Full-width text if no image. |
| `iconBoxes` | `IconBoxes` | Grid of icon cards (4 → 2 → 1 columns), optional "Step N" labels. |
| `pricing` | `Pricing` | 3 equal plan cards (badge, price, ✓/✗ features, optional price table — collapsible via `<details>`, footnote, CTA) + payments bar. |
| `contactForm` | `ContactForm` | Netlify Forms inquiry form (see below). |

Every section is wrapped in `<section id={containerId}>` — that id is what header links (`#pricing`) scroll to.

Adding a component: build it in `src/app/components/`, add a `case` in `mainContent`, add it to `COMPONENTS` + its fields in `pageType.js`, and add a row here.

## Styling

- `next.config.js` → `sassOptions.additionalData` injects `@use "variables" as *; @use "mixins" as *;` into every SCSS file. Don't `@use` them manually in components. A mixin file that uses another mixin must `@use` it itself (e.g. `_layout.scss` uses `_support` for `hover`).
- **rem** for type and spacing; px only for borders, radii, icon sizes.
- Breakpoints in `mixins/_media.scss`; `@include media($small, down)` = max-width 719px, `@include media($medium)` = min-width 1040px. Mobile nav below `$full-navigation` (900px).
- Global element styles (h1–h6, p, li, a) live in `global-styles.scss` and apply everywhere. Override inside a component module with enough specificity.

### Color tokens (`styles/variables/_color.scss` → CSS vars on `:root`)

| Token | Value | Use |
| --- | --- | --- |
| `--color-teal` | `#4AD5BB` | Brand accent, logo wordmark, CTA buttons on navy |
| `--color-teal-dark` | `#2FB39B` | Teal icons on light backgrounds |
| `--color-sky` | `#2FBCD0` | Brand accent, logo line, focus rings |
| `--color-navy` | `#266090` | Headings, navy sections, primary buttons |
| `--color-navy-dark` | `#1B4669` | Hovers, footer |
| `--color-logo-blue` | `#276BA4` | Logo runner only (intentionally ≠ navy) |
| `--color-white` / `--color-off-white` | `#FFF` / `#F3F8FA` | Backgrounds, cards |
| `--color-text` / `--color-text-muted` | `#1F2A33` / `#5B6873` | Body copy |
| `--color-border` | `#D5E1E8` | Borders |
| `--color-error` | `#C0392B` | Form errors |
| `--color-overlay-dark` | rgba | Overlays |

**No bare hex in component files** — use `var(--color-*)` or `color-alpha("--color-white", 0.15)` (Sass function in `_color.scss`).

### Fonts

`_app.js` loads `Open_Sans({ subsets: ["latin"], axes: ["wdth"] })` and exposes it as `--font-open-sans` (global `<style jsx>`). `--font-family` (in `_misc.scss`) uses it. **Main headings (h1–h3) use Open Sans Condensed** by narrowing the same variable font: `font-stretch: var(--font-stretch-condensed)` (75%). Any other "condensed" text (prices, slogan, 404 code) uses the same property.

### Section background colors

Sections take `componentBgColor: "white" | "navy"` (Sanity field with a swatch picker). Implementation:

- `@include section-bg;` in the section's root `.container` (mixin in `mixins/_layout.scss`) defines `.white` and `.navy`. Navy forces white text on headings/p/li and teal links (buttons excluded via `[data-button]`).
- `getSectionClasses(styles, props, extra)` (`@utils/getSectionClasses.js`) builds the class list incl. `removeTopPadding`/`removeBottomPadding` (paired with `@include section-padding-toggles;`).
- `getButtonTheme(bg)` → `white: "navy"`, `navy: "teal"`.
- Cards that stay light inside a navy section (pricing cards, form card) re-pin their text colors with `.navy .card …` rules to beat the mixin.

**To add a color:** add a block to `section-bg`, a swatch in `studio/components/BgColorSelector.jsx`, the value in `pageType.js` `componentBgColor.options.list`, a mapping in `getButtonTheme.js`, and a row here.

### imageWithText — cover vs contain

- **cover** (default): the image is rendered **outside** `.wrapper` as a sibling, `position: absolute`, 50% of the section, full-bleed to the viewport edge, `object-fit: cover`. The text is 50% wide inside the container. Below 1140px it stacks (image first, fixed height).
- **contain**: the image is rendered **inside** `.wrapper`, a flex row from 1000px up (image 45%), `object-fit: contain`, never cropped. Stacks below 1000px with `max-height: 400px`.
- The JSX places the image before/after `.wrapper` (cover) or inside it (contain) based on `imageFit` + `leftOrRight`.

## SVGs, icons, logo

- `src/app/components/svg/svgs.js` holds every inline SVG keyed by name; render with `<SVG name="…" />`. Unknown names render nothing; all SVGs get `aria-hidden` (put labels on the parent).
- Icons are 24×24 strokes using `currentColor` — color via CSS `color`, size via the parent (`svg { width; height }`).
- **Content icons are mirrored in `studio/components/IconSelector.jsx`** (the Studio picker). Add/rename icons in both files.
- **Logo** (`logo` key): original artwork 805×477, three parts with global classes — `.logoLine` (sky), `.logoRunner` (logo blue), `.logoText` (teal). Defaults live in `global-styles.scss`; placements override with `:global(.logoRunner)` (the footer makes the runner white on navy). Size it by setting the parent's height (`.logoSvg` is `height: 100%; width: auto`).
- `public/favicon.svg` is the runner mark only.

## Header links / scrolling

- Header links come from the Sanity navigation singleton (`#how-it-works`, `#about`, `#pricing`, `#contact`); the header renders them as plain `<a href="/#…">` so they also work from the 404 page. `displayAsButton` renders a pill (used for Contact).
- `html { scroll-behavior: smooth; scroll-padding-top: var(--header-height) }` keeps headings clear of the fixed header. `mainContent/clientWrapper.js` scrolls to the hash on first load.
- The mobile menu closes on link click, Escape, or outside click.
- `CustomLink`: internal page paths use `next/link`; hashes, `mailto:` and external URLs render `<a>`.

## Inquiry form (Netlify Forms)

- `public/__forms.html` registers the form `inquiry` at deploy time (Netlify can't see React-rendered forms). The React form POSTs urlencoded data to `/__forms.html` with `form-name=inquiry`.
- **Adding/renaming a field: update BOTH `contactForm/component.js` and `public/__forms.html`**, or Netlify silently drops it.
- Fields: `name`, `age`, `email`, `trainingForRace` (Yes/No), `raceDistance` + `raceDate` (only if Yes), `coachGoals`, `referralSource`, honeypot `bot-field`.
- In `npm run dev` submissions are logged to the console and faked as success (Netlify Forms only exists on Netlify).
- Email notifications → runwithnicole.la@gmail.com are configured in the Netlify UI (Netlify → Forms → Notifications).

## Sanity Studio

- `studio/sanity.config.js`: structure = **Pages** + **Header & Footer** singleton (fixed id `navigation`; "create new" hidden).
- Schema: `pageType.js` (sections via `mainContent[]`, fields shown per component with `onlyFor(...)`), `navigationType.js`.
- Seed: `studio/seed/home.ndjson` (home page with all copy + navigation). Import with `cd studio && npm run import-seed` (`--missing` = won't overwrite existing docs).
- Studio host: `runwithnicole` → https://runwithnicole.sanity.studio (deployed by the Netlify build when `SANITY_AUTH_TOKEN` is set).
- Studio only reads `SANITY_STUDIO_*` env vars from `studio/.env`.

## Gotchas

- `npm run dev`/`build` fail fast until `.env` placeholders are replaced — that's intentional (`sanityBuildClient.cjs`).
- Static export: no `getServerSideProps`, no runtime API routes, no `next.config` redirects. Redirects/headers go in `netlify.toml` or the generated `_redirects`.
- `getStaticPaths` uses `fallback: false` — a page only exists if its slug is in `static-slugs.json`.
- `static-page-data.json` is published in `out/` (like the reference projects) — never put secrets in page data.
