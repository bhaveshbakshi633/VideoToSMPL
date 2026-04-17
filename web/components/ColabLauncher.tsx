import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site";

interface Props {
  notebook: string;
  label?: string;
  className?: string;
}

/**
 * Colab can load notebooks from a public GitHub URL via:
 *   https://colab.research.google.com/github/<owner>/<repo>/blob/<branch>/<path>
 *
 * For PRIVATE repos, users paste the notebook's raw URL with a PAT or use
 * Colab's GitHub sign-in. We default to the public-URL form and the notebook
 * itself handles private-clone auth via Colab Secrets if needed.
 */
export function ColabLauncher({ notebook, label = "Open in Colab", className }: Props) {
  const url = `https://colab.research.google.com/github/${siteConfig.repoSlug}/blob/main/notebooks/${notebook}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "btn-primary"}
      data-plausible-event-name="colab_launch"
      data-plausible-event-notebook={notebook}
    >
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
