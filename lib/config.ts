export const config = {
  name: "Naman Parashar",
  first: "naman",
  role: "Engineer",
  status: "Open to work",
  location: "28.7035° N, 77.4175° E / New Delhi, IND",
  headline:
    "Just an engineer who likes building products. I love playing with UI, and I've spent a while deep in the voice AI space.",
  email: "nparashar150@gmail.com",
  photo: "/me.jpg", // drop a portrait at public/me.jpg

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
      url: "https://www.ringg.ai",
      desc: "Led the RinggAI and DesiVocal frontends. Shipped a TTS interface at 7M+ generations.",
      preview: "/previews/ringg.png",
      tech: ["React", "Next.js", "TypeScript", "Zustand", "AWS"],
    },
    {
      period: "Nov 2022 → Now",
      role: "Software Engineer II",
      company: "Sylva, NY",
      url: "https://sylva.com",
      desc: "Ran the HubSpot to Attio migration of 500K+ records and scaled Miitra to 20+ communities.",
      preview: "/previews/sylva.png",
      tech: ["TypeScript", "React", "Node.js"],
    },
    {
      period: "Feb 2022 → May 2023",
      role: "Product Engineer (Intern)",
      company: "Antler",
      url: "https://www.antler.co",
      desc: "Built internal tools for 500+ portfolio companies and automated their content migrations.",
      preview: "/previews/antler.png",
      tech: ["React", "TypeScript", "Node.js"],
    },
    {
      period: "May → Aug 2022",
      role: "Software Developer",
      company: "CareFi",
      url: "https://carefi.in",
      desc: "Built CareCred's onboarding and dashboards, helping secure early-stage funding.",
      preview: "/previews/carefi.png",
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
    preview: "/previews/pixio.png",
  },

  projects: [
    {
      name: "QuikRun",
      tag: "Case study",
      desc: "Run TypeScript with packages inside no-code tools. 100+ early users.",
      stack: "TypeScript · No-Code",
      url: "https://www.quik.run/",
      preview: "/previews/quikrun.png",
    },
    {
      name: "ACE Monorepo",
      tag: "Overview",
      desc: "Rebuilt vipsace.org with micro-frontends. 45% faster, 15+ devs led.",
      stack: "Gatsby · GraphQL",
      url: "https://vipsace.org",
      preview: "/previews/ace.png",
    },
    {
      name: "Miitra",
      tag: "Notes",
      desc: "Customer-data tooling across 20+ communities. 2x engagement.",
      stack: "React · Node · Data",
      url: "https://www.joinmiitra.com/",
      preview: "/previews/miitra.png",
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
