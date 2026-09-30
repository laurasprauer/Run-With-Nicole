// Development-only: re-pull Sanity data into public/static-*.json.
// Called by src/proxy.js on page reloads during `npm run dev`.
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    await execAsync("npm run generate:slugs");
    await execAsync("npm run generate:pageData");
    res.status(200).json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("❌ Error updating data from Sanity:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
