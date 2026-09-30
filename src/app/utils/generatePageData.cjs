// Writes public/static-page-data.json — every page + the navigation document.
// getStaticProps in src/pages/[[...slug]].js reads this file; nothing fetches
// Sanity at runtime.
const fs = require("fs");
const path = require("path");
const { client, rewriteSanityUrls } = require("./sanityBuildClient.cjs");
const { DEFAULT_SEO } = require("./defaultSEO.cjs");

// Image projection shared by every image field.
const IMAGE = `{ alt, asset->{ url, "width": metadata.dimensions.width, "height": metadata.dimensions.height } }`;

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
    fallbackImage ${IMAGE},
    backgroundVideo { asset->{ url } }
  }
}`;

const NAVIGATION_QUERY = `*[_type == "navigation"][0]{
  links[]{ _key, label, link, displayAsButton },
  footerEmail,
  footerSlogan
}`;

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

  return rewriteSanityUrls(allData);
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
