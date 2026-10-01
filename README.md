# Run With Nicole

One-page website for **Run With Nicole** — running coaching by Nicole, RRCA Level 1 Certified Coach in Hermosa Beach, CA.

- **Site:** Next.js 16 (static export) → Netlify
- **Content:** Sanity Studio (`studio/`) → https://runwithnicole.sanity.studio
- **Inquiry form:** Netlify Forms → email to runwithnicole.la@gmail.com

Sections: Hero (profile photo) · About Coach Nicole · How it Works (+ question boxes) · Process steps · Pricing · Paperwork · Inquiry Form. Header links scroll to each section.

> Working with Claude Code? See [CLAUDE.md](./CLAUDE.md) for architecture and conventions.

---

## Local development

Requires **Node 22.13.1** (`nvm use`).

```bash
npm install          # also installs studio/ dependencies
# fill in .env and studio/.env (see "Environment variables" below)
npm run dev          # site → http://localhost:3000
npm run studio       # Sanity Studio → http://localhost:3333
```

`npm run dev` pulls content from Sanity into `public/static-*.json` before starting, and re-pulls on every page reload. Edit in the Studio, publish, and refresh the browser.

Other scripts:

| Command | |
| --- | --- |
| `npm run build` | Production static export into `out/` |
| `npm run lint` | ESLint |
| `npm run generate:pageData` | Re-pull content only |

> `.env` ships with placeholder values (`your-…`). Until you replace them, `npm run dev` and `npm run build` stop with a message naming the missing variable. `npm install` and `npm run lint` work without them.

---

## Environment variables

`.env` (root) and `studio/.env` hold local values. Both are git-ignored. `.env.example` is committed as the reference. On Netlify, set them under **Site configuration → Environment variables**.

| Variable | Local `.env` | Netlify | Value / where to get it |
| --- | :-: | :-: | --- |
| `NEXT_PUBLIC_STUDIO_PROJECT_ID` | ✓ | ✓ | sanity.io/manage → project → **Project ID** |
| `NEXT_PUBLIC_SANITY_DATASET` | ✓ | ✓ | `production` |
| `SANITY_API_READ_TOKEN` | ✓ | ✓ | sanity.io/manage → API → Tokens → **Viewer** |
| `NEXT_PUBLIC_SITE_URL` | ✓ | ✓ | `http://localhost:3000` locally. On Netlify: the site URL / custom domain (canonical links, sitemap) |
| `SANITY_AUTH_TOKEN` | – | ✓ | sanity.io/manage → API → Tokens → **Deploy Studio** (the Netlify build redeploys the Studio) |

`studio/.env` (local only; on Netlify it's written by `on-deploy.mjs`):

```
SANITY_STUDIO_PROJECT_ID=<same project id>
SANITY_STUDIO_DATASET=production
```

You don't need to set `NETLIFY` (Netlify sets it) or a Node version (it comes from `.nvmrc`).

---

## Deploying (first-time setup)

### 1. Sanity

1. Create a project at [sanity.io/manage](https://sanity.io/manage) with a `production` dataset. Put the project ID in `.env` and `studio/.env`.
2. **API → CORS origins:** add `http://localhost:3333` and `https://runwithnicole.sanity.studio` (allow credentials).
3. **API → Tokens:** create a **Viewer** token and a **Deploy Studio** token (see the table above).
4. Load the starter content (all site copy + header/footer). `sanity login` is only needed the first time:
   ```bash
   cd studio && npx sanity login && npm run import-seed
   ```
5. `npm run dev`. The full site should render.

### 2. GitHub

Create a repo and push `main`.

### 3. Netlify

1. **Add new site → Import from Git** and pick the repo. The build settings come from `netlify.toml`, so leave them as they are.
2. Add the env vars from the **Netlify** column above, then trigger a deploy.
3. Every push to `main` now rebuilds the site automatically.

### 4. Rebuild when content is published

1. Netlify → **Site configuration → Build & deploy → Build hooks** → add a hook (e.g. "Sanity publish") and copy its URL.
2. sanity.io/manage → **API → Webhooks → Create webhook**:
   - **URL:** the build hook URL
   - **Trigger on:** Create, Update, Delete
   - **Filter:** `!(_id in path("drafts.**"))` (published changes only)
   - **HTTP method:** POST

### 5. Inquiry form emails

Netlify → **Forms**. Enable form detection if prompted. After the first deploy, the `inquiry` form appears. Go to **Forms → Form notifications → Add notification → Email** and send it to `runwithnicole.la@gmail.com`.

### 6. Custom domain (optional)

Add it in **Domain management**, then update `NEXT_PUBLIC_SITE_URL`.

---

## Editing content (for Nicole)

- **Studio:** https://runwithnicole.sanity.studio → **Pages → Home** holds the page sections, and **Header & Footer** holds the menu links and footer email.
- **Publish:** click **Publish** and the live site rebuilds automatically (about 1–2 minutes).
- **Section backgrounds:** each section has a **Background color** picker (White / Off-white / Teal / Navy).

### Waiver / downloadable files

The **Paperwork** section is a Banner. Upload the waiver PDF to its **Download file** field and the **Download Waiver** button appears and downloads it. The button stays hidden until a file (or a Button link) is set.

### Adding photos

- **Hero profile photo:** Home → *Hero* section → **Image**. It's shown as a circle. Click **Edit** (crop icon) on the image to set the **crop** (zoom in on the face) and **hotspot** (the focus point); the circle follows both.
- **Image With Text photos** (e.g. *About Coach Nicole*): the section's **Image**, with **Image fit**:
  - **Cover:** fills half the section edge to edge (may crop).
  - **Contain:** the whole image, inside the content column.
  - **Contain + offset color block:** like Contain, with a teal → sky block peeking out behind the image. Use a plain photo, since images with color blocks already baked in will clash.
- **Cropping:** click the crop icon on any image to trim it. The site uses your crop.
- Always fill in **Alt text** with a short description of the image.
