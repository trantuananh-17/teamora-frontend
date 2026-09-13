import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { auditLogsListOptions } from "../options/audit-logs.options"
import type { AuditLogsQuery } from "../service/audit-logs.service"

export function prefetchAuditLogs(eventId: string, query: AuditLogsQuery) {
  return getQueryClient().fetchQuery(auditLogsListOptions(eventId, query))
}
