import type { Metadata } from "next";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import { Cursor } from "@/components/Cursor";
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
  title: "Naman Parashar — Frontend & Product Engineer",
  description:
    "Day-zero engineer building AI-first web products from scratch. Currently deep in voice AI at ringg.ai.",
  metadataBase: new URL("https://nparashar150.dev"),
