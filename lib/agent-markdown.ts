// Markdown representations of the site's pages, for Accept: text/markdown
// content negotiation (acceptmarkdown.com) and agent-friendly 404s.
// Pure functions over config/content so this is safe to import from `proxy.ts`
// (edge runtime) and from tests.
import { config } from "./config";
import { TRUST_PAGES, type PageContent } from "./content";

/** Paths that have a markdown representation (served with 200). */
export const KNOWN_MARKDOWN_PATHS: string[] = [
  "/",
  ...TRUST_PAGES.map((p) => p.path),
];

function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Markdown for a known path, or null if the path has no markdown page. */
export function markdownFor(pathname: string): string | null {
  const path = normalize(pathname);
  if (path === "/") return homeMarkdown();
  const page = TRUST_PAGES.find((p) => p.path === path);
  return page ? pageMarkdown(page) : null;
}

function pageMarkdown(page: PageContent): string {
  const out: string[] = [`# ${page.title}`, "", page.description, ""];
  for (const section of page.sections) {
    out.push(`## ${section.heading}`, "");
    for (const para of section.body) out.push(para, "");
  }
  out.push("---", "", navFooter(page.path));
  return `${out.join("\n").trimEnd()}\n`;
}

function homeMarkdown(): string {
  const out: string[] = [
    `# ${config.name} — ${config.role}`,
    "",
    config.headline,
    "",
    "## Now",
    "",
    `- ${config.status}, focused on AI-first web, frontend and product engineering, and voice AI.`,
    `- Based in ${config.location.split("/").pop()?.trim() ?? "New Delhi, India"} — remote-friendly.`,
    "",
    "## Experience",
    "",
    // Bullets where we have them: the voice agent answers from this, and a
    // one-line summary per role isn't enough to hold a conversation.
    ...config.work.flatMap((w) => [
      `- **${w.company}** — ${w.role} (${w.period}). ${w.desc}`,
      ...("detail" in w && Array.isArray(w.detail)
        ? w.detail.map((d: string) => `  - ${d}`)
        : []),
    ]),
    "",
    "## Projects",
    "",
    `- **${config.featured.name}** — ${config.featured.desc} (${config.featured.host})`,
    ...config.projects.map((p) => `- **${p.name}** — ${p.desc}`),
    "",
    "## Contact",
    "",
    `- Email: ${config.email}`,
    ...config.socials.map((s) => `- ${s.name}: ${s.url}`),
    "",
    "---",
    "",
    navFooter("/"),
  ];
  return `${out.join("\n").trimEnd()}\n`;
}

function navFooter(currentPath: string): string {
  const links = [
    { label: "Home", path: "/" },
    ...TRUST_PAGES.map((p) => ({ label: p.title.split(" ")[0], path: p.path })),
    { label: "llms.txt", path: "/llms.txt" },
    { label: "Sitemap", path: "/sitemap.xml" },
  ].filter((l) => l.path !== currentPath);
  return `More: ${links.map((l) => `[${l.label}](${l.path})`).join(" · ")}`;
}

/** Agent-friendly 404 body: a real dead-end, but with a way to recover. */
export function notFoundMarkdown(pathname: string): string {
  return (
    [
      "# 404 — Page not found",
      "",
      `There is nothing at \`${pathname}\` on this site.`,
      "",
      "## Where to look instead",
      "",
      "- [Home](/) — Naman Parashar, software engineer",
      "- [About](/about)",
      "- [Contact](/contact)",
      "- [Privacy](/privacy)",
      "- [llms.txt](/llms.txt) — structured summary for AI agents",
      "- [Sitemap](/sitemap.xml)",
    ].join("\n") + "\n"
  );
}
