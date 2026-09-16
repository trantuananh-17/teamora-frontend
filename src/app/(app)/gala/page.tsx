import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Loader2Icon } from "lucide-react"

import { isPublished, LockedTab, NoEventTab } from "@/components/locked-tab"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { GalaEmployeeView } from "@/features/gala/components"
import { prefetchGalaSession, prefetchGalaTables } from "@/features/gala/server/prefetch"
import { requireAuth } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Gala Dinner" }

export default async function GalaPage() {
  await requireAuth()
  const event = await getCurrentEvent()
  if (!event) return <NoEventTab />
  if (!isPublished(event.status)) return <LockedTab />

  await Promise.all([prefetchGalaSession(event.id), prefetchGalaTables(event.id)])

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <GalaEmployeeView eventId={event.id} />
      </Suspense>
    </HydrationBoundary>
  )
}
