export const config = {
  name: "Naman Parashar",
  first: "naman",
  role: "Engineer",
  status: "Open to work",
  location: "28.7035° N, 77.4175° E / New Delhi, IND",
  headline:
    "Just an engineer who likes building products. I love playing with UI, and I've been deep in voice and video AI. This site can hear you. And it talks back.",
  email: "nparashar150@gmail.com",
  photo: "/me.jpg", // drop a portrait at public/me.jpg

  meta: [
    { label: "Open to", value: "Work & Collabs" },
    { label: "Focus", value: "AI-First Web" },
    { label: "Based", value: "India · Remote" },
  ],

  // What the agent answers "what do you charge?" with. Kept here so the site
  // and the agent can't disagree about it.
  rates: {
    preferred: "Project-based — a fixed price for a defined scope.",
    hourly: "$60/hr when time-based suits the work better.",
    note: "Happy to scope a project on a call.",
  },

  about:
    "I live where design meets systems. Lately that means voice and video AI: agents that sound human and interfaces that feel alive.",

  work: [
    {
      period: "2022 → NOW",
      role: "Software Engineer II",
      company: "Sylva, NY",
      url: "https://withsylva.com",
      desc: "Own Exchange, a members-only platform for 900+ Chiefs of Staff. Ran the HubSpot to Attio migration of 500K+ records.",
      stat: "500K+ RECORDS MIGRATED",
      preview: "/previews/sylva.webp",
      embed: false, // withsylva.com sets frame-ancestors 'none'
      tech: ["TypeScript", "React", "Node.js", "Stripe", "Supabase", "Postgres"],
      // Longer form, used by the markdown rendering and the voice agent.
      detail: [
        "Build and own Exchange, a members-only platform for 900+ Chiefs of Staff, including auth, applications and the member directory.",
        "Led the HubSpot to Attio migration: rebuilt 500+ automations and moved 500K+ records with idempotent writeback.",
        "Built a multi-tenant sync engine across Fillout, Attio, Stripe, Memberstack and Supabase.",
        "Built Stripe billing, subscription state, webhooks and lifecycle emails with audit trails.",
        "Built a read-only Postgres MCP server with query guards and rate limiting for AI access.",
        "Earlier at Sylva: built the Miitra frontend, scaling it to 100K+ members across 30+ communities.",
      ],
    },
    {
      period: "2023 → NOW",
      role: "Frontend Engineer, Voice AI",
      company: "Ringg AI",
      url: "https://www.ringg.ai",
      desc: "Joined as the 5th person and grew with the team to ~50. Built the embeddable voice SDK and co-led DesiVocal at 7M+ generations.",
      stat: "TTS AT 7M+ GENERATIONS",
      preview: "/previews/ringg.webp",
      embed: false, // ringg.ai sets frame-ancestors 'self' https://*.prismic.io
      tech: ["React", "Next.js", "TypeScript", "Flutter", "Android", "Zustand", "AWS"],
      detail: [
        "Built Ringg's embeddable voice and chat UI SDK across React, Flutter and Android, with realtime audio, transcription and data-channel messaging.",
        "Top contributor to the core agent frontend across 16 engineers: the visual flow builder, agent editor and realtime execution dashboards.",
        "Co-led the DesiVocal frontend monorepo across 5 applications, supporting 7M+ voice generations.",
        "Authored the internal component library — components, editor, hooks, stores and providers.",
        "Owned frontend architecture, state management, API patterns and performance as the product scaled.",
      ],
    },
    {
      period: "2022 → 2023",
      role: "Product Engineering Intern",
      company: "Antler",
      url: "https://www.antler.co",
      desc: "Built internal tools for 500+ portfolio companies and automated their content migrations.",
      stat: "TOOLS FOR 500+ STARTUPS",
      preview: "/previews/antler.webp",
      embed: true,
      tech: ["React", "TypeScript", "Node.js", "Firebase"],
      detail: [
        "Streamlined employee onboarding by integrating it with Antler's existing product suite.",
        "Automated a broken data migration covering 500+ portfolio companies and 250+ blogs.",
        "Automated bug and ticket management through a Slackbot and Notion.",
        "Shipped fixes and features across antler.co, Antler Hub, Fusion and Demoday.",
      ],
    },
    {
      period: "2022",
      role: "Product Engineer",
      company: "OffsetFarm",
      url: "https://offsetfarm.io",
      desc: "Built app.offsetfarm.io from scratch, letting investors finance climate projects and earn carbon offsets.",
      stat: "CLIMATE FINANCE APP",
      preview: "/previews/carefi.webp",
      embed: true,
      tech: ["React", "TypeScript", "JavaScript"],
      detail: [
        "Built app.offsetfarm.io from scratch so investors could design deals, finance projects and earn carbon offsets.",
        "Refactored the marketing site for faster load times and revamped its interface.",
      ],
    },
    {
      period: "2022",
      role: "Product Engineer",
      company: "CareFi",
      url: "https://carefi.in",
      desc: "Built CareCred's onboarding and dashboards, helping secure early-stage funding.",
      stat: "CARECRED MVP → FUNDED",
      preview: "/previews/carefi.webp",
      embed: true,
      tech: ["React", "TypeScript", "Firebase", "Ionic"],
      detail: [
        "Built the CareCred frontend from scratch so healthcare suppliers could reach financing quickly.",
        "Mentored new team members and contributed to product decisions.",
      ],
    },
  ],

  featured: {
    name: "QuikRun",
    tag: "Live",
    desc: "QuikRun turns a plain-English prompt into a live URL that runs your code — no servers, no deploys.",
    tech: ["TypeScript", "Cloudflare", "MCP"],
    display: "say it.\nship it.",
    host: "quik.run",
    url: "https://www.quik.run/",
    preview: "/previews/quikrun.webp",
    embed: true,
  },

  projects: [
    {
      name: "Pixio",
      tag: "Live",
      desc: "Long-form video into captioned shorts for Reels, TikTok and Shorts.",
      stack: "Next.js · FFmpeg · Gemini",
      stat: "LIVE",
      url: "https://www.pixio.tech/",
      preview: "/previews/pixio.webp",
      embed: true,
    },
    {
      name: "ACE Monorepo",
      tag: "Overview",
      desc: "Rebuilt vipsace.org with micro-frontends. 45% faster, 15+ devs led.",
      stack: "Gatsby · GraphQL",
      stat: "45% FASTER",
      url: "https://vipsace.org",
      preview: "/previews/ace.webp",
      embed: true,
    },
  ],

  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "GraphQL",
    "TanStack Query",
    "AWS",
    "Remotion",
    "Micro-Frontends",
    "Monorepo",
    "Playwright",
    "Voice AI",
  ],

  socials: [
    { name: "GitHub", handle: "@nparashar150", url: "https://github.com/nparashar150" },
    {
      name: "LinkedIn",
      handle: "nparashar150",
      url: "https://www.linkedin.com/in/nparashar150",
    },
    { name: "X (Twitter)", handle: "@nparashar150", url: "https://x.com/nparashar150" },
    { name: "Medium", handle: "@nparashar150", url: "https://medium.com/@nparashar150" },
  ],

  // Questions someone deciding whether to hire or work with me actually has.
  // "Who is Naman?" is a fan's question; these move toward a booking.
  agentPrompts: [
    "Are you available?",
    "Have you shipped voice AI?",
    "What do you charge?",
    "Book a call",
  ],
};

export type Config = typeof config;
