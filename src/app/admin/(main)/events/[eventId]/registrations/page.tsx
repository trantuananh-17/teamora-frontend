import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { EntityContainer, EntityTableSkeleton } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { getTeams } from "@/features/registration/service/master-data.service"
import { RegistrationStatsCards } from "@/features/registration/components/registration-stats"
import { RegistrationToolbar } from "@/features/registration/components/registration-toolbar"
import { RegistrationsTable } from "@/features/registration/components/registrations-table"
import {
  prefetchRegistrationsList,
  prefetchRegistrationStats,
} from "@/features/registration/server/prefetch-admin"
import type { ListRegistrationsParams } from "@/features/registration/service/registration-admin.service"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

type SearchParams = Record<string, string | string[] | undefined>

export default async function RegistrationsAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<SearchParams>
}) {
  await requireOrganizer()
  const { eventId } = await params
  const raw = await searchParams
  const filters: ListRegistrationsParams = {
    limit: 100,
    offset: 0,
    search: single(raw.search),
    teamId: single(raw.teamId),
    participating: booleanParam(raw.participating),
    shiftPreference: shiftParam(raw.shiftPreference),
    shiftLocked: booleanParam(raw.shiftLocked),
  }

  const [, , teams] = await Promise.all([
    prefetchRegistrationStats(eventId),
    prefetchRegistrationsList(eventId, filters),
    getTeams(eventId),
  ])

  return (
    <EntityContainer
      header={
        <PageHeader
          title="Danh sách đăng ký"
          description="Xem, lọc, xuất dữ liệu và đánh dấu nhóm bắt buộc ca."
        />
      }
      stats={
        <HydrationBoundary state={dehydrate(getQueryClient())}>
          <RegistrationStatsCards eventId={eventId} />
        </HydrationBoundary>
      }
      search={<RegistrationToolbar eventId={eventId} teams={teams} params={filters} />}
    >
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <Suspense fallback={<EntityTableSkeleton columns={6} />}>
          <RegistrationsTable eventId={eventId} params={filters} />
        </Suspense>
      </HydrationBoundary>
    </EntityContainer>
  )
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined
}

function booleanParam(value: string | string[] | undefined): boolean | undefined {
  const parsed = single(value)
  return parsed === "true" ? true : parsed === "false" ? false : undefined
}

function shiftParam(value: string | string[] | undefined): "shift_1" | "shift_2" | undefined {
  const parsed = single(value)
  return parsed === "shift_1" || parsed === "shift_2" ? parsed : undefined
}
