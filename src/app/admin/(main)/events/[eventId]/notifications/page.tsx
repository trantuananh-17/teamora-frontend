import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

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
  const query = { status: loaded.status ?? undefined, limit: 100, offset: 0 }
  await prefetchNotifications(eventId, query)

  return (
    <NotificationsContainer toolbar={<NotificationsToolbar status={query.status} />}>
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
