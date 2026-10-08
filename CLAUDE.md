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
- GROQ lives in `generatePageData.cjs`. Images are projected as `{ alt, crop, hotspot, asset->{ url, width, height } }`. When adding a Sanity field that needs dereferencing (images, files), update `PAGE_QUERY`.
- **SEO asset filenames:** `addVanityFilenames()` in `generatePageData.cjs` appends each asset's slugified `originalFilename` to its URL (Sanity "vanity filenames": `…/<id>-800x1000.jpg/coach-nicole-running-marathon.jpg`; params like `?w=`, `?rect=`, `?dl=` still work, and `?dl=` downloads use the vanity name). Rename files in the Studio media library to change them. Asset docs also carry `title` / `altText` / `description`; the `<img alt>` on the site comes from the image field's own `alt` on each section.
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
                    portableTextComponents, getSanityRect
scripts/            check-node-version.js  netlify-build.sh
public/             __forms.html (Netlify form registration)  favicon.svg
studio/             sanity.config.js  sanity.cli.js  schemaTypes/  components/  actions/  seed/
```

Imports use aliases: `@components/*`, `@utils/*`, `@/*` (jsconfig + webpack alias in `next.config.js`). **Keep both the webpack aliases and `turbopack: {}`** in `next.config.js`.

## Component conventions

- One folder per component: `component.js` (default export + named export) and `styles.module.scss`, imported as `import * as styles from "./styles.module.scss"`.
- `PropTypes` on every component. **Use default parameter values, not `defaultProps`** — React 19 ignores `defaultProps` on function components.
- Components with hooks start with `"use client"` (harmless in the Pages Router; kept for consistency).
- **Buttons:** always use `@components/button/component.js` — never hand-style a link as a button — so font, weight, size and height stay identical site-wide (all content CTAs use the default `medium` size; `line-height` is explicit so `<a>` and `<button>` match). The header's Contact button is the same component, always `theme="teal"`, with header-only tweaks in `.nav .headerButton`: 5px × 20px padding on desktop; in the mobile menu full width up to 16rem with 10px × 28px padding, centered; hover comes from the Button teal theme (`--color-teal-light`). Extra props such as `aria-current` pass through.
- Rich text: `<PortableText value={body} components={portableTextComponents} />` from `@portabletext/react`, renderers in `@utils/portableTextComponents.js`.
- ESLint runs React 19's strict hook rules: no synchronous `setState` in effects (use `useSyncExternalStore` for browser state), no manual memoization that the compiler can't preserve.

### Registered page components

Registry: `src/app/components/mainContent/component.js` (`renderComponent` switch). Schema: `studio/schemaTypes/pageType.js` (`COMPONENTS` list + fields hidden via `onlyFor(...)`).

| `pageComponent` | Component | Notes |
| --- | --- | --- |
| `hero` | `Hero` | Personal-blog intro: round profile photo (teal → sky gradient ring) left of the text + button; stacks centered on phones. Uses `componentImage` — its Sanity **crop** becomes a `rect=` URL param (`@utils/getSanityRect.js` → `CustomImage rect`) and its **hotspot** sets `object-position` inside the crop. Optional `backgroundImage` (cover + semi-transparent navy → sky → teal gradient, darkened by a `--color-navy-black` layer for text contrast) overrides the bg color, forces light text, and makes the transparent header use its dark theme. |
| `imageWithText` | `ImageWithText` | `leftOrRight`, `imageFit` cover/contain (see below). No image → text spans the full content width, left-aligned. |
| `iconBoxes` | `IconBoxes` | Grid of icon cards (4 → 2 → 1 columns), optional "Step N" labels. Square top corners + 8px teal → sky gradient bar (`::before`); white icons on a teal → sky gradient circle. |
| `textBoxes` | `TextBoxes` | Title + rich-text boxes, 2 per row (1 on phones), plain dashed outline. Field: `textBoxItems[]`. "Remove top padding" leaves a small 2.5rem gap (not 0) so boxes can sit under a text section. |
| `pricing` | `Pricing` | Intro text (heading + payment terms), one section button (`componentButtonLabel/Link`, e.g. Get Started → #contact), then 3 equal plan cards (title, price, ✓/✗ features, optional price table — collapsible via `<details>`, footnote). Cards have square top corners and an 8px navy-dark → logo-blue gradient bar (`::before`), no shadow. |
| `ctaBanner` | `CtaBanner` | Full-width callout band, **always teal** (the Studio hides Background color for banners and the component ignores `componentBgColor`; no bg image) with a diagonal `--color-teal-bright` → `--color-teal-soft` gradient (135deg, 0% → 60%). Rich text left + one navy button right; slimmer padding (3.5rem); stacks centered on phones. Decorative CSS "target" behind the button (`.target`, 35% opacity: outer ring, `::before` middle ring at inset 12% with a radial glow, `::after` solid bullseye at inset 34%; 35rem / 45px lines on every screen size; `--color-teal-light` at different opacities via `--target-*` vars; stacking rings z 0 < text z 2 < button z 3). Optional `downloadFile` (Sanity file): the button downloads it via the `download` attribute — no `?dl=` query string, which SEO checkers flag as a dynamic parameter; works because Netlify serves it same-origin (e.g. the waiver PDF); otherwise uses `componentButtonLink`; neither → no button. |
| `contactForm` | `ContactForm` | Intro text above a full-width Netlify Forms inquiry form (see below). Form card: square top corners + teal → sky gradient bar; white on off-white/navy sections. |

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
| `--color-teal-light` | `#99FDEB` | Hover for all teal buttons; banner target rings |
| `--color-teal-bright` / `--color-teal-soft` | `#57EED2` / `#75DBC8` | Banner background gradient |
| `--color-sky` | `#2FBCD0` | Brand accent, logo line, focus rings, **h3 on light backgrounds** |
| `--color-navy` | `#266090` | h1/h2, navy sections, primary buttons |
| `--color-navy-dark` | `#1B4669` | Hovers, footer |
| `--color-navy-black` | `#0B1C2C` | Darkening overlays (hero background image) |
| `--color-logo-blue` | `#276BA4` | Logo runner only (intentionally ≠ navy) |
| `--color-white` / `--color-off-white` | `#FFF` / `#F3F8FA` | Backgrounds, cards |
| `--color-text` / `--color-text-muted` | `#1F2A33` / `#5B6873` | Body copy |
| `--color-border` | `#D5E1E8` | Borders |
| `--color-error` | `#C0392B` | Form errors |
| `--color-overlay-dark` | rgba | Overlays |

**No bare hex in component files** — use `var(--color-*)` or `color-alpha("--color-white", 0.15)` (Sass function in `_color.scss`).

### Fonts

`_app.js` loads `Open_Sans({ subsets: ["latin"], axes: ["wdth"] })` and exposes it as `--font-open-sans` (global `<style jsx>`). `--font-family` (in `_misc.scss`) uses it. **Main headings (h1–h3) use Open Sans Condensed** by narrowing the same variable font: `font-stretch: var(--font-stretch-condensed)` (75%). Any other "condensed" text (prices, 404 code) uses the same property.

### Section background colors

Sections take `componentBgColor: "white" | "offWhite" | "teal" | "navy"` (Sanity field with a swatch picker). Implementation:

- `@include section-bg;` in the section's root `.container` (mixin in `mixins/_layout.scss`) defines `.white`, `.offWhite`, `.teal` and `.navy`. Teal makes headings/text/links dark navy (white is too low-contrast on teal); inline links hover from navy-dark to `--color-navy`. Navy forces white text on headings/p/li and teal links (buttons excluded via `[data-button]`).
- `getSectionClasses(styles, props, extra)` (`@utils/getSectionClasses.js`) builds the class list incl. `removeTopPadding`/`removeBottomPadding` (paired with `@include section-padding-toggles;`).
- `getButtonTheme(bg)` → `white: "navy"`, `offWhite: "navy"`, `teal: "navy"`, `navy: "teal"`.
- Cards that default to off-white (icon boxes, form card) switch to white on `offWhite` sections (`.offWhite .box`, `.offWhite .formCard`) so they don't disappear.
- Cards that stay light inside a navy section (pricing cards, form card) re-pin their text colors with `.navy .card …` rules to beat the mixin.

**To add a color:** add a block to `section-bg`, a swatch in `studio/components/BgColorSelector.jsx`, the value in `pageType.js` `componentBgColor.options.list`, a mapping in `getButtonTheme.js`, and a row here.

### imageWithText — cover / contain / contain + offset block

- **cover** (default): the image is rendered **outside** `.wrapper` as a sibling, `position: absolute`, 50% of the section, full-bleed to the viewport edge, `object-fit: cover`. The text is 50% wide inside the container. Below 1140px it stacks (image first, fixed height).
- **contain**: the image is rendered **inside** `.wrapper`, a flex row from 1000px up (image 45%), `object-fit: contain`, never cropped. Stacks below 1000px with `max-height: 400px`.
- **containOffset**: contain layout + a teal → sky gradient block offset behind the image (1.5rem down and toward the outer edge; 1rem on phones). The image is wrapped in `.offsetFrame` (`width: fit-content`, `isolation: isolate`) so its `::before` (`z-index: -1`) matches the image's real edges. `.componentImage` gets padding on the offset sides so the block never overflows.
- The JSX places the image before/after `.wrapper` (cover) or inside it (contain modes) based on `imageFit` + `leftOrRight`.
- The image's Sanity **crop** is applied via `rect=` (`getSanityRect`), so editors can trim images in the Studio.
- No image → the text spans the full content width.

## SVGs, icons, logo

- `src/app/components/svg/svgs.js` holds every inline SVG keyed by name; render with `<SVG name="…" />`. Unknown names render nothing; all SVGs get `aria-hidden` (put labels on the parent).
- Icons are 24×24 strokes using `currentColor` — color via CSS `color`, size via the parent (`svg { width; height }`).
- **Content icons are mirrored in `studio/components/IconSelector.jsx`** (the Studio picker). Add/rename icons in both files.
- **Logo** (`logo` key): original artwork 805×477, three parts with global classes — `.logoLine` (sky), `.logoRunner` (logo blue), `.logoText` (teal). Defaults live in `global-styles.scss`; placements override with `:global(.logoRunner)` (the footer makes the runner white on navy). Size it by setting the parent's height (`.logoSvg` is `height: 100%; width: auto`).
- **Logo hover:** the "Run With Nicole" text (`.logoText`) and underline (`.logoLine`) turn **navy** on a light header (white/off-white/solid) and **white** on the dark transparent header (`.transparentDark`) and in the navy footer. All three parts have a `fill` transition.
- `public/favicon.svg` is the runner mark only.

## Header links / scrolling

- Header links come from the Sanity navigation singleton (`#how-it-works`, `#about`, `#pricing`, `#contact`); the header renders them as plain `<a href="/#…">` so they also work from the 404 page. `displayAsButton` renders a pill (used for Contact).
- `html { scroll-behavior: smooth; scroll-padding-top: var(--header-height) }` keeps headings clear of the fixed header. `mainContent/clientWrapper.js` scrolls to the hash on first load.
- **Mobile menu** (below `$full-navigation`, 900px): links and the Contact button are centered; no shadow. A dark overlay (`.overlay`, `--color-navy-black` at 60%, a sibling rendered before `<header>` at z-index 99) covers the page behind it — tapping it closes the menu, as do link clicks, Escape and outside clicks. The header is solid white while the menu is open.
- **Transparent header** (content pages): `[[...slug]].js` reads the first section — `componentBgColor === "navy"` or a hero `backgroundImage` → `transparentTheme="dark"`, otherwise `"light"` — and adds `has-transparent-header` to `<main>`. That class pulls the first section up under the fixed header (`margin-top: -var(--header-height)`) and sets `--section-offset-top`, which the `section-padding` / `section-padding-toggles` mixins add to the top padding. While at the top (not `scrolled`, menu closed) the header has `.transparent` (no bg/shadow), plus `.transparentDark` for light links, a white logo runner and a white hamburger. The 404 page passes no theme → always solid. Any new section padding should use the mixins (or add `var(--section-offset-top, 0px)`) so it works as the first section.
- **Scroll behavior** (`header/component.js`, one rAF-throttled scroll listener):
  - **Desktop only:** past 80px (`COMPACT_AFTER`) the header gets `.compact`: height 88 → 72px and logo 68 → 52px. `--header-height`/body padding stay at the full size, so nothing jumps. Below `$full-navigation` the header is always the small size (64px, 44px logo; `--header-height: 4rem`) and never changes on scroll.
  - **Active link:** the section whose top has passed a line 35% down the viewport (below the header) is active; at the page bottom the last section wins. The active link gets `.active` + `aria-current="location"`: text links show a teal → sky underline that scales in from the left (`.label::after`, also shown on hover). The Contact button is always teal and has no active style.
  - Clicking a link sets it active immediately and locks scroll-based updates for 1.2s (`CLICK_LOCK_MS`) so the underline doesn't flicker through the sections passed during smooth scrolling.
- `CustomLink`: internal page paths use `next/link`; hashes, `mailto:` and external URLs render `<a>`.

## Inquiry form (Netlify Forms)

- `public/__forms.html` registers the form `inquiry` at deploy time (Netlify can't see React-rendered forms). The React form POSTs urlencoded data to `/__forms.html` with `form-name=inquiry`.
- **Adding/renaming a field: update BOTH `contactForm/component.js` and `public/__forms.html`**, or Netlify silently drops it.
- Layout (2-column rows, stacked on phones): **1** `name` (Full name) + `email` · **2** `age` + `trainingForRace` (Yes/No) · (if Yes) `raceDistance` + `raceDate` · **3** `coachGoals` · **4** `referralSource`. Plus honeypot `bot-field`. `validate()` checks in the same order so the first error gets focus.
- **Email subject:** the React form sends a `subject` field ("<Full name> - Run With Nicole New Coaching Inquiry"), which Netlify uses as the notification subject (replacing the default "[Netlify] …" subject; it also overrides any subject set in the Netlify UI). `subject` is declared in `__forms.html` too. Netlify's UI subject variables (`%{formName}` etc.) can't include form answers, which is why it's built in code.
- In `npm run dev` submissions are logged to the console and faked as success (Netlify Forms only exists on Netlify).
- Email notifications → runwithnicole.la@gmail.com are configured in the Netlify UI (Netlify → Forms → Notifications).

## Sanity Studio

- `studio/sanity.config.js`: structure = **Pages** + **Header & Footer** singleton (fixed id `navigation`; "create new" hidden).
- **Releases and scheduling** are turned off in `sanity.config.js` (`releases`, `scheduledDrafts`, `scheduledPublishing` → `{enabled: false}`) — no Releases / Scheduled drafts tabs; editors just edit and publish.
- **Deploy tab** (`sanity-plugin-netlify`, `netlifyTool()`): lets editors trigger a Netlify rebuild and watch its status. Configured once inside the tool (site name, Netlify Project ID, build hook URL, personal access token) — stored in the dataset as `netlify.*` documents, which are private (dotted IDs aren't publicly readable). Nothing is configured in code.
- Schema: `pageType.js` (sections via `mainContent[]`, fields shown per component with `onlyFor(...)`), `navigationType.js`.
- Seed: `studio/seed/home.ndjson` (home page with all copy + navigation). Import with `cd studio && npm run import-seed` (`--missing` = won't overwrite existing docs).
- Studio host: `runwithnicole` → https://runwithnicole.sanity.studio (deployed by the Netlify build when `SANITY_AUTH_TOKEN` is set).
- Studio only reads `SANITY_STUDIO_*` env vars from `studio/.env`.

## SEO

- **Meta:** `<title>` / description / canonical / Open Graph come from each page's Sanity SEO fields (`mainContent/component.js` `<Head>`), falling back to `src/app/utils/defaultSEO.cjs`. Keep descriptions ≤ ~155 characters. No default share image yet — set **SEO → Share image** in Sanity (1200×630).
- **Structured data:** `src/app/utils/structuredData.js` builds JSON-LD for the home page (rendered in `[[...slug]].js`): `WebSite`, a `ProfessionalService` (no street address — `areaServed` lists Hermosa/Manhattan/Redondo Beach, South Bay, LA & Orange County; email from the footer field; offers parsed from the Pricing plans — two-column price tables become one offer per row, "From $X" → `minPrice`, "/ month" → `UnitPriceSpecification`) and the coach `Person` (RRCA credential; South Bay Runners Club as a `SportsOrganization` — not `SportsClub`, which is a LocalBusiness subtype Google would list as a second business). Facts not in Sanity live in its `BUSINESS` constant — keep them in sync with the copy. Validate with Google's Rich Results Test after edits.
- **Images:** `CustomImage` renders `width`/`height` attributes (the crop's size when `rect` is set, else the asset's) so the browser reserves space (no layout shift). Pass `width`/`height` from the asset metadata when adding new image usages. Alt text comes from each image field's `alt` (hero background included); decorative-only images should still get alt text in Sanity.
- **Subtitles:** any `h2` directly after an `h1` (e.g. the hero's "Your Hermosa Beach Running Coach") is a lead-in subtitle — global `h1 + h2` rule in `global-styles.scss`: 1.875rem / 2.25rem, `margin-top: -0.75rem`, decorative "• •" before and after (`content: … / ""` so screen readers skip them); 1.5rem on phones, no dots below 480px. The hero only sets its color: teal on navy, `--color-teal-light` over a background image, navy on light backgrounds.
- **Icons:** `public/favicon.svg` (runner mark) + PNGs rendered from it: `favicon-32.png`, `favicon-48.png` (transparent), `apple-touch-icon.png` (180, white bg), `icon-192.png` / `icon-512.png` (white bg, used by `site.webmanifest` and as the JSON-LD logo). Linked in `_document.js`. If the logo changes, re-render them (headless Chrome screenshot of the SVG at each size works).
- **Inline links** to RRCA, South Bay Runners Club and the B.A.A. (Boston/BQ) live in the Sanity rich text. Links inside paragraphs are bold site-wide (`p a:not([data-button])` in `global-styles.scss`).
- **Anchor texts:** every link needs real text (SEO checkers ignore `aria-label`) and texts shouldn't repeat. The logo links carry visually hidden text — "Run With Nicole – Home" (header) vs "Run With Nicole – Back to top" (footer). In rich text, don't reuse the footer's link texts (e.g. the Paperwork banner links "Email your signed form", not the address). Avoid generic CTA labels ("Click here", "Learn more").
- **Social:** Header & Footer → **Instagram URL** (`navigation.instagramUrl`) renders as icon + handle (derived from the URL, e.g. "@run.with.nicole.la") under the email in the footer, styled like the email link and is added to the business JSON-LD as `sameAs`. Add new social fields the same way (schema → `NAVIGATION_QUERY` → `Footer` props → `sameAs`).

## Performance

- **Inlined CSS:** `scripts/inline-css.cjs` runs after `next build` (part of `npm run build`) and replaces each page's `<link rel="stylesheet">` (+ its preload) with an inline `<style>`, rewriting relative `url(../media/…)` font paths to absolute. Removes render-blocking requests (~10 KB gzipped CSS for this one-page site). If CSS grows a lot, revisit.
- **Images:** pass accurate `sizes`/`widths` to `CustomImage` (imageWithText computes contain-mode `sizes` from the aspect ratio because portrait images are height-capped); priority (above-the-fold) images skip the blur placeholder; the hero background uses `quality={40}` (it's under a dark overlay). Always pass `width`/`height` so space is reserved.
- **No shrink-to-fit around unloaded images:** a `width: fit-content` / `width: auto` image collapses to 0 until it loads → layout shift. The offset-block frame is sized explicitly: `width: min(100%, var(--contain-max-h) × var(--img-aspect))` with `--img-aspect` set inline.
- **Fonts:** `next/font` Open Sans with `display: "optional"` (preloaded; no late swap → no reflow of the condensed headings).
- **Links:** `next/link` uses `prefetch={false}` (logo, CustomLink) — on a one-page site prefetching `/` data is a wasted request.
- **Netlify:** turn off the Netlify Drawer/toolbar on production — it injects ~500 ms of JS (shows up as `netlify-hud.js` / `scripts/hud` in Lighthouse).
- Lighthouse locally: `npx lighthouse http://localhost:4173` against `out/` served by any static server (note: Python's http.server doesn't compress, so load metrics look worse than on Netlify).

## Accessibility

Audited with axe-core (WCAG 2.1/2.2 AA + best practices) at desktop, phone, and with the mobile menu open: 0 violations. Things to keep in mind:

- **Contrast over images:** axe can't check text over photos — the hero's background-image overlay (35% `--color-navy-black` over the navy → sky gradient) was measured pixel-by-pixel to keep white text ≥ 4.5:1 (30% was the minimum). Re-check if the overlay is lightened or a much brighter photo is used.
- **Translucent cards on navy** (icon boxes): text uses ≥ 92% white (`color-alpha("--color-white", 0.92)`) — 85% / 70% failed 4.5:1.
- **Focus:** never remove outlines. Global `:focus-visible` ring (3px, offset 3px) in `--focus-ring`, default navy; dark contexts set it to white (`.navy` via the section-bg mixin, `.transparentDark` header, footer). Form fields keep their own ring. `reset-button` no longer strips `outline`.
- **Skip link:** "Skip to content" (`.skip-link` in `global-styles.scss`) is the first focusable element on every page and jumps to `<main id="main-content" tabIndex={-1}>`.
- **Forms:** labels on every field, `aria-required` on required inputs + `role="radiogroup" aria-required` on the Yes/No fieldset, errors linked with `aria-describedby`, submit error `role="alert"`, success `role="status"`.
- **Links:** external rich-text links open in a new tab and include a visually hidden "(opens in a new tab)"; the header's active link has `aria-current="location"`; all SVGs are `aria-hidden` with labels on their links/buttons.
- **Motion:** smooth scrolling is turned off under `prefers-reduced-motion`.

## Gotchas

- `npm run dev`/`build` fail fast until `.env` placeholders are replaced — that's intentional (`sanityBuildClient.cjs`).
- Static export: no `getServerSideProps`, no runtime API routes, no `next.config` redirects. Redirects/headers go in `netlify.toml` or the generated `_redirects`.
- `getStaticPaths` uses `fallback: false` — a page only exists if its slug is in `static-slugs.json`.
- `static-page-data.json` is published in `out/` (like the reference projects) — never put secrets in page data.
