/** @type {import('next').NextConfig} */

// Two build modes:
//   NEXT_BUILD_TARGET=pages  → static export for GitHub Pages (no backend,
//                              /app shows the OfflineBanner).
//   (default, local)         → dev/start with rewrites to the FastAPI backend.
const isPagesBuild = process.env.NEXT_BUILD_TARGET === "pages";
const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const basePath = isPagesBuild ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/VideoToSMPL") : "";

const nextConfig = {
  ...(isPagesBuild ? { output: "export" } : {}),
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhaveshbakshi633.github.io/VideoToSMPL",
    NEXT_PUBLIC_REPO_URL:
      process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/bhaveshbakshi633/VideoToSMPL",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Rewrites are only honored in dev/start mode. `output: export` ignores them,
  // which is fine — Pages has no backend, the OfflineBanner catches it.
  async rewrites() {
    if (isPagesBuild) return [];
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
