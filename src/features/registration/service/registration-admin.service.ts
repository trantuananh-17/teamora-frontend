import { z } from "zod"
import { api } from "@/lib/ky"
import { apiUrl } from "@/lib/ky"
import { registrationSchema } from "./registration.service"

// Admin list registrations
export const registrationsPageSchema = z.object({
  items: z.array(registrationSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})
export type RegistrationsPage = z.infer<typeof registrationsPageSchema>

export interface ListRegistrationsParams {
  limit?: number
  offset?: number
  teamId?: string
  participating?: boolean
  shiftPreference?: "shift_1" | "shift_2"
  shiftLocked?: boolean
  search?: string
}

/**
 * BTC xem danh sách đăng ký (organizer only)
 */
export async function listRegistrations(
  eventId: string,
  params: ListRegistrationsParams = {},
): Promise<RegistrationsPage> {
  const searchParams = registrationSearchParams(params)
  const response = await api.get(`events/${eventId}/registrations`, { searchParams })
  return registrationsPageSchema.parse(await response.json())
}

export function registrationExportUrl(eventId: string, params: ListRegistrationsParams): string {
  const searchParams = registrationSearchParams(params)
  const query = searchParams.toString()
  return `${apiUrl(`events/${eventId}/registrations/export`)}${query ? `?${query}` : ""}`
}

function registrationSearchParams(params: ListRegistrationsParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit))
  if (params.offset !== undefined) searchParams.set("offset", String(params.offset))
  if (params.teamId) searchParams.set("teamId", params.teamId)
  if (params.participating !== undefined) {
    searchParams.set("participating", String(params.participating))
  }
  if (params.shiftPreference) searchParams.set("shiftPreference", params.shiftPreference)
  if (params.shiftLocked !== undefined) searchParams.set("shiftLocked", String(params.shiftLocked))
  if (params.search) searchParams.set("search", params.search)
  return searchParams
}

/**
 * BTC xem chi tiết một đăng ký (organizer only)
 */
export async function getRegistration(eventId: string, id: string) {
  const response = await api.get(`events/${eventId}/registrations/${id}`)
  return registrationSchema.parse(await response.json())
}

// Bulk set shift locked
export interface BulkSetShiftLockedInput {
  teamIds?: string[]
  participating?: boolean
  shiftPreference?: "shift_1" | "shift_2"
  shiftLocked: boolean
}

export async function bulkSetShiftLocked(
  eventId: string,
  input: BulkSetShiftLockedInput,
): Promise<{ updated: number }> {
  const response = await api.post(`events/${eventId}/registrations/bulk-set-shift-locked`, {
    json: input,
  })
  return z.object({ updated: z.number() }).parse(await response.json())
}

// Stats
export const registrationStatsSchema = z.object({
  total: z.number(),
  participating: z.number(),
  notParticipating: z.number(),
})
export type RegistrationStats = z.infer<typeof registrationStatsSchema>

export async function getRegistrationStats(eventId: string): Promise<RegistrationStats> {
  const response = await api.get(`events/${eventId}/registrations-stats`)
  return registrationStatsSchema.parse(await response.json())
}
