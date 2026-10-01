// Writes public/static-page-data.json — every page + the navigation document.
// getStaticProps in src/pages/[[...slug]].js reads this file; nothing fetches
// Sanity at runtime.
const fs = require("fs");
const path = require("path");
const { client, rewriteSanityUrls } = require("./sanityBuildClient.cjs");
const { DEFAULT_SEO } = require("./defaultSEO.cjs");

// Image projection shared by every image field.
const IMAGE = `{ alt, crop, hotspot, asset->{ url, originalFilename, "width": metadata.dimensions.width, "height": metadata.dimensions.height } }`;

const PAGE_QUERY = `*[_type == "page" && defined(slug.current)]{
  _id,
  title,
  slug,
  seoTitle,
  seoDescription,
  noindex,
  shareImage ${IMAGE},
  mainContent[]{
    ...,
    componentImage ${IMAGE},
    backgroundImage ${IMAGE},
    downloadFile { asset->{ url, originalFilename } }
  }
}`;

const NAVIGATION_QUERY = `*[_type == "navigation"][0]{
  links[]{ _key, label, link, displayAsButton },
  footerEmail
}`;

// SEO-friendly asset URLs: Sanity's CDN accepts a "vanity" filename after the asset path
// (…/<id>-800x1000.jpg/coach-nicole-running.jpg) and still serves the same file, with
// ?w=/?rect=/?dl= params working as usual. We append the asset's originalFilename
// (rename it in the Studio's media library) slugified, so image/file URLs carry
// readable names. Runs before the Netlify proxy rewrite.
const slugifyFilename = (name) =>
  String(name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function addVanityFilenames(input) {
  if (Array.isArray(input)) return input.map(addVanityFilenames);
  if (!input || typeof input !== "object") return input;
  const result = {};
  for (const key of Object.keys(input)) result[key] = addVanityFilenames(input[key]);
  const { url, originalFilename } = result;
  if (typeof url === "string" && url.startsWith("https://cdn.sanity.io/") && originalFilename) {
    const ext = (url.match(/\.([a-z0-9]+)$/i) || [])[1];
    const slug = slugifyFilename(originalFilename);
    if (ext && slug) result.url = `${url}/${slug}.${ext}`;
  }
  return result;
}

async function getAllData() {
  const [pages, navigation] = await Promise.all([
    client.fetch(PAGE_QUERY),
    client.fetch(NAVIGATION_QUERY),
  ]);

  const allData = { pages: {}, navigation: navigation || {} };

  pages.forEach((page) => {
    const slug = page.slug?.current || "/";
    allData.pages[slug] = {
      ...page,
      seo: {
        title: page.seoTitle || DEFAULT_SEO.title,
        description: page.seoDescription || DEFAULT_SEO.description,
        noindex: page.noindex || false,
        image: page.shareImage?.asset?.url || null,
      },
    };
  });

  return rewriteSanityUrls(addVanityFilenames(allData));
}

getAllData()
  .then((data) => {
    const filePath = path.join(process.cwd(), "public/static-page-data.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Static page data generated (${Object.keys(data.pages).length} pages).`);
  })
  .catch((err) => {
    console.error("❌ generatePageData failed:", err.message);
    process.exit(1);
  });
