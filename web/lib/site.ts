export const siteConfig = {
  name: "VideoToSMPL",
  version: "0.1.0",
  description: "Video → SMPL → Unitree G1 motion pipeline.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhaveshbakshi633.github.io/VideoToSMPL",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/VideoToSMPL",
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/bhaveshbakshi633/VideoToSMPL",
  repoSlug: "bhaveshbakshi633/VideoToSMPL",
} as const;
