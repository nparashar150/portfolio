export const config = {
  name: "Naman Parashar",
  first: "naman",
  role: "Frontend & Product Engineer",
  status: "Open to work",
  location: "28.6139° N, 77.2090° E / Delhi, IND",
  headline:
    "Day-zero engineer. I take AI-first products from an empty repo to real users, currently in the trenches on voice AI at ringg.ai.",
  email: "nparashar150@gmail.com",

  meta: [
    { label: "Open to", value: "Work & Collabs" },
    { label: "Focus", value: "AI-First Web" },
    { label: "Based", value: "India · Remote" },
  ],

  about:
    "I'm a frontend and product engineer who lives where design meets systems. Lately that means voice AI and AI-first web products that feel fast and look considered.",

  work: [
    {
      period: "Aug 2023 → Now",
      role: "Product & Frontend Consultant",
      company: "Ringg AI",
      desc: "There since day 0. Led the frontend for RinggAI (voice AI calling) and DesiVocal (TTS).",
      details: [
        "Owned agent workflows, campaign setup, real-time call dashboards and analytics.",
        "Built the core frontend: routing, component system, Zustand state and the embedded call flow.",
        "Shipped DesiVocal's TTS interface powering 7M+ voice generations.",
      ],
      tech: ["React", "Next.js", "TypeScript", "Zustand", "AWS"],
    },
    {
      period: "Nov 2022 → Now",
      role: "Software Engineer II",
      company: "Sylva, NY",
      desc: "Product engineering across teams and stakeholders, often chief-of-staff style.",
      details: [
        "Led the HubSpot to Attio migration: 500+ automations rebuilt, 500K+ records moved, six figures saved a year.",
        "Built integrations across Slack, LinkedIn and Discord to unify CRM and community data.",
        "Scaled Miitra to 20+ communities with segmentation, analytics and an AI writer that 2x'd engagement.",
      ],
      tech: ["TypeScript", "React", "Node.js"],
    },
    {
      period: "Feb 2022 → May 2023",
      role: "Product Engineer (Intern)",
      company: "Antler",
      desc: "Product engineering at the venture accelerator.",
      details: [
        "Built internal tools used by 500+ portfolio companies for demo days.",
        "Improved issue-tracking with Slackbots and Notion automation.",
        "Automated migration of 250+ blogs and datasets.",
      ],
      tech: ["React", "TypeScript", "Node.js"],
    },
    {
      period: "May → Aug 2022",
      role: "Software Developer",
      company: "CareFi",
      desc: "Built CareCred, a fintech health-finance MVP.",
      details: [
        "Shipped complex onboarding and dashboards that helped secure early-stage funding.",
        "Shaped product flows and UX to speed up release timelines.",
      ],
      tech: ["React", "TypeScript", "Firebase"],
    },
  ],

  featured: {
    name: "Pixio",
    tag: "Live",
    desc: "Long-form video into captioned shorts for Reels, TikTok and Shorts.",
    tech: ["Next.js", "FFmpeg", "Gemini", "AWS S3"],
    display: "long → short",
    host: "pixio.tech",
    url: "https://www.pixio.tech/",
  },

  projects: [
    {
      name: "QuikRun",
      tag: "Case study",
      desc: "Run TypeScript with packages inside no-code tools. 100+ early users.",
      stack: "TypeScript · No-Code",
      url: "https://www.quik.run/",
    },
    {
      name: "ACE Monorepo",
      tag: "Overview",
      desc: "Rebuilt vipsace.org with micro-frontends. 45% faster, 15+ devs led.",
      stack: "Gatsby · GraphQL",
      url: "https://github.com/ACE-VSIT/website",
    },
    {
      name: "Miitra",
      tag: "Notes",
      desc: "Customer-data tooling across 20+ communities. 2x engagement.",
      stack: "React · Node · Data",
      url: "https://www.joinmiitra.com/",
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
