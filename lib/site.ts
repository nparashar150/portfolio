// single source of truth for the canonical production URL.
// if you serve from a different domain, change this one line.
export const SITE_URL = "https://nparashar150.com";

// Structured data (JSON-LD) — read by Google, Bing, and increasingly by LLM
// answer engines for grounding. Emitted as one @graph of cross-linked nodes
// (Person + Organization + WebSite) so entities can reference each other.
import { config } from "./config";

const PERSON_ID = `${SITE_URL}/#person`;
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const ADDRESS = {
  "@type": "PostalAddress" as const,
  addressLocality: "New Delhi",
  addressRegion: "Delhi",
  addressCountry: "IN",
};

function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: config.name,
    alternateName: "@nparashar150",
    url: SITE_URL,
    email: `mailto:${config.email}`,
    jobTitle: "Software Engineer",
    description: config.headline,
    image: `${SITE_URL}/me.jpg`,
    address: ADDRESS,
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

// Organization node with the two fields AI verifiers look for: contactPoint and
// a postal address. This is the solo-practice entity behind the portfolio.
function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: config.name,
    url: SITE_URL,
    email: `mailto:${config.email}`,
    logo: `${SITE_URL}/me.jpg`,
    image: `${SITE_URL}/me.jpg`,
    description: config.headline,
    founder: { "@id": PERSON_ID },
    address: ADDRESS,
    contactPoint: {
      "@type": "ContactPoint",
      email: config.email,
      contactType: "business inquiries",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: config.socials.map((s) => s.url),
  };
}

function webSiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: config.name,
    alternateName: "Naman Parashar Portfolio",
    description: config.headline,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

/** The full JSON-LD graph rendered site-wide in the root layout. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [personNode(), organizationNode(), webSiteNode()],
  };
}

// Backwards-compatible single-node export (kept for any external callers).
export function personJsonLd() {
  return { "@context": "https://schema.org", ...personNode() };
}
