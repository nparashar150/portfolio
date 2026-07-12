import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// single-page portfolio: the root, plus the in-page section anchors so
// crawlers understand the structure.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const sections = ["work", "projects", "about", "contact"];
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...sections.map((s) => ({
      url: `${SITE_URL}/#${s}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
