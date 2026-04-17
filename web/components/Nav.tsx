import Link from "next/link";
import { Github } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { href: "/demo", label: "Demos" },
  { href: "/docs/quickstart", label: "Quickstart" },
  { href: "/docs/troubleshooting", label: "Troubleshoot" },
  { href: "/docs/architecture", label: "Architecture" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-accent to-accent-hover" aria-hidden />
          VideoToSMPL
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-fg-muted hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="rounded-md p-2 text-fg-muted hover:bg-bg-subtle hover:text-fg"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}
