import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhaveshbakshi633.github.io/VideoToSMPL";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/demo", "/docs/quickstart", "/docs/local-setup", "/docs/troubleshooting"];
  return paths.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
