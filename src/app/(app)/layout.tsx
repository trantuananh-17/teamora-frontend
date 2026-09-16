import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { EmployeeAppHeader } from "@/components/employee-app-header"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { isPublished } from "@/components/locked-tab"
import { RagentaWidget } from "@/components/ragenta-widget"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getMyEmployeeProfile } from "@/features/employees/service/employees.service"
import { EventProvider } from "@/features/events/components/event-provider"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { prefetchJourney } from "@/features/journey/server/prefetch"
import { getMyRegistration } from "@/features/registration/service/registration.service"
import { getQueryClient } from "@/lib/get-query-client"
import { isOrganizer, requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * The employee shell. Gates once here for the whole subtree; the pages below
 * only repeat the (cached) session read.
 *
 * `EventProvider` carries the current event, the caller's registration and
 * profile. Once published, the journey is warmed here too: every tab reads the
 * same `journeyOptions` query, so one prefetch serves all of them (S7-SPEC §B1).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()
  const [event, employee] = await Promise.all([getCurrentEvent(), getMyEmployeeProfile()])
  const registration = event ? await getMyRegistration(event.id) : null
  const published = Boolean(event && isPublished(event.status))
  // Not for the unregistered: the backend answers 404 for them, and a cached
  // failure is worse than no cache.
  if (event && published && registration) await prefetchJourney(event.id)

  return (
    <EventProvider value={{ event, registration, employee }}>
      <SidebarProvider>
        <EmployeeSidebar published={published} />
        <SidebarInset className="flex min-h-svh min-w-0 flex-col bg-muted/30">
          <EmployeeAppHeader
            event={event}
            user={{ name: user.name, email: user.email }}
            organizer={isOrganizer(user)}
          />
          <HydrationBoundary state={dehydrate(getQueryClient())}>
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </div>
          </HydrationBoundary>
          <footer className="border-t bg-background px-4 py-4 text-center text-xs text-muted-foreground">
            Teamora · Nguồn thông tin chính thức từ Ban Tổ chức
          </footer>
        </SidebarInset>
        <RagentaWidget user={user} />
      </SidebarProvider>
    </EventProvider>
  )
}
