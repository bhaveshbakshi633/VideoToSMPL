import type { TroubleshootItem } from "@/content/troubleshooting";

export function TroubleshootCard({ item }: { item: TroubleshootItem }) {
  return (
    <details className="group rounded-lg border border-border bg-bg-elevated">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 hover:bg-bg-subtle">
        <div className="flex-1">
          <p className="font-medium">{item.question}</p>
          <p className="mt-1 font-mono text-xs text-fg-subtle">{item.tag}</p>
        </div>
        <span
          className="mt-1 text-fg-subtle transition-transform group-open:rotate-90"
          aria-hidden
        >
          ›
        </span>
      </summary>
      <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-fg-muted">
        <p>{item.answer}</p>
        {item.fix && (
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg-subtle p-3 font-mono text-xs text-fg">
            <code>{item.fix}</code>
          </pre>
        )}
      </div>
    </details>
  );
}
