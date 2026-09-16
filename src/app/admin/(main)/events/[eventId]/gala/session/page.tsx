import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { LockKeyholeIcon } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

import { isPublished } from "@/components/locked-tab"
import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { getEvent } from "@/features/events/service/events.service"
import { GalaSessionManager } from "@/features/gala/components"
import { prefetchGalaSession, prefetchGalaTables } from "@/features/gala/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Phiên chọn ghế Gala" }

export default async function GalaSessionPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireOrganizer()
  const { eventId } = await params
  const event = await getEvent(eventId)

  // Seat state is allocation data: the backend answers 409 before publication,
  // so the page says why instead of rendering an error boundary.
  if (!isPublished(event.status)) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          title="Phiên chọn ghế Gala Dinner"
          description="Bốc thăm thứ tự, mở phiên, theo dõi lượt của từng Team và xếp hộ khi cần."
        />
        <EntityStateView
          icon={<LockKeyholeIcon />}
          title="Mở sau khi công bố thông tin"
          message="Chuẩn bị sơ đồ bàn trước. Phiên chọn ghế chỉ chạy khi kỳ đã công bố."
        />
      </div>
    )
  }

  await Promise.all([prefetchGalaSession(eventId), prefetchGalaTables(eventId)])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được phiên chọn ghế" />}>
          <Suspense fallback={<EntityTableSkeleton columns={4} rows={5} />}>
            <GalaSessionManager eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}
