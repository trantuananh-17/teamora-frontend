import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityUrlPagination } from "@/components/entity-components"
import { AuditLogsContainer, AuditLogsError, AuditLogsLoading, AuditLogsTable, AuditLogsToolbar } from "@/features/audit-logs/components"
import { auditLogsParamsLoader } from "@/features/audit-logs/server/params-loader"
import { prefetchAuditLogs } from "@/features/audit-logs/server/prefetch"
import { auditLogsExportUrl, type AuditLogsQuery } from "@/features/audit-logs/service/audit-logs.service"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

type SearchParams = Record<string, string | string[] | undefined>

export default async function AuditLogsPage({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<SearchParams> }) {
  await requireOrganizer()
  const [{ eventId }, loaded] = await Promise.all([params, auditLogsParamsLoader(searchParams)])
  const page = Number.isInteger(loaded.page) && loaded.page > 0 ? loaded.page : 1
  const pageSize = [10, 25, 50, 100].includes(loaded.pageSize) ? loaded.pageSize : 25
  const query: AuditLogsQuery = {
    search: loaded.search ?? undefined,
    entity: loaded.entity ?? undefined,
    action: loaded.action ?? undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
  const result = await prefetchAuditLogs(eventId, query)

  return (
    <AuditLogsContainer
      exportUrl={auditLogsExportUrl(eventId, query)}
      toolbar={<AuditLogsToolbar query={query} filters={result.filters} />}
      pagination={<EntityUrlPagination total={result.total} page={page} pageSize={pageSize} />}
    >
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<AuditLogsError />}>
          <Suspense fallback={<AuditLogsLoading />}>
            <AuditLogsTable eventId={eventId} query={query} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </AuditLogsContainer>
  )
}
