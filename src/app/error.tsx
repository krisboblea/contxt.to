"use client"

import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FCF9F2", color: "#16163D", fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="text-center max-w-md">
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(72px, 16vw, 120px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#FF2A6D",
            marginBottom: 8,
          }}
        >
          500
        </div>
        <h1
          style={{
            fontSize: "clamp(20px, 2vw, 24px)",
            fontWeight: 700,
            marginBottom: 12,
            color: "#16163D",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#4A4A6A",
            marginBottom: 32,
            maxWidth: 360,
            margin: "0 auto 32px",
          }}
        >
          An unexpected error occurred. Our team has been notified. Please try again,
          or head back to the home page.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#FF2A6D",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(255, 42, 109, 0.25)",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E61D5C"
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(255, 42, 109, 0.35)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FF2A6D"
              e.currentTarget.style.transform = "none"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 42, 109, 0.25)"
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 28px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              color: "#4A4A6A",
              background: "#FFF",
              border: "1px solid #F0EDE4",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF2A6D"
              e.currentTarget.style.color = "#FF2A6D"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#F0EDE4"
              e.currentTarget.style.color = "#4A4A6A"
            }}
          >
            Back to Contxt
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p
            style={{
              marginTop: 32,
              padding: 16,
              borderRadius: 12,
              background: "#FFF",
              border: "1px solid #F0EDE4",
              fontSize: 12,
              color: "#8B8BA8",
              textAlign: "left",
              fontFamily: "'JetBrains Mono', monospace",
              wordBreak: "break-word",
            }}
          >
            {error.message}
            {error.digest && (
              <>
                <br />
                Digest: {error.digest}
              </>
            )}
          </p>
        )}
      </div>
    </main>
  )
}
