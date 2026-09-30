// next.config.js

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep BOTH the webpack aliases and `turbopack: {}` — removing either breaks
  // the build (Next 16 defaults to Turbopack, which reads jsconfig paths).
  webpack(config) {
    config.resolve.alias["@utils"] = path.join(__dirname, "src/app/utils");
    config.resolve.alias["@components"] = path.join(__dirname, "src/app/components");
    return config;
  },
  turbopack: {},
  reactStrictMode: true,
  // Static export for Netlify builds. Dev runs as a server so the dev-only data
  // refresh (src/proxy.js → /api/dev-regenerate) works locally.
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  images: {
    unoptimized: true,
  },
  sassOptions: {
    loadPaths: [path.join(__dirname, "src", "app", "styles")],
    additionalData: `@use "variables" as *; @use "mixins" as *;`,
  },
};

module.exports = nextConfig;
