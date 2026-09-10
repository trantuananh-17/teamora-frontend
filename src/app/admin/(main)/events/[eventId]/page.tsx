import { Suspense } from "react"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventStatusControl } from "@/features/events/components"
import { prefetchEvent } from "@/features/events/server/prefetch"
import { PickupPointsPanel } from "@/features/pickup-points/components"
import { prefetchPickupPoints } from "@/features/pickup-points/server/prefetch"
import { TeamsPanel } from "@/features/teams/components"
import { prefetchTeams } from "@/features/teams/server/prefetch"
import { prefetchWorkLocations } from "@/features/work-locations/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { user } = await requireOrganizer()
  const { eventId } = await params

  // All three are small and all three are on this screen, so they are warmed
  // together rather than each paying its own round trip after hydration.
  await Promise.all([
    prefetchEvent(eventId),
    prefetchTeams(eventId),
    prefetchPickupPoints(eventId),
    prefetchWorkLocations(),
  ])

  // UX only. Reverting is refused by the backend for anyone but a super_admin,
  // whatever this renders.
  const canRevert = user.role === "super_admin"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        back={{ href: "/admin", label: "Kỳ Team Building" }}
        title="Cấu hình kỳ"
        description="Trạng thái kỳ quyết định CBNV làm được gì — không phải vai trò của họ."
      />

      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được kỳ này" />}>
          <Suspense fallback={<div className="h-24 animate-pulse rounded-lg border" />}>
            <EventStatusControl eventId={eventId} canRevert={canRevert} />
          </Suspense>
        </ErrorBoundary>

        <Tabs defaultValue="teams">
          <TabsList>
            <TabsTrigger value="teams">Team / Bộ phận</TabsTrigger>
            <TabsTrigger value="pickup-points">Điểm đón</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="pt-4">
            <ErrorBoundary fallback={<EntityStateView title="Không tải được danh sách Team" />}>
              <Suspense fallback={<EntityTableSkeleton columns={4} rows={5} />}>
                <TeamsPanel eventId={eventId} />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="pickup-points" className="pt-4">
            <ErrorBoundary fallback={<EntityStateView title="Không tải được điểm đón" />}>
              <Suspense fallback={<EntityTableSkeleton columns={5} rows={5} />}>
                <PickupPointsPanel eventId={eventId} />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </HydrationBoundary>
    </div>
  )
}
