import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityUrlPagination } from "@/components/entity-components"
import {
  NotificationsContainer,
  NotificationsError,
  NotificationsLoading,
  NotificationsTable,
  NotificationsToolbar,
} from "@/features/notifications/components"
import { notificationsParamsLoader } from "@/features/notifications/server/params-loader"
import { prefetchNotifications } from "@/features/notifications/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

type SearchParams = Record<string, string | string[] | undefined>

export default async function NotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<SearchParams>
}) {
  await requireOrganizer()
  const [{ eventId }, loaded] = await Promise.all([params, notificationsParamsLoader(searchParams)])
  const page = Number.isInteger(loaded.page) && loaded.page > 0 ? loaded.page : 1
  const pageSize = [10, 25, 50, 100].includes(loaded.pageSize) ? loaded.pageSize : 25
  const query = {
    status: loaded.status ?? undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
  const notifications = await prefetchNotifications(eventId, query)

  return (
    <NotificationsContainer
      toolbar={<NotificationsToolbar status={query.status} />}
      pagination={
        <EntityUrlPagination total={notifications.total} page={page} pageSize={pageSize} />
      }
    >
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<NotificationsError />}>
          <Suspense fallback={<NotificationsLoading />}>
            <NotificationsTable eventId={eventId} query={query} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </NotificationsContainer>
  )
}
