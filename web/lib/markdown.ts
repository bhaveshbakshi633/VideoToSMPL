import { codeToHtml } from "shiki";

/**
 * Minimal markdown → HTML renderer. Zero extra runtime deps.
 * Supports: headings, paragraphs, lists, inline code, fenced code (Shiki),
 * bold/italic, links, blockquotes, horizontal rules, tables.
 * Good enough for our ~6 docs; swap to `remark`/`mdx` later if needed.
 */
export async function renderMarkdown(md: string): Promise<string> {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] || "text";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      const html = await codeToHtml(buf.join("\n"), {
        lang,
        themes: { light: "github-light", dark: "github-dark-dimmed" },
        defaultColor: false,
      });
      parts.push(html);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (h) {
      const level = h[1].length;
      const id = slug(h[2]);
      parts.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      parts.push("<hr />");
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      parts.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // Lists (unordered)
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      parts.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Lists (ordered)
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      parts.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Tables (pipe-separated)
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[-:| ]+\|?\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2; // skip delim row
      const rows: string[][] = [];
      while (i < lines.length && /\|/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      parts.push(
        `<table><thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows
            .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
            .join("")}</tbody></table>`,
      );
      continue;
    }

    // Paragraph
    if (line.trim()) {
      const buf: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      parts.push(`<p>${inline(buf.join(" "))}</p>`);
      continue;
    }

    i++; // blank
  }

  return parts.join("\n");
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function inline(s: string): string {
  return escapeHtml(s)
    // code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // italic
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
