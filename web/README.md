# web/

Static Next.js site for [VideoToSMPL](../README.md), exported to `out/` and served via GitHub Pages.

## Scripts

```bash
pnpm dev           # local dev server on :3000
pnpm build         # static export to out/
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm format        # prettier --write .
```

## Env vars

| Variable                            | Purpose                                                | Default                                               |
|-------------------------------------|--------------------------------------------------------|-------------------------------------------------------|
| `NEXT_PUBLIC_SITE_URL`              | Canonical URL (sitemap, OG)                            | `https://bhaveshbakshi633.github.io/VideoToSMPL`      |
| `NEXT_PUBLIC_BASE_PATH`             | URL sub-path (set `""` for custom domain)              | `/VideoToSMPL`                                        |
| `NEXT_PUBLIC_REPO_URL`              | GitHub repo URL                                        | `https://github.com/bhaveshbakshi633/VideoToSMPL`     |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`      | Optional — enable Plausible analytics                  | unset                                                 |
| `NEXT_PUBLIC_CF_BEACON_TOKEN`       | Optional — enable Cloudflare Web Analytics             | unset                                                 |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`      | Optional — Umami website id                            | unset                                                 |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL`      | Optional — Umami script endpoint                       | unset                                                 |

If no analytics env is set, zero tracking happens. See `components/Analytics.tsx`.

## Directory map

```
app/                    # Next.js App Router routes
  page.tsx              # landing
  demo/                 # gallery
  docs/[slug]/          # renders ../docs/*.md via shiki
  playground/           # WBC placeholder
components/             # UI building blocks
content/                # typed content (demos.json, troubleshooting.ts)
lib/                    # site config, markdown renderer
public/                 # static assets (videos live in demos/, hero in assets/)
```
