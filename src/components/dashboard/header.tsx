"use client"

import { MobileSidebarSheet } from "@/components/dashboard/sidebar"

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

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16163D] text-white text-xs font-semibold leading-none hover:opacity-80 transition-opacity"
          aria-label="User menu"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
