import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { GalaTablesManager } from "@/features/gala/components"
import { prefetchGalaTables } from "@/features/gala/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Sơ đồ bàn Gala" }

export default async function GalaTablesPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireOrganizer()
  const { eventId } = await params
  await prefetchGalaTables(eventId)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được sơ đồ bàn" />}>
          <Suspense fallback={<EntityTableSkeleton columns={5} rows={5} />}>
            <GalaTablesManager eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}
