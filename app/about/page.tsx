import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";
import { aboutContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${aboutContent.title} · Engineer`,
  description: aboutContent.description,
  alternates: { canonical: `${SITE_URL}${aboutContent.path}` },
  openGraph: {
    title: aboutContent.title,
    description: aboutContent.description,
    url: `${SITE_URL}${aboutContent.path}`,
    type: "profile",
  },
};

export default function AboutPage() {
  return <TrustPage content={aboutContent} />;
}
