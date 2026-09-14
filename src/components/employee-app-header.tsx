"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarCheckIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  MapIcon,
  RouteIcon,
} from "lucide-react"

import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { EventStatusBadge } from "@/components/status-badge"
import { SignOutButton } from "@/features/auth/components"
import type { Event } from "@/features/events/service/events.service"
import type { Registration } from "@/features/registration/service/registration.service"
import { cn } from "@/lib/utils"

interface EmployeeAppHeaderProps {
  event: Event | null
  registration: Registration | null
  user: {
    name?: string | null
    email: string
  }
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

export function EmployeeAppHeader({
  event,
  registration,
  user,
  organizer,
}: EmployeeAppHeaderProps) {
  const pathname = usePathname()
  const registrationPhase = Boolean(
    event &&
    ["registration_open", "registration_closed", "allocation_processing"].includes(event.status),
  )
  const journeyAvailable = Boolean(
    event && ["information_published", "event_started", "event_completed"].includes(event.status),
  )

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2" aria-label="Teamora">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <RouteIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden flex-col sm:flex">
              <span className="text-base font-semibold tracking-tight">Teamora</span>
              <span className="text-xs text-muted-foreground">Cổng thông tin nội bộ</span>
            </span>
          </Link>

          {event && (
            <>
              <ChevronRightIcon className="hidden size-4 text-muted-foreground sm:block" />
              <div className="hidden min-w-0 flex-col lg:flex">
                <span className="truncate text-sm font-medium">{event.name}</span>
                <span className="text-xs text-muted-foreground">Mã kỳ {event.code}</span>
              </div>
            </>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng nhân viên">
          {registrationPhase && (
            <Button asChild variant={pathname === "/register" ? "secondary" : "ghost"} size="lg">
              <Link href="/register">
                <CalendarCheckIcon data-icon="inline-start" />
                {registration ? "Đăng ký của tôi" : "Đăng ký tham gia"}
              </Link>
            </Button>
          )}
          {journeyAvailable ? (
            <Button asChild variant={pathname === "/" ? "secondary" : "ghost"} size="lg">
              <Link href="/">
                <MapIcon data-icon="inline-start" />
                Hành trình
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="lg" disabled>
              <LockKeyholeIcon data-icon="inline-start" />
              Hành trình
            </Button>
          )}
          {organizer && (
            <Button asChild variant="ghost" size="lg">
              <Link href="/admin">
                <LayoutDashboardIcon data-icon="inline-start" />
                Quản trị
              </Link>
            </Button>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {event && (
            <div className="hidden xl:block">
              <EventStatusBadge status={event.status} />
            </div>
          )}
          <ThemeToggleButton />
          <div className="hidden items-center gap-2 border-l pl-3 sm:flex">
            <Avatar>
              <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="hidden max-w-40 flex-col xl:flex">
              <span className="truncate text-sm font-medium">{user.name || "CBNV"}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      <nav
        className="mx-auto flex min-h-12 w-full max-w-7xl flex-wrap items-center gap-1 border-t px-4 md:hidden"
        aria-label="Điều hướng nhân viên trên điện thoại"
      >
        {registrationPhase && (
          <Link
            href="/register"
            aria-current={pathname === "/register" ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium",
              pathname === "/register" ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            <CalendarCheckIcon className="size-4" aria-hidden="true" />
            Đăng ký
          </Link>
        )}
        {journeyAvailable ? (
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium",
              pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            <MapIcon className="size-4" aria-hidden="true" />
            Hành trình
          </Link>
        ) : (
          <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground">
            <LockKeyholeIcon className="size-4" aria-hidden="true" />
            Hành trình
          </span>
        )}
        {organizer && (
          <Link
            href="/admin"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground"
          >
            <LayoutDashboardIcon className="size-4" aria-hidden="true" />
            Quản trị
          </Link>
        )}
      </nav>
    </header>
  )
}
