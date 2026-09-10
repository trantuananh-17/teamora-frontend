import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { PickupPointsPanel } from "@/features/pickup-points/components"
import { prefetchPickupPoints } from "@/features/pickup-points/server/prefetch"
import { prefetchWorkLocations } from "@/features/work-locations/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Điểm đón" }

export default async function EventPickupPointsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireOrganizer()
  const { eventId } = await params
  // The panel needs the office list to label and to filter by, so both are
  // warmed together rather than the second arriving after hydration.
  await Promise.all([prefetchPickupPoints(eventId), prefetchWorkLocations()])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Điểm đón"
        description="Điểm tập trung cho bốn chặng xe (§4.5). Thuộc riêng kỳ này."
      />
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được điểm đón" />}>
          <Suspense fallback={<EntityTableSkeleton columns={5} rows={5} />}>
            <PickupPointsPanel eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}
