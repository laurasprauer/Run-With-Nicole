// eslint.config.mjs
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "out/**", "studio/**", "public/**"],
  },
  {
    rules: {
      // Sanity images are pre-sized via CustomImage (srcset + blur-up); next/image is unused
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
