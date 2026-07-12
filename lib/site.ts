// single source of truth for the canonical production URL.
// if you serve from a different domain, change this one line.
export const SITE_URL = "https://nparashar150.dev";

// Person / Portfolio structured data (JSON-LD) — read by Google, Bing, and
// increasingly by LLM answer engines for grounding.
import { config } from "./config";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.name,
    url: SITE_URL,
    email: `mailto:${config.email}`,
    jobTitle: "Software Engineer",
    description: config.headline,
    image: `${SITE_URL}/me.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressCountry: "IN",
    },
    worksFor: {
      "@type": "Organization",
      name: "Ringg AI",
      url: "https://www.ringg.ai",
    },
    knowsAbout: [
      "Voice AI",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Frontend Engineering",
      "Product Engineering",
      "Micro-Frontends",
    ],
    sameAs: config.socials.map((s) => s.url),
  };
}
