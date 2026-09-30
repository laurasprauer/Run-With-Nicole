import { NextResponse } from "next/server";

// Development only: on page reloads during `npm run dev`, re-pull Sanity data into
// public/static-*.json (via /api/dev-regenerate) so edits show up without restarting.
// Next 16 name for middleware. Not used by the static export.
let lastRegeneration = 0;
const REGENERATION_COOLDOWN = 3000;

export function proxy(request) {
  if (process.env.NODE_ENV !== "development") return NextResponse.next();

  const { pathname, origin } = request.nextUrl;
  const isPageRequest = !pathname.startsWith("/api/") && !pathname.startsWith("/_next/") && !pathname.includes(".");

  const now = Date.now();
  if (isPageRequest && now - lastRegeneration > REGENERATION_COOLDOWN) {
    lastRegeneration = now;
    fetch(`${origin}/api/dev-regenerate`, { method: "POST" }).catch((error) => {
      console.error("Background Sanity data refresh failed:", error);
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon).*)"],
};
