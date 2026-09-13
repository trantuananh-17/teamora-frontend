import { queryOptions } from "@tanstack/react-query"

import { getAuditLogs, type AuditLogsQuery } from "../service/audit-logs.service"

export const auditLogsKeys = {
  all: () => ["audit-logs"] as const,
  list: (eventId: string, query: AuditLogsQuery) =>
    [...auditLogsKeys.all(), "list", eventId, query] as const,
}

export const auditLogsListOptions = (eventId: string, query: AuditLogsQuery) =>
  queryOptions({
    queryKey: auditLogsKeys.list(eventId, query),
    queryFn: () => getAuditLogs(eventId, query),
  })
