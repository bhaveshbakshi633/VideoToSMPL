import { codeToHtml } from "shiki";

interface Props {
  code: string;
  language?: string;
  theme?: { light: string; dark: string };
}

/** Server-rendered code block with dual light/dark themes via Shiki. */
export async function CodeBlock({
  code,
  language = "bash",
  theme = { light: "github-light", dark: "github-dark-dimmed" },
}: Props) {
  const html = await codeToHtml(code, {
    lang: language,
    themes: { light: theme.light, dark: theme.dark },
    defaultColor: false,
  });
  return <div className="mt-4" dangerouslySetInnerHTML={{ __html: html }} />;
}
