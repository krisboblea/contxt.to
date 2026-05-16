"use client"

import { useState, useRef, useEffect } from "react"
import { MobileSidebarSheet } from "@/components/dashboard/sidebar"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "?"
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const initials = getInitials(user.name, user.email)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#F0EDE4] bg-white px-4 md:px-6">
      <MobileSidebarSheet />
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0EDE4] text-[#4A4A6A] hover:bg-[#F5F0E6] transition-colors"
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6v2.5L2 10v.5h12V10l-1.5-1.5V6C12.5 3.515 10.485 1.5 8 1.5ZM6.5 12.5a1.5 1.5 0 0 0 3 0"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF2A6D] text-[9px] font-bold text-white leading-none select-none">
            2
          </span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16163D] text-white text-sm font-semibold leading-none hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 rounded-lg border border-[#F0EDE4] bg-white py-1 shadow-lg z-50"
              style={{ boxShadow: "0 8px 24px rgba(22, 22, 61, 0.1)" }}
            >
              <div className="px-3 py-2 border-b border-[#F0EDE4]">
                <p className="text-xs font-semibold text-[#16163D] leading-tight truncate">
                  {user.name || "User"}
                </p>
                <p className="text-[10px] text-[#8B8BA8] truncate">{user.email}</p>
              </div>
              <Link
                href="/"
                className="block px-3 py-2 text-xs text-[#4A4A6A] hover:bg-[#F5F0E6] transition-colors no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-xs text-[#4A4A6A] hover:bg-[#F5F0E6] transition-colors no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { signOut({ callbackUrl: "/" }) }}
                className="w-full text-left px-3 py-2 text-xs text-[#FF2A6D] hover:bg-[#F5F0E6] transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
