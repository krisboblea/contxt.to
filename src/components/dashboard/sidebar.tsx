"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FolderOpen, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Contexts", icon: BookOpen, disabled: false },
  { href: "/dashboard/collections", label: "Collections", icon: FolderOpen, disabled: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2, disabled: true },
]

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

function SidebarInner() {
  return (
    <div className="flex h-full flex-col border-r border-[#F0EDE4] bg-white">
      <LogoMark />
      <div className="border-t border-[#F0EDE4] pt-3">
        <NavItems />
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col">
      <SidebarInner />
    </aside>
  )
}

export function MobileSidebarSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0EDE4] bg-white text-[#4A4A6A] hover:bg-[#F5F0E6] transition-colors md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton className="p-0 w-[240px]">
        <SidebarInner />
      </SheetContent>
    </Sheet>
  )
}
