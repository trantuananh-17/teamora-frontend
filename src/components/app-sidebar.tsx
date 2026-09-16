"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  BellRingIcon,
  BedDoubleIcon,
  BusIcon,
  BuildingIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClipboardCheckIcon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  HistoryIcon,
  LogOutIcon,
  MapPinIcon,
  PlaneTakeoffIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react"

import { EventStatusBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout } from "@/features/auth/hooks/auth.hook"
import { eventsListOptions } from "@/features/events/options/events.options"
import type { Event } from "@/features/events/service/events.service"

/**
 * The nav is grouped by the organiser's job, not by which table a screen edits
 * (S7-SPEC §B2). Every URL is an existing route — regrouping changed no paths.
 *
 * `:eventId` is substituted with the active edition (ADR-004). Items without it
 * belong to the company across all editions.
 */

export interface NavItem {
  title: string
  icon: typeof CalendarDaysIcon
  /** `:eventId` is substituted with the active edition. */
  url: string
}

export interface NavGroupDef {
  /** Empty for the dashboard group: one item needs no heading. */
  label: string
  items: NavItem[]
}

export const ADMIN_NAV: NavGroupDef[] = [
  {
    label: "",
    items: [
      { title: "Bảng điều khiển kỳ", icon: LayoutDashboardIcon, url: "/admin/events/:eventId" },
    ],
  },
  {
    label: "Đăng ký",
    items: [
      {
        title: "Danh sách đăng ký",
        icon: ClipboardCheckIcon,
        url: "/admin/events/:eventId/registrations",
      },
      { title: "Team / Bộ phận", icon: UsersRoundIcon, url: "/admin/events/:eventId/teams" },
      { title: "Điểm đón", icon: MapPinIcon, url: "/admin/events/:eventId/pickup-points" },
    ],
  },
  {
    label: "Hậu cần",
    items: [
      { title: "Chuyến bay", icon: PlaneTakeoffIcon, url: "/admin/events/:eventId/flights" },
      {
        title: "Phân chuyến bay",
        icon: SparklesIcon,
        url: "/admin/events/:eventId/flights/allocation",
      },
      { title: "Xe đưa đón", icon: BusIcon, url: "/admin/events/:eventId/vehicles" },
      { title: "Phân xe", icon: SparklesIcon, url: "/admin/events/:eventId/vehicles/allocation" },
      {
        title: "Khách sạn & phòng",
        icon: BedDoubleIcon,
        url: "/admin/events/:eventId/accommodations",
      },
    ],
  },
  {
    label: "Gala Dinner",
    items: [
      { title: "Sơ đồ bàn", icon: LayoutGridIcon, url: "/admin/events/:eventId/gala/tables" },
      { title: "Phiên chọn ghế", icon: TimerIcon, url: "/admin/events/:eventId/gala/session" },
    ],
  },
  {
    label: "Truyền thông",
    items: [
      {
        title: "Lịch trình & nội dung",
        icon: CalendarDaysIcon,
        url: "/admin/events/:eventId/content",
      },
      {
        title: "Email & thông báo",
        icon: BellRingIcon,
        url: "/admin/events/:eventId/notifications",
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { title: "Tất cả các kỳ", icon: CalendarDaysIcon, url: "/admin" },
      { title: "Cán bộ nhân viên", icon: UsersIcon, url: "/admin/employees" },
      { title: "Địa điểm làm việc", icon: BuildingIcon, url: "/admin/work-locations" },
      { title: "Nhật ký thay đổi", icon: HistoryIcon, url: "/admin/events/:eventId/audit-log" },
    ],
  },
]

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items)
/** Flat views for the breadcrumb in `app-header.tsx`. */
export const EVENT_NAV: NavItem[] = ALL_ITEMS.filter((item) => item.url.includes(":eventId"))
export const SHARED_NAV: NavItem[] = ALL_ITEMS.filter((item) => !item.url.includes(":eventId"))

/** The edition in the URL, or the newest one when the screen is not scoped to one. */
export function useActiveEvent(events: Event[] | undefined) {
  const pathname = usePathname()
  const fromUrl = /^\/admin\/events\/([^/]+)/.exec(pathname)?.[1]
  if (!events?.length) return undefined
  return events.find((event) => event.id === fromUrl) ?? events[0]
}

function EventSwitcher({ events, active }: { events: Event[]; active: Event }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border bg-background p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {active.code.slice(0, 2).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{active.name}</span>
            <span className="truncate text-xs text-muted-foreground">{active.code}</span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Chuyển kỳ</DropdownMenuLabel>
        {events.map((event) => (
          <DropdownMenuItem key={event.id} asChild>
            <Link href={`/admin/events/${event.id}`} className="flex items-center gap-2">
              <CheckIcon
                className={event.id === active.id ? "size-4" : "size-4 opacity-0"}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{event.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin">Xem tất cả các kỳ</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavGroup({
  group,
  eventId,
  activeUrl,
}: {
  group: NavGroupDef
  eventId?: string
  activeUrl?: string
}) {
  return (
    <SidebarGroup className="py-1">
      {group.label && <SidebarGroupLabel className="h-6">{group.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const url = eventId ? item.url.replace(":eventId", eventId) : item.url
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={url === activeUrl} tooltip={item.title}>
                  <Link href={url} prefetch>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: string | null }
}) {
  const pathname = usePathname()
  const logout = useLogout()

  // Not `useSuspenseQuery`: this renders in the admin shell, which sits above
  // every page's prefetch. Suspending here would hold the whole console back on
  // one list; a skeleton in the switcher costs nothing.
  const { data: events, isPending } = useQuery(eventsListOptions())
  const active = useActiveEvent(events?.items)

  // Longest match wins: "/admin", "/admin/events/:id" and ".../flights" are all
  // prefixes of screens below them, and only one item may light up.
  const activeUrl = ALL_ITEMS.map((item) =>
    active ? item.url.replace(":eventId", active.id) : item.url,
  )
    .filter((url) => pathname === url || pathname.startsWith(`${url}/`))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton asChild className="h-10">
            <Link href="/admin" prefetch>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                T
              </span>
              <span className="text-sm font-semibold tracking-tight">Teamora</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Hidden when the rail is collapsed to icons — there is no room for it,
            and the nav items keep their tooltips. */}
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
          {isPending ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : active && events ? (
            <>
              <EventSwitcher events={events.items} active={active} />
              <EventStatusBadge status={active.status} />
            </>
          ) : (
            <p className="px-2 text-xs text-muted-foreground">
              Chưa có kỳ nào. Tạo kỳ đầu tiên ở “Tất cả các kỳ”.
            </p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => {
          const items = active
            ? group.items
            : group.items.filter((item) => !item.url.includes(":eventId"))
          if (!items.length) return null
          return (
            <NavGroup
              key={group.label || "dashboard"}
              group={{ ...group, items }}
              eventId={active?.id}
              activeUrl={activeUrl}
            />
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Hành trình của tôi">
              <Link href="/">
                <CalendarDaysIcon className="size-4" />
                <span>Hành trình của tôi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-auto py-2"
              tooltip={user.email}
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <LogOutIcon className="size-4 shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
