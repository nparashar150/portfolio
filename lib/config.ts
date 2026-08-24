export const config = {
  name: "Naman Parashar",
  first: "naman",
  role: "Engineer",
  status: "Open to work",
  location: "28.7035° N, 77.4175° E / New Delhi, IND",
  headline:
    "Just an engineer who likes building products. I love playing with UI, and I've been deep in voice AI. This site can hear you. And it talks back.",
  email: "nparashar150@gmail.com",
  photo: "/me.jpg", // drop a portrait at public/me.jpg

  meta: [
    { label: "Open to", value: "Work & Collabs" },
    { label: "Focus", value: "AI-First Web" },
    { label: "Based", value: "India · Remote" },
  ],

  about:
    "I live where design meets systems. Lately that means voice AI: agents that sound human and interfaces that feel alive.",

  work: [
    {
      period: "2023 → NOW",
      role: "Product & Frontend Consultant",
      company: "Ringg AI",
      url: "https://www.ringg.ai",
      desc: "Led the RinggAI and DesiVocal frontends. Shipped a TTS interface at 7M+ generations.",
      stat: "TTS AT 7M+ GENERATIONS",
      preview: "/previews/ringg.webp",
      embed: true,
      tech: ["React", "Next.js", "TypeScript", "Zustand", "AWS"],
    },
    {
      period: "2022 → NOW",
      role: "Software Engineer II",
      company: "Sylva, NY",
      url: "https://withsylva.com",
      desc: "Ran the HubSpot to Attio migration of 500K+ records and scaled Miitra to 20+ communities.",
      stat: "500K+ RECORDS MIGRATED",
      preview: "/previews/sylva.webp",
      embed: false, // withsylva.com sets frame-ancestors 'none'
      tech: ["TypeScript", "React", "Node.js"],
    },
    {
      period: "2022 → 2023",
      role: "Product Engineer",
      company: "Antler",
      url: "https://www.antler.co",
      desc: "Built internal tools for 500+ portfolio companies and automated their content migrations.",
      stat: "TOOLS FOR 500+ STARTUPS",
      preview: "/previews/antler.webp",
      embed: true,
      tech: ["React", "TypeScript", "Node.js"],
    },
    {
      period: "2022",
      role: "Software Developer",
      company: "CareFi",
      url: "https://carefi.in",
      desc: "Built CareCred's onboarding and dashboards, helping secure early-stage funding.",
      stat: "CARECRED MVP → FUNDED",
      preview: "/previews/carefi.webp",
      embed: true,
      tech: ["React", "TypeScript", "Firebase"],
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
    {
      name: "Miitra",
      tag: "Notes",
      desc: "Customer-data tooling across 20+ communities. 2x engagement.",
      stack: "React · Node · Data",
      stat: "2X ENGAGEMENT",
      url: "https://www.joinmiitra.com/",
      preview: "/previews/miitra.webp",
      embed: false, // joinmiitra.com sets frame-ancestors none
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

  agentPrompts: [
    "Who is Naman?",
    "Show me your work",
    "Your tech stack",
    "Are you hireable?",
  ],
};

export type Config = typeof config;
