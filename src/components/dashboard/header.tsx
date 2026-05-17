"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Contexts", disabled: false },
  { href: "/dashboard/collections", label: "Collections", disabled: true },
  { href: "/dashboard/analytics", label: "Analytics", disabled: true },
]

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

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
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
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <MobileNavSheet user={user} />

        {/* Logo (desktop) */}
        <a href="/" className="hidden md:flex items-center gap-2 no-underline">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#FF2A6D] text-white text-[12px] font-extrabold leading-none select-none">
            c
          </span>
          <span
            className="text-[#16163D] text-base font-bold leading-none tracking-[-0.02em] italic select-none"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Contxt
          </span>
        </a>

        {/* Desktop nav tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {navItems.map(({ href, label, disabled }) => {
            const isActive = !disabled && pathname === href
            return (
              <Link
                key={href}
                href={disabled ? "#" : href}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? "bg-[rgba(255,42,109,0.06)] text-[#FF2A6D]"
                    : disabled
                      ? "text-[#C4C0B6] pointer-events-none"
                      : "text-[#4A4A6A] hover:bg-[#F5F0E6]"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: notification + user */}
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

        {/* User initials */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16163D] text-white text-xs font-semibold leading-none hover:opacity-80 transition-opacity"
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

/** Mobile-only hamburger sheet with nav items + user profile */
function MobileNavSheet({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const initials = getInitials(user.name, user.email)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0EDE4] bg-white text-[#4A4A6A] hover:bg-[#FF2A6D] hover:text-white hover:border-[#FF2A6D] transition-all duration-200 md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="!w-[280px] p-0 bg-white border-r border-[#F0EDE4]"
      >
        <div className="flex items-center justify-between border-b border-[#F0EDE4] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#FF2A6D] text-white text-[14px] font-extrabold leading-none select-none">
              c
            </span>
            <span
              className="text-[#16163D] text-xl font-bold leading-none tracking-[-0.02em] italic select-none"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Contxt
            </span>
          </div>
          <SheetClose
            render={
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B8BA8] hover:bg-[#F5F0E6] hover:text-[#4A4A6A] transition-colors"
                aria-label="Close navigation"
              />
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </SheetClose>
        </div>
        <div className="flex h-[calc(100%-73px)] flex-col px-3 pt-4">
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, disabled }) => {
              const isActive = !disabled && pathname === href
              return (
                <Link
                  key={href}
                  href={disabled ? "#" : href}
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? "bg-[rgba(255,42,109,0.06)] text-[#FF2A6D]"
                      : disabled
                        ? "text-[#C4C0B6] pointer-events-none"
                        : "text-[#4A4A6A] hover:bg-[#F5F0E6]"
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          {/* Mobile: user profile at bottom */}
          <div className="mt-auto border-t border-[#F0EDE4] pt-3 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16163D] text-white text-xs font-semibold leading-none">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#16163D] truncate leading-tight">
                  {user.name || "User"}
                </p>
                <p className="text-[10px] text-[#8B8BA8] truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { signOut({ callbackUrl: "/" }) }}
              className="w-full text-left mt-2 px-3 py-2 rounded-lg text-xs font-medium text-[#FF2A6D] hover:bg-[#F5F0E6] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
