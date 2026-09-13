"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

import { auditLogsListOptions } from "../options/audit-logs.options"
import type { AuditLogsQuery } from "../service/audit-logs.service"

export function useAuditLogsSuspense(eventId: string, query: AuditLogsQuery) {
  return useSuspenseQuery(auditLogsListOptions(eventId, query))
}
