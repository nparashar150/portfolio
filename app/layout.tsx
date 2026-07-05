import type { Metadata } from "next";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { PreviewLayer } from "@/components/preview/PreviewLayer";
import { BootGate } from "@/components/BootGate";
import { ConsoleEgg } from "@/components/ConsoleEgg";
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
  title: "Naman Parashar · Engineer",
  description:
    "An engineer who likes building products. Loves playing with UI, and has spent a while deep in the voice AI space.",
  metadataBase: new URL("https://nparashar150.dev"),
  openGraph: {
    title: "Naman Parashar · Engineer",
    description:
      "An engineer who likes building products. Loves UI, deep in voice AI.",
    type: "website",
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
        {/* apply the saved theme before first paint, no flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light')document.documentElement.dataset.theme='light'}catch(e){}",
          }}
        />
        <BootGate />
        <ConsoleEgg />
        <Cursor />
        <PreviewLayer />
        {children}
      </body>
    </html>
  );
}
