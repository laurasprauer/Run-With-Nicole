// Writes public/static-slugs.json — the list of page paths for getStaticPaths.
const fs = require("fs");
const path = require("path");
const { client } = require("./sanityBuildClient.cjs");

async function fetchSlugs() {
  const slugs = await client.fetch(`*[_type == "page" && defined(slug.current)][].slug.current`);
  const slugsPath = path.join(process.cwd(), "public/static-slugs.json");
  fs.writeFileSync(slugsPath, JSON.stringify(slugs, null, 2));
  console.log(`✅ Static slugs generated (${slugs.length}).`);
}

fetchSlugs().catch((err) => {
  console.error("❌ generateSlugs failed:", err.message);
  process.exit(1);
});
