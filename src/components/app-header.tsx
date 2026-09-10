"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { EVENT_NAV, SHARED_NAV, useActiveEvent } from "@/components/app-sidebar"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { eventsListOptions } from "@/features/events/options/events.options"

/**
 * Where you are, derived from the same two nav lists the sidebar renders — one
 * source, so a renamed destination cannot say two different things.
 *
 * On an edition's screens the edition's name is the first crumb, because "Team"
 * on its own is the question an organiser with two open editions keeps having
 * to ask.
 */
export function AppHeader() {
  const pathname = usePathname()
  const { data: events } = useQuery(eventsListOptions())
  const active = useActiveEvent(events?.items)

  const eventCrumb = active
    ? { label: active.name, href: `/admin/events/${active.id}` }
    : undefined

  const eventItems = active
    ? EVENT_NAV.map((item) => ({ ...item, url: item.url.replace(":eventId", active.id) }))
    : []

  // Longest match wins: "/admin" and "/admin/events/:id" are prefixes of the
  // rest, so the shortest would always win a plain filter.
  const match = [...eventItems, ...SHARED_NAV]
    .filter((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))
    .sort((a, b) => b.url.length - a.url.length)[0]

  const inEventSection = eventItems.some((item) => item.url === match?.url)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            {inEventSection && eventCrumb && (
              <>
                <BreadcrumbItem className="hidden min-w-0 sm:block">
                  <BreadcrumbLink asChild>
                    <Link href={eventCrumb.href} className="truncate">
                      {eventCrumb.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{match?.title ?? "Quản trị"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ThemeToggleButton />
    </header>
  )
}
