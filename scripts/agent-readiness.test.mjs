#!/usr/bin/env node
// Agent-readiness verification suite. Runs against a live server and asserts the
// behaviors added for the "Is Agentic" fixes. No dependencies.
//
//   node scripts/agent-readiness.test.mjs [baseUrl]
//   BASE_URL=https://nparashar150.com node scripts/agent-readiness.test.mjs
//
// Exits non-zero if any check fails.

const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

let passed = 0;
const failures = [];
function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function get(path, headers = {}) {
  const res = await fetch(`${BASE}${path}`, { headers, redirect: "manual" });
  const body = await res.text();
  return { status: res.status, headers: res.headers, body };
}

async function main() {
  console.log(`\nAgent-readiness checks against ${BASE}\n`);

  // #1 Agent-friendly 404s
  console.log("#1 Agent-friendly 404s");
  const miss = await get("/definitely-not-a-real-path-" + Date.now());
  check("nonexistent path returns 404", miss.status === 404, `got ${miss.status}`);
  const missMd = await get("/definitely-not-a-real-path-" + Date.now(), { accept: "text/markdown" });
  check("markdown 404 has text/markdown", (missMd.headers.get("content-type") || "").includes("text/markdown"));
  check("markdown 404 status is 404", missMd.status === 404, `got ${missMd.status}`);
  check("markdown 404 points to recovery", /llms\.txt/.test(missMd.body) && /sitemap\.xml/.test(missMd.body));

  // #2 Content without JavaScript (raw HTML)
  console.log("#2 Content without JavaScript");
  const home = await get("/");
  check("home is 200 text/html", home.status === 200 && (home.headers.get("content-type") || "").includes("text/html"));
  check("home has an <h1>", /<h1[\s>]/i.test(home.body));
  const homeText = visibleText(home.body);
  check("home has 500+ chars of text", homeText.length >= 500, `${homeText.length} chars`);
  check("below-hero content is server-rendered", /THINGS I(?:&apos;|')?VE BUILT/i.test(home.body), "Projects heading missing from raw HTML");
  const h2s = (home.body.match(/<h2[\s>]/gi) || []).length;
  const h3s = (home.body.match(/<h3[\s>]/gi) || []).length;
  check("heading hierarchy present (h2+h3)", h2s >= 2 && h3s >= 1, `h2=${h2s} h3=${h3s}`);
  check('featured display says "say it. ship it."', /say it\./i.test(home.body) && /ship it\./i.test(home.body));

  // #3 Markdown content negotiation
  console.log("#3 Markdown content negotiation");
  const homeMd = await get("/", { accept: "text/markdown" });
  check("home returns text/markdown on Accept", (homeMd.headers.get("content-type") || "").includes("text/markdown"), homeMd.headers.get("content-type") || "");
  check("home markdown Vary includes Accept", /accept/i.test(homeMd.headers.get("vary") || ""), homeMd.headers.get("vary") || "");
  check("home markdown has an H1", /^#\s+Naman Parashar/m.test(homeMd.body));
  const aboutMd = await get("/about", { accept: "text/markdown" });
  check("/about returns markdown with sections", (aboutMd.headers.get("content-type") || "").includes("text/markdown") && /##\s+What I do/.test(aboutMd.body));

  // #5 Agent instruction / when-to-use
  console.log("#5 Agent instruction (llms.txt)");
  const llms = await get("/llms.txt");
  check("llms.txt is 200", llms.status === 200);
  check("llms.txt has a When to use section", /##\s*When to use/i.test(llms.body));

  // #6 Trust anchor pages
  console.log("#6 Trust anchor pages");
  for (const p of ["/about", "/contact", "/privacy"]) {
    const page = await get(p);
    const text = visibleText(page.body);
    check(`${p} is 200`, page.status === 200, `got ${page.status}`);
    check(`${p} has an <h1>`, /<h1[\s>]/i.test(page.body));
    check(`${p} has 500+ chars`, text.length >= 500, `${text.length} chars`);
  }

  // #7 Organization schema completeness
  console.log("#7 Organization schema");
  check("JSON-LD has Organization", /"@type":"Organization"/.test(home.body.replace(/\s+/g, "")) || /"Organization"/.test(home.body));
  check("Organization has contactPoint", /contactPoint/.test(home.body));
  check("Organization has PostalAddress", /PostalAddress/.test(home.body));
  check("WebSite node present", /"WebSite"/.test(home.body));

  // Machine-readable files
  console.log("Machine-readable files");
  const sitemap = await get("/sitemap.xml");
  check("sitemap.xml is 200", sitemap.status === 200);
  check("sitemap lists trust pages", /\/about/.test(sitemap.body) && /\/contact/.test(sitemap.body) && /\/privacy/.test(sitemap.body));
  const robots = await get("/robots.txt");
  check("robots.txt is 200", robots.status === 200);

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log("All agent-readiness checks passed.\n");
}

main().catch((err) => {
  console.error("Verification run crashed:", err);
  process.exit(1);
});
