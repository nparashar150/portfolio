import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { markdownFor, notFoundMarkdown } from "@/lib/agent-markdown";

// Next.js 16 renamed Middleware to Proxy. This one implements markdown content
// negotiation (acceptmarkdown.com): when a client asks for `text/markdown`, we
// serve a markdown representation with `Vary: Accept` so CDNs never cross the
// HTML and markdown variants. Unknown paths get a recoverable markdown 404.
const MARKDOWN = "text/markdown";
const VARY = "Accept, Accept-Encoding";

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";

  // Normal (HTML/RSC) traffic passes straight through untouched.
  if (!accept.includes(MARKDOWN)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const markdown = markdownFor(pathname);

  if (markdown !== null) {
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        vary: VARY,
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  }

  // Markdown was requested for a path we don't serve → a real 404, but with a
  // short markdown body pointing agents at where to look next.
  return new NextResponse(notFoundMarkdown(pathname), {
    status: 404,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: VARY,
    },
  });
}

export const config = {
  // Run on page paths only: skip `api`, `_next`, and anything with a file
  // extension (static assets in `public/`, metadata files, images).
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
