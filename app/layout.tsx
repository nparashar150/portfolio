import type { Metadata } from "next";
import Script from "next/script";

// OpenAI conversion tracking. A pixel id is public by design — it ships in the
// page either way — so it lives here rather than in an env var that would only
// create the illusion of a secret.
const OAI_PIXEL_ID = "JYNaH6sMbBUMJWkrfP53rc";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { PreviewLayer } from "@/components/preview/PreviewLayer";
import { BootGate } from "@/components/BootGate";
import { ConsoleEgg } from "@/components/ConsoleEgg";
import { SITE_URL, siteJsonLd } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Naman Parashar · Engineer",
  description:
    "An engineer who likes building products. Loves playing with UI, and has spent a while deep in the voice and video AI space.",
  keywords: [
    "Naman Parashar",
    "software engineer",
    "product engineer",
    "frontend engineer",
    "voice AI",
    "video AI",
    "TypeScript",
    "React",
    "Next.js",
    "Ringg AI",
    "New Delhi",
    "portfolio",
  ],
  authors: [{ name: "Naman Parashar", url: SITE_URL }],
  creator: "Naman Parashar",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Naman Parashar · Engineer",
    description:
      "An engineer who likes building products. Loves UI, deep in voice and video AI.",
    url: SITE_URL,
    siteName: "Naman Parashar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naman Parashar · Engineer",
    description:
      "An engineer who likes building products. Loves UI, deep in voice and video AI.",
    creator: "@nparashar150",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        {/* Person + Organization + WebSite structured data for search + AI answer engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        {/* Mark JS as present (enables the boot reveal gate) and apply the saved
            theme before first paint. Runs synchronously ahead of body content, so
            no-JS agents keep the content visible while JS users get the entrance. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.classList.add('js');if(localStorage.getItem('theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
        <BootGate />
        <ConsoleEgg />
        <Cursor />
        <PreviewLayer />
        {children}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="DeirVMR5+FCfCin7Jdrutw"
          strategy="afterInteractive"
        />
        {/* OpenAI conversion pixel. Loaded through next/script rather than a
            raw tag so it stays out of the critical path — the vendor snippet's
            own async loader would otherwise run during hydration. */}
        <Script id="oai-pixel" strategy="afterInteractive">
          {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:${JSON.stringify(
            OAI_PIXEL_ID,
          )},debug:${process.env.NODE_ENV !== "production"}});`}
        </Script>
      </body>
    </html>
  );
}
