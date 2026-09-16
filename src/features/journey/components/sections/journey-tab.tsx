import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { isPublished, LockedTab, NoEventTab, NotRegisteredTab } from "@/components/locked-tab"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { getMyRegistration } from "@/features/registration/service/registration.service"

/**
 * Server-side gate shared by every allocation tab. Before publication it renders
 * the locked empty state and never mounts the section, so no journey request is
 * made — the data must not leak before `information_published` (security.md).
 * The section itself reads the layout-prefetched `journeyOptions` query.
 */
export async function JourneyTab({ render }: { render: (eventId: string) => React.ReactNode }) {
  const event = await getCurrentEvent()
  if (!event) return <NoEventTab />
  if (!isPublished(event.status)) return <LockedTab />
  if (!(await getMyRegistration(event.id))) return <NotRegisteredTab />

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      {render(event.id)}
    </Suspense>
  )
}
