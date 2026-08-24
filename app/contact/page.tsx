import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";
import { contactContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${contactContent.title} · Engineer`,
  description: contactContent.description,
  alternates: { canonical: `${SITE_URL}${contactContent.path}` },
  openGraph: {
    title: contactContent.title,
    description: contactContent.description,
    url: `${SITE_URL}${contactContent.path}`,
    type: "website",
  },
};

export default function ContactPage() {
  return <TrustPage content={contactContent} />;
}
