# Run With Nicole — Sanity Studio

Content editor for the Run With Nicole site. Deployed at https://runwithnicole.sanity.studio by the Netlify build.

```bash
npm run dev          # http://localhost:3333 (or `npm run studio` from the repo root)
npm run import-seed  # load starter content (home page + header/footer), skips existing docs
npm run deploy       # manual deploy (normally done by Netlify)
```

Needs `studio/.env`: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`. On Netlify, `../on-deploy.mjs` writes this file.

- `schemaTypes/pageType.js`: pages and their sections (Hero, Image With Text, Icon Boxes, Text Boxes, Pricing, Banner, Contact Form). Keep it in sync with `src/app/components/mainContent/component.js`.
- `schemaTypes/navigationType.js`: the **Header & Footer** singleton (id `navigation`).
- `components/BgColorSelector.jsx`: the section background swatches.
- `components/IconSelector.jsx`: the icon picker. It mirrors `src/app/components/svg/svgs.js`.

See `../CLAUDE.md` and `../README.md` for the full picture.
