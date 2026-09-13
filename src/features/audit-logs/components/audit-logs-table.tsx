"use client"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { useAuditLogsSuspense } from "../hooks/audit-logs.hook"
import type { AuditLogsQuery } from "../service/audit-logs.service"
import { auditLogColumns } from "./columns"

export function AuditLogsTable({ eventId, query }: { eventId: string; query: AuditLogsQuery }) {
  const { data } = useAuditLogsSuspense(eventId, query)
  const hasFilters = Boolean(query.search || query.entity || query.action)

  return (
    <EntityDataTable
      columns={auditLogColumns}
      data={data.items}
      hasFilters={hasFilters}
      noResultsText="Không có thay đổi nào khớp bộ lọc."
      emptyView={<EntityEmptyView title="Chưa có nhật ký" message="Các thao tác có hậu quả trong kỳ sẽ xuất hiện tại đây." />}
    />
  )
}
