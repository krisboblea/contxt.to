"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"

interface LegalPageProps {
  title: string
  content: string
}

export function LegalPage({ title, content }: LegalPageProps) {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#FCF9F2", color: "#16163D", fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b"
        style={{
          background: "rgba(252, 249, 242, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "#F0EDE4",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: 24,
            fontWeight: 700,
            color: "#16163D",
            letterSpacing: "-0.02em",
          }}
        >
          <span
            className="w-[30px] h-[30px] flex items-center justify-center text-white text-[14px] font-extrabold not-italic"
            style={{ background: "#FF2A6D", borderRadius: 8 }}
          >
            c
          </span>
          Contxt
        </Link>
        <Link
          href="/"
          className="text-sm font-medium no-underline transition-colors"
          style={{ color: "#4A4A6A" }}
        >
          ← Back
        </Link>
      </nav>

      {/* Content */}
      <article className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[100px] pb-24">
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(36px, 4vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: "#16163D",
            marginBottom: 8,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 14, color: "#8B8BA8", marginBottom: 48 }}>
          Last updated: May 2026
        </p>

        <div className="legal-content" style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children, ...props }) => (
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(22px, 2vw, 28px)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#16163D",
                    marginTop: 48,
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(17px, 1.3vw, 20px)",
                    fontWeight: 600,
                    color: "#16163D",
                    marginTop: 32,
                    marginBottom: 12,
                  }}
                  {...props}
                >
                  {children}
                </h3>
              ),
              p: ({ children, ...props }) => (
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "#4A4A6A",
                    marginBottom: 16,
                    maxWidth: 680,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                  {...props}
                >
                  {children}
                </p>
              ),
              strong: ({ children, ...props }) => (
                <strong style={{ color: "#16163D", fontWeight: 600 }} {...props}>
                  {children}
                </strong>
              ),
              em: ({ children, ...props }) => (
                <em style={{ color: "#FF2A6D", fontStyle: "italic" }} {...props}>
                  {children}
                </em>
              ),
              ul: ({ children, ...props }) => (
                <ul
                  style={{
                    margin: "12px 0 20px",
                    paddingLeft: 24,
                    listStyle: "disc",
                    color: "#4A4A6A",
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                  {...props}
                >
                  {children}
                </ul>
              ),
              li: ({ children, ...props }) => (
                <li style={{ marginBottom: 4 }} {...props}>
                  {children}
                </li>
              ),
              table: ({ children, ...props }) => (
                <div style={{ overflowX: "auto", margin: "16px 0 24px" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              ),
              th: ({ children, ...props }) => (
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    fontWeight: 600,
                    color: "#16163D",
                    borderBottom: "2px solid #F0EDE4",
                    background: "#FFF",
                    fontSize: 12,
                  }}
                  {...props}
                >
                  {children}
                </th>
              ),
              td: ({ children, ...props }) => (
                <td
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #F0EDE4",
                    color: "#4A4A6A",
                    verticalAlign: "top",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                  {...props}
                >
                  {children}
                </td>
              ),
              hr: ({ ...props }) => (
                <hr
                  style={{
                    border: "none",
                    height: 1,
                    background: "#F0EDE4",
                    margin: "32px 0",
                  }}
                  {...props}
                />
              ),
              code: ({ children, ...props }) => (
                <code
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8em",
                    background: "rgba(255, 42, 109, 0.06)",
                    padding: "0.15em 0.4em",
                    borderRadius: 4,
                    color: "#FF2A6D",
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                  }}
                  {...props}
                >
                  {children}
                </code>
              ),
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  style={{ color: "#FF2A6D", textDecoration: "none", fontWeight: 500, wordBreak: "break-all", overflowWrap: "break-word" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
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
      </article>

      {/* Footer */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-8 border-t text-[13px]"
        style={{ borderColor: "#F0EDE4", color: "#8B8BA8", background: "#FCF9F2" }}
      >
        <span>
          © 2026{" "}
          <Link
            href="/"
            className="no-underline font-medium transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Contxt
          </Link>
        </span>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Terms
          </Link>
          <Link
            href="/contributing"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Contributing
          </Link>
          <Link
            href="/changelog"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Changelog
          </Link>
          <a
            href="mailto:hello@contxt.to"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            Contact
          </a>
          <a
            href="mailto:ai@contxt.to"
            className="no-underline transition-colors"
            style={{ color: "#4A4A6A" }}
          >
            AI Support
          </a>
        </div>
      </footer>
    </main>
  )
}
