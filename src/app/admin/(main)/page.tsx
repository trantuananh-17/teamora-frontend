import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import {
  EventsContainer,
  EventsError,
  EventsLoading,
  EventsTable,
} from "@/features/events/components"
import { prefetchEvents } from "@/features/events/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Kỳ Team Building" }

export default async function AdminHomePage() {
  // First line of every page under admin/. The layout is a plain shell and gates
  // nothing, so this is the gate — and the backend checks again regardless.
  await requireOrganizer()
  await prefetchEvents()

  return (
    <EventsContainer>
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EventsError />}>
          <Suspense fallback={<EventsLoading />}>
            <EventsTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </EventsContainer>
  )
}
