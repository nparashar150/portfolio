import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// AI answer engines and traditional crawlers are all welcome — a public
// portfolio wants maximum reach, so nothing is disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
