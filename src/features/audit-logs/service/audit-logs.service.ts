import { z } from "zod"

import { api, apiUrl } from "@/lib/ky"

export const auditLogSchema = z.object({
  id: z.string(),
  eventId: z.string().nullable(),
  actorId: z.string().nullable(),
  actorName: z.string().nullable(),
  actorEmail: z.string().nullable(),
  entity: z.string(),
  entityId: z.string(),
  action: z.string(),
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

const auditLogsPageSchema = z.object({
  items: z.array(auditLogSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  filters: z.object({ entities: z.array(z.string()), actions: z.array(z.string()) }),
})

export interface AuditLogsQuery {
  search?: string
  entity?: string
  action?: string
  limit?: number
  offset?: number
}

export async function getAuditLogs(eventId: string, query: AuditLogsQuery) {
  const response = await api.get(`events/${eventId}/audit-logs`, {
    searchParams: queryParams(query),
  })
  return auditLogsPageSchema.parse(await response.json())
}

export function auditLogsExportUrl(eventId: string, query: AuditLogsQuery) {
  const params = new URLSearchParams(
    queryParams({
      search: query.search,
      entity: query.entity,
      action: query.action,
    }),
  )
  const base = apiUrl(`events/${eventId}/audit-logs/export`)
  return params.size ? `${base}?${params}` : base
}

function queryParams(query: AuditLogsQuery): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query)
      .filter(
        (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== "",
      )
      .map(([key, value]) => [key, String(value)]),
  )
}
