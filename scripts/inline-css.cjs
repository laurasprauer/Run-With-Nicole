// Post-build: inline the exported CSS into each HTML page in out/.
// The site is one page with ~10 KB (gzipped) of CSS, so shipping it inside the HTML
// removes two render-blocking requests (Lighthouse: "Render-blocking requests") and
// lets the first paint happen as soon as the HTML arrives.
// Runs after `next build` (see package.json "build").
const fs = require("fs");
const path = require("path");

const OUT = path.join(process.cwd(), "out");

const htmlFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });

// Relative url(...) inside a CSS file (e.g. ../media/font.woff2) must become absolute
// once the CSS lives in the HTML.
const absolutizeUrls = (css, cssHref) => {
  const base = path.posix.dirname(cssHref);
  return css.replace(/url\((['"]?)(?!data:|https?:|\/)([^'")]+)\1\)/g, (_, quote, rel) => {
    return `url(${quote}${path.posix.normalize(path.posix.join(base, rel))}${quote})`;
  });
};

let inlined = 0;
for (const file of htmlFiles(OUT)) {
  let html = fs.readFileSync(file, "utf-8");
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)"[^>]*\/?>/g)].map((m) => m[1]);
  if (!hrefs.length) continue;

  for (const href of hrefs) {
    const cssPath = path.join(OUT, href);
    if (!fs.existsSync(cssPath)) continue;
    const css = absolutizeUrls(fs.readFileSync(cssPath, "utf-8"), href).replace(/<\/style/gi, "<\\/style");
    const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Replace the stylesheet link with the CSS itself; drop its now-useless preload.
    html = html
      .replace(new RegExp(`<link rel="stylesheet" href="${escaped}"[^>]*\\/?>`), () => `<style data-inlined-from="${href}">${css}</style>`)
      .replace(new RegExp(`<link rel="preload" href="${escaped}" as="style"[^>]*\\/?>`), "");
    inlined++;
  }
  fs.writeFileSync(file, html);
}

console.log(`✅ Inlined ${inlined} stylesheet(s) into HTML.`);
