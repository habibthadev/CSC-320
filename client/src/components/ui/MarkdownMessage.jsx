import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

const MarkdownMessage = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          pre: ({ children, ...props }) => (
            <pre
              className="overflow-x-auto rounded-lg bg-muted text-sm"
              {...props}
            >
              {children}
            </pre>
          ),

          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          ),

          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse border border-border"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              className="border border-border bg-muted px-4 py-2 text-left font-semibold"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>
              {children}
            </td>
          ),

          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 space-y-1" {...props}>
              {children}
            </ol>
          ),

          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-xl font-semibold mb-3 text-foreground"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-lg font-semibold mb-2 text-foreground"
              {...props}
            >
              {children}
            </h3>
          ),

          p: ({ children, ...props }) => (
            <p className="mb-4 leading-relaxed text-foreground" {...props}>
              {children}
            </p>
          ),

          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
