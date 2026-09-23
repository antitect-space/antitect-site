import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown written in the CRM — a brief, its requirements, a tutor's feedback
 * — rendered on the server.
 *
 * Raw HTML in the source is ignored rather than rendered, which is the default
 * here and the reason no sanitiser is needed: there is no path from text typed
 * in the CRM to markup running on this page. Nothing enables `rehype-raw`.
 *
 * The styles are set here rather than left to a prose plugin, because this is
 * the only place on the site where somebody else's writing is rendered, and it
 * should still read as this site.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-[62ch] leading-[1.6] [&>*+*]:mt-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="text-title mt-8 text-2xl first:mt-0">{children}</h3>,
          h2: ({ children }) => <h3 className="text-title mt-8 text-xl first:mt-0">{children}</h3>,
          h3: ({ children }) => <h4 className="text-title mt-6 text-lg first:mt-0">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-semibold underline underline-offset-4 hover:no-underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto border-2 border-foreground bg-muted p-4 text-[0.9375rem]">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-foreground pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          hr: () => <hr className="border-t-2 border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
