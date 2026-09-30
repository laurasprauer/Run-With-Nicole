// Build-time Sanity client shared by generateSlugs / generatePageData.
// Runs in Node only (never bundled for the browser), so the token stays server-side.
const { createClient } = require("@sanity/client");
require("dotenv").config();

// Fail fast with a readable message while .env still has placeholder values.
function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.startsWith("your-")) {
    console.error(`\n❌ Set ${name} in .env (or in Netlify env vars) — see README.md → Environment variables.\n`);
    process.exit(1);
  }
  return value;
}

const projectId = requireEnv("NEXT_PUBLIC_STUDIO_PROJECT_ID");
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Published content only.
const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: requireEnv("SANITY_API_READ_TOKEN"),
  perspective: "published",
});

// On Netlify, serve Sanity assets through our own domain (public/_redirects proxy).
// Local dev keeps direct cdn.sanity.io URLs.
function rewriteSanityUrls(input) {
  if (process.env.NETLIFY !== "true") return input;
  if (typeof input === "string") {
    return input
      .replace(`https://cdn.sanity.io/files/${projectId}/${dataset}/`, "/sanity-files/")
      .replace(`https://cdn.sanity.io/images/${projectId}/${dataset}/`, "/sanity-images/");
  }
  if (Array.isArray(input)) return input.map(rewriteSanityUrls);
  if (input && typeof input === "object") {
    const result = {};
    for (const key of Object.keys(input)) result[key] = rewriteSanityUrls(input[key]);
    return result;
  }
  return input;
}

module.exports = { client, projectId, dataset, rewriteSanityUrls };
