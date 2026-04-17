import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex h-12 items-center justify-between text-xs text-fg-subtle">
        <span>v{siteConfig.version}</span>
        <a href={siteConfig.repoUrl} className="hover:text-fg" target="_blank" rel="noopener noreferrer">
          MIT · GitHub
        </a>
      </div>
    </footer>
  );
}
