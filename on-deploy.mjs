// Runs on the Netlify build server (scripts/netlify-build.sh).
// Sanity Studio only sees SANITY_STUDIO_* variables from studio/.env, so this
// copies the values it needs out of the site's environment. If the Studio needs
// another variable, add it here.
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const fileContent = [
  `SANITY_STUDIO_PROJECT_ID=${process.env.NEXT_PUBLIC_STUDIO_PROJECT_ID}`,
  `SANITY_STUDIO_DATASET=${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}`,
  "",
].join("\n");

const filePath = path.join(__dirname, "studio", ".env");
fs.writeFileSync(filePath, fileContent);
console.log(`✅ studio/.env written at ${filePath}`);
