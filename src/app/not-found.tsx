"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FCF9F2", color: "#16163D", fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="text-center max-w-md">
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(96px, 20vw, 160px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#FF2A6D",
            marginBottom: 8,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: "clamp(20px, 2vw, 24px)",
            fontWeight: 700,
            marginBottom: 12,
            color: "#16163D",
          }}
        >
          This page doesn&apos;t exist
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
          The link might be broken, the page might have been removed, or you may have
          mistyped the URL.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "#FF2A6D",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(255, 42, 109, 0.25)",
            transition: "all 0.2s",
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Contxt
        </Link>
      </div>
    </main>
  )
}
