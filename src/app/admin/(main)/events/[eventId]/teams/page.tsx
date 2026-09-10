import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { TeamsPanel } from "@/features/teams/components"
import { prefetchTeams } from "@/features/teams/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Team / Bộ phận" }

export default async function EventTeamsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireOrganizer()
  const { eventId } = await params
  await prefetchTeams(eventId)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Team / Bộ phận"
        description="CBNV chọn Team từ danh sách này khi đăng ký. Import CBNV chỉ nhận Team dùng chung."
      />
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được danh sách Team" />}>
          <Suspense fallback={<EntityTableSkeleton columns={4} rows={5} />}>
            <TeamsPanel eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}
