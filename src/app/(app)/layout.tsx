import { EmployeeAppHeader } from "@/components/employee-app-header"
import { getMyEmployeeProfile } from "@/features/employees/service/employees.service"
import { EventProvider } from "@/features/events/components/event-provider"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { getMyRegistration } from "@/features/registration/service/registration.service"
import { isOrganizer, requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * The employee shell. Gates once here for the whole subtree; the pages below do
 * not repeat it.
 *
 * `EventProvider` — the current event plus the caller's own registration — lands
 * here in S1, once there is an `event` table to read.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()
  const [event, employee] = await Promise.all([getCurrentEvent(), getMyEmployeeProfile()])
  const registration = event ? await getMyRegistration(event.id) : null

  return (
    <EventProvider value={{ event, registration, employee }}>
      <div className="flex min-h-svh flex-col bg-muted/30">
        <EmployeeAppHeader
          event={event}
          registration={registration}
          user={{ name: user.name, email: user.email }}
          organizer={isOrganizer(user)}
        />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
        <footer className="border-t bg-background px-4 py-4 text-center text-xs text-muted-foreground">
          Teamora · Nguồn thông tin chính thức từ Ban Tổ chức
        </footer>
      </div>
    </EventProvider>
  )
}
