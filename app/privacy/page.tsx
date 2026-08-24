import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";
import { privacyContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${privacyContent.title} · Naman Parashar`,
  description: privacyContent.description,
  alternates: { canonical: `${SITE_URL}${privacyContent.path}` },
  openGraph: {
    title: privacyContent.title,
    description: privacyContent.description,
    url: `${SITE_URL}${privacyContent.path}`,
    type: "website",
  },
};

export default function PrivacyPage() {
  return <TrustPage content={privacyContent} />;
}
