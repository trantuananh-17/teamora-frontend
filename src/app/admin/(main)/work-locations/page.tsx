import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { WorkLocationsContainer, WorkLocationsTable } from "@/features/work-locations/components"
import { prefetchWorkLocations } from "@/features/work-locations/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Địa điểm làm việc" }

export default async function WorkLocationsPage() {
  await requireOrganizer()
  await prefetchWorkLocations()

  return (
    <WorkLocationsContainer>
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được danh sách địa điểm" />}>
          <Suspense fallback={<EntityTableSkeleton columns={3} rows={4} />}>
            <WorkLocationsTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </WorkLocationsContainer>
  )
}
