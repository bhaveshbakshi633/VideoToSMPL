import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { ThemeScript } from "@/components/ThemeScript";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhaveshbakshi633.github.io/VideoToSMPL";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VideoToSMPL — Human video to humanoid motion",
    template: "%s · VideoToSMPL",
  },
  description:
    "Open pipeline that turns any RGB video into SMPL parameters and retargets them to the Unitree G1 humanoid. Runs on your GPU or free Colab — no install required.",
  keywords: [
    "SMPL",
    "GVHMR",
    "motion retargeting",
    "Unitree G1",
    "humanoid",
    "video to motion",
    "robotics",
    "imitation learning",
  ],
  authors: [{ name: "Bhavesh Bakshi" }],
  creator: "Bhavesh Bakshi",
  openGraph: {
    title: "VideoToSMPL — Human video to humanoid motion",
    description:
      "Open pipeline: video → SMPL → Unitree G1. Colab (free GPU) or BYO-GPU local.",
    url: SITE_URL,
    siteName: "VideoToSMPL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoToSMPL",
    description: "Video → SMPL → G1 robot motion. Free-GPU Colab + local pipeline.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 animate-fade-in">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
