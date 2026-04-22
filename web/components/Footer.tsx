import { siteConfig } from "@/lib/site";

const CV_URL = "https://bhaveshbakshi633.github.io/CV";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex h-12 items-center justify-between gap-4 text-xs text-fg-subtle">
        <span>v{siteConfig.version}</span>
        <div className="flex items-center gap-4">
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg"
            title="Who built this"
          >
            built by <span className="underline-offset-2 hover:underline">bhavesh</span>
          </a>
          <span aria-hidden className="text-border-strong">·</span>
          <a
            href={siteConfig.repoUrl}
            className="hover:text-fg"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT · GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
