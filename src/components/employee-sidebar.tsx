"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BedDoubleIcon,
  BellRingIcon,
  BusIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  PartyPopperIcon,
  PlaneIcon,
  RouteIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react"

import { LOCKED_MESSAGE } from "@/components/locked-tab"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface EmployeeNavItem {
  title: string
  icon: LucideIcon
  url: string
  /** Allocation tabs: dimmed with a lock until `information_published` (S7-SPEC §B1). */
  lockedBeforePublish: boolean
}

export const EMPLOYEE_NAV: EmployeeNavItem[] = [
  { title: "Tổng quan", icon: LayoutDashboardIcon, url: "/", lockedBeforePublish: false },
  { title: "Hồ sơ", icon: UserRoundIcon, url: "/profile", lockedBeforePublish: false },
  { title: "Đăng ký", icon: ClipboardCheckIcon, url: "/register", lockedBeforePublish: false },
  { title: "Chuyến bay", icon: PlaneIcon, url: "/flights", lockedBeforePublish: true },
  { title: "Xe đưa đón", icon: BusIcon, url: "/transport", lockedBeforePublish: true },
  { title: "Khách sạn", icon: BedDoubleIcon, url: "/hotel", lockedBeforePublish: true },
  { title: "Gala Dinner", icon: PartyPopperIcon, url: "/gala", lockedBeforePublish: true },
  { title: "Lịch trình", icon: CalendarDaysIcon, url: "/schedule", lockedBeforePublish: true },
  { title: "Thông báo", icon: BellRingIcon, url: "/announcements", lockedBeforePublish: false },
]

/**
 * Locked tabs stay in the menu and stay clickable: the page behind them renders
 * the same empty state, and never fetches allocation data. Hiding them would
 * make people ask where their flight is; disabling them would hide the answer.
 */
export function EmployeeSidebar({ published }: { published: boolean }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton asChild className="h-10">
            <Link href="/" prefetch>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <RouteIcon className="size-3" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Teamora</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {EMPLOYEE_NAV.map((item) => {
                const locked = item.lockedBeforePublish && !published
                const link = (
                  <Link
                    href={item.url}
                    prefetch
                    onClick={() => setOpenMobile(false)}
                    className={locked ? "opacity-60" : undefined}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    {locked && (
                      <LockKeyholeIcon
                        className="ml-auto size-3.5 text-sidebar-foreground/60"
                        aria-label={LOCKED_MESSAGE}
                      />
                    )}
                  </Link>
                )
                return (
                  <SidebarMenuItem key={item.url}>
                    {locked ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild isActive={pathname === item.url}>
                            {link}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">{LOCKED_MESSAGE}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                      >
                        {link}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
