"use client";

import { useEffect } from "react";

// On first load with a hash (e.g. /#pricing from a shared link), scroll to it once
// the statically rendered sections are in place.
export default function ClientWrapper({ children }) {
  useEffect(() => {
    const id = window.location.hash?.substring(1);
    if (!id) return;
    document.getElementById(decodeURIComponent(id))?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return <>{children}</>;
}
