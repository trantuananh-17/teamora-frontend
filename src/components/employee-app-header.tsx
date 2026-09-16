"use client"

import Link from "next/link"
import { LayoutDashboardIcon, LogOutIcon, UserRoundIcon } from "lucide-react"

import { EventStatusBadge } from "@/components/status-badge"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLogout } from "@/features/auth/hooks/auth.hook"
import type { Event } from "@/features/events/service/events.service"

interface EmployeeAppHeaderProps {
  event: Event | null
  user: { name?: string | null; email: string }
  organizer: boolean
}

function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email.split("@")[0]
  return source
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("vi")
}

/** Compact bar above every employee tab; navigation lives in `EmployeeSidebar`. */
export function EmployeeAppHeader({ event, user, organizer }: EmployeeAppHeaderProps) {
  const logout = useLogout()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        {event ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{event.name}</span>
            <EventStatusBadge status={event.status} />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Chưa có kỳ hiện hành</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggleButton />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 items-center gap-2 rounded-md px-1 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label="Tài khoản"
            >
              <Avatar>
                <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{user.name || "CBNV"}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRoundIcon />
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            {organizer && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboardIcon />
                  Quản trị
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout.mutate()} disabled={logout.isPending}>
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
