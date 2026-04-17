/** @type {import('next').NextConfig} */

// Static export for GitHub Pages. Served from /VideoToSMPL/ subpath unless
// NEXT_PUBLIC_BASE_PATH overrides (e.g. "" for custom domain).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/VideoToSMPL";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: { typedRoutes: false },
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhaveshbakshi633.github.io/VideoToSMPL",
    NEXT_PUBLIC_REPO_URL:
      process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/bhaveshbakshi633/VideoToSMPL",
  },
};

export default nextConfig;
