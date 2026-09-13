import { Suspense } from "react"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { DownloadIcon } from "lucide-react"

import { EntityStateView } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EventStatusControl } from "@/features/events/components"
import { DashboardOverview } from "@/features/journey/components/dashboard-overview"
import { prefetchDashboard } from "@/features/journey/server/prefetch"
import { prefetchEvent } from "@/features/events/server/prefetch"
import { prefetchEmployees } from "@/features/employees/server/prefetch"
import { prefetchPickupPoints } from "@/features/pickup-points/server/prefetch"
import { prefetchTeams } from "@/features/teams/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"
import { apiUrl } from "@/lib/ky"

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { user } = await requireOrganizer()
  const { eventId } = await params

  await Promise.all([
    prefetchEvent(eventId),
    prefetchTeams(eventId),
    prefetchPickupPoints(eventId),
    prefetchEmployees(),
    prefetchDashboard(eventId),
  ])

  // UX only. Reverting is refused by the backend for anyone but a super_admin,
  // whatever this renders.
  const canRevert = user.role === "super_admin"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Tổng quan kỳ"
        description="Trạng thái kỳ quyết định CBNV làm được gì — không phải vai trò của họ."
        actions={
          <Button size="sm" variant="outline" asChild>
            <a href={apiUrl(`events/${eventId}/export`)}>
              <DownloadIcon />
              Xuất toàn bộ dữ liệu
            </a>
          </Button>
        }
      />

      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được kỳ này" />}>
          <Suspense fallback={<Skeleton className="h-28 w-full rounded-lg" />}>
            <EventStatusControl eventId={eventId} canRevert={canRevert} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<EntityStateView title="Không tải được số liệu" />}>
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
              </div>
            }
          >
            <DashboardOverview eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}
