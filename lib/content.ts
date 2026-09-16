// Long-form content for the trust-anchor pages (/about, /contact, /privacy).
// Kept as structured data so it renders identically as HTML (TrustPage) and as
// markdown (agent-markdown) — one source of truth, no drift.
import { config } from "./config";

export type ContentSection = { heading: string; body: string[] };

export type PageContent = {
  slug: string; // "about" | "contact" | "privacy"
  path: string; // "/about"
  label: string; // mono eyebrow, e.g. "PROFILE"
  title: string; // <h1> + <title>
  description: string; // meta description + intro paragraph
  sections: ContentSection[];
};

const socialsLine = config.socials
  .map((s) => `${s.name} (${s.handle})`)
  .join(", ");

export const aboutContent: PageContent = {
  slug: "about",
  path: "/about",
  label: "PROFILE",
  title: "About Naman Parashar",
  description:
    "Naman Parashar is a product-minded software engineer in New Delhi who builds fast, considered web products — with a soft spot for interface craft and voice AI that sounds genuinely human.",
  sections: [
    {
      heading: "What I do",
      body: [
        "I design and build front-of-stack products end to end: React and Next.js interfaces, TypeScript everywhere, and Node services when the work calls for it. I care about the details most people scroll past — motion, typography, empty states, and the feel of a single click.",
        "For the last while I've been deep in voice and video AI: agents that listen, reason, and talk back in real time, and pipelines that cut long-form video down to the parts worth watching. This very site is one of them — its commit graph doubles as a live voice agent you can actually speak to.",
      ],
    },
    {
      heading: "Where I've shipped",
      body: [
        "I'm currently a Software Engineer II at Sylva, where I ran a 500K+ record HubSpot to Attio migration and scaled Miitra to 20+ communities, and a Product & Frontend Consultant at Ringg AI, where I led the RinggAI and DesiVocal frontends and shipped a text-to-speech interface serving over 7 million generations. Before those I was a Product Engineer at Antler (internal tools for 500+ portfolio companies) and a Software Developer at CareFi (CareCred's onboarding and dashboards, which helped secure early-stage funding).",
      ],
    },
    {
      heading: "How I work",
      body: [
        "I like small teams, tight loops, and shipping loudly. I'm equally comfortable owning a design system, untangling a data migration, or standing an AI feature up from prompt to production. If it lives on the web and it needs to feel great, that's my lane.",
      ],
    },
  ],
};

export const contactContent: PageContent = {
  slug: "contact",
  path: "/contact",
  label: "GET IN TOUCH",
  title: "Contact Naman Parashar",
  description:
    "The fastest way to reach Naman Parashar is email. He reads every message and usually replies within a day or two.",
  sections: [
    {
      heading: "Email",
      body: [
        `Write to ${config.email}. Tell me what you're building and where I might help — a role, a collaboration, contract work, or just a good technical problem worth chewing on.`,
      ],
    },
    {
      heading: "Elsewhere",
      body: [
        `Find me across the web: ${socialsLine}. I'm most active on GitHub and X.`,
      ],
    },
    {
      heading: "Where I'm based",
      body: [
        "New Delhi, India (UTC+5:30). I work remotely with teams around the world and keep flexible hours so there's real overlap wherever you are.",
      ],
    },
    {
      heading: "Availability",
      body: [
        "I'm currently open to work and collaborations, with a focus on AI-first web products, frontend and product engineering, and voice AI. If that overlaps with what you're building, reach out.",
      ],
    },
  ],
};

export const privacyContent: PageContent = {
  slug: "privacy",
  path: "/privacy",
  label: "PRIVACY",
  title: "Privacy Policy",
  description:
    "The privacy policy for nparashar150.com, the personal portfolio of Naman Parashar. It explains what limited data the site handles and why.",
  sections: [
    {
      heading: "What this site collects",
      body: [
        "The site uses privacy-friendly analytics (Ahrefs Web Analytics) to count visits and understand which pages are useful. It does not use advertising cookies and does not build personal profiles for marketing purposes.",
      ],
    },
    {
      heading: "The voice agent",
      body: [
        "The contact section includes an optional voice agent. If you choose to start a call, your microphone audio is processed in real time to power the conversation. Please don't share sensitive personal information with it — it exists as a demo and a friendly way to say hi, not as a system of record.",
      ],
    },
    {
      heading: "What I don't do",
      body: [
        "I don't sell your data, and I don't share it with third parties beyond the analytics and infrastructure providers needed to run the site. There's no account to create and no newsletter to sign up for.",
      ],
    },
    {
      heading: "Contact",
      body: [
        `Questions about privacy, or want something removed? Email ${config.email} and I'll sort it out.`,
      ],
    },
  ],
};

export const TRUST_PAGES: PageContent[] = [
  aboutContent,
  contactContent,
  privacyContent,
];
