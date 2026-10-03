import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TRUST_PAGES } from "@/lib/content";

// Single-page portfolio: the root plus the standalone trust pages.
//
// In-page anchors (/#about, /#contact) used to be listed here too. They aren't
// pages — a crawler resolves them to the root and throws the fragment away, so
// they were four duplicate entries for one URL. Worse, /#about collided with
// the real /about page, which is the kind of thing that makes a crawler pick
// the wrong canonical.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...TRUST_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
