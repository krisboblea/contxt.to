"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FolderOpen, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Contexts", icon: BookOpen, disabled: false },
  { href: "/dashboard/collections", label: "Collections", icon: FolderOpen, disabled: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2, disabled: true },
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

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span
        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#FF2A6D] text-white text-[14px] font-extrabold leading-none select-none"
      >
        c
      </span>
      <span
        className="text-[#16163D] text-xl font-bold leading-none tracking-[-0.02em] italic select-none"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Contxt
      </span>
    </div>
  )
}

function NavItems() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map(({ href, label, icon: Icon, disabled }) => {
        const isActive = !disabled && pathname === href
        return (
          <Link
            key={href}
            href={disabled ? "#" : href}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[rgba(255,42,109,0.06)] text-[#FF2A6D]"
                : "text-[#4A4A6A] hover:bg-[#F5F0E6] hover:text-[#16163D]",
              disabled && "pointer-events-none opacity-40"
            )}
          >
            <Icon
              size={17}
              className={isActive ? "text-[#FF2A6D]" : "text-[#8B8BA8]"}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

interface SidebarUserProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function SidebarUser({ user }: SidebarUserProps) {
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
    <div ref={menuRef} className="relative border-t border-[#F0EDE4] px-3 py-3">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F0E6] transition-colors"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16163D] text-white text-xs font-semibold leading-none">
          {initials}
        </span>
        <span className="truncate text-left">
          <span className="block text-xs font-semibold text-[#16163D] truncate leading-tight">
            {user.name || "User"}
          </span>
          <span className="block text-[10px] text-[#8B8BA8] truncate leading-tight">
            {user.email}
          </span>
        </span>
      </button>

      {menuOpen && (
        <div
          className="absolute bottom-full left-3 right-3 mb-1.5 rounded-lg border border-[#F0EDE4] bg-white py-1 shadow-lg z-50"
          style={{ boxShadow: "0 8px 24px rgba(22, 22, 61, 0.1)" }}
        >
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
  )
}

function SidebarInner({ user }: SidebarUserProps) {
  return (
    <div className="flex h-full flex-col border-r border-[#F0EDE4] bg-white">
      <LogoMark />
      <div className="flex-1 border-t border-[#F0EDE4] pt-3">
        <NavItems />
      </div>
      <SidebarUser user={user} />
    </div>
  )
}

interface DashboardSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col">
      <SidebarInner user={user} />
    </aside>
  )
}

export function MobileSidebarSheet({ user }: DashboardSidebarProps) {
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
          <LogoMark />
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
        <div className="flex h-[calc(100%-73px)] flex-col">
          <div className="px-3 pt-4 flex-1">
            <NavItems />
          </div>
          <SidebarUser user={user} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
