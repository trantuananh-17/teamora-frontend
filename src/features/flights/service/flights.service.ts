import { z } from "zod"

import { api, apiUrl } from "@/lib/ky"

export const flightDirections = ["outbound", "return"] as const
export const flightShifts = ["shift_1", "shift_2"] as const
export const allocationFlags = [
  "team_split",
  "shift_unmet",
  "shift_locked_unmet",
  "unassigned",
  "over_capacity",
] as const

export type FlightDirection = (typeof flightDirections)[number]
export type FlightShift = (typeof flightShifts)[number]

export const flightSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  code: z.string(),
  direction: z.enum(flightDirections),
  departAt: z.coerce.date(),
  arriveAt: z.coerce.date(),
  fromAirport: z.string(),
  toAirport: z.string(),
  capacity: z.number(),
  shift: z.enum(flightShifts).nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  assignedCount: z.number(),
})

export type Flight = z.infer<typeof flightSchema>

const pageSchema = <T extends z.ZodType>(item: T) => z.object({
  items: z.array(item), total: z.number(), limit: z.number(), offset: z.number(),
})

export interface FlightFilters {
  search?: string
  direction?: FlightDirection
  shift?: FlightShift
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface FlightInput {
  code: string
  direction: FlightDirection
  departAt: string
  arriveAt: string
  fromAirport: string
  toAirport: string
  capacity: number
  shift: FlightShift | null
  note: string | null
}

export async function listFlights(
  eventId: string,
  filters: FlightFilters = {},
  pagination: PageParams = { page: 1, pageSize: 25 },
) {
  const response = await api.get(`events/${eventId}/flights`, {
    searchParams: {
      limit: pagination.pageSize,
      offset: (pagination.page - 1) * pagination.pageSize,
      ...filters,
    },
  })
  return pageSchema(flightSchema).parse(await response.json())
}

export async function createFlight(eventId: string, input: FlightInput) {
  const response = await api.post(`events/${eventId}/flights`, { json: input })
  return flightSchema.parse(await response.json())
}

const updateResultSchema = z.object({ flight: flightSchema, warnings: z.array(z.string()) })

export async function updateFlight(eventId: string, flightId: string, input: FlightInput) {
  const response = await api.patch(`events/${eventId}/flights/${flightId}`, { json: input })
  return updateResultSchema.parse(await response.json())
}

export async function deleteFlight(eventId: string, flightId: string) {
  await api.delete(`events/${eventId}/flights/${flightId}`)
}

const importResultSchema = z.object({
  fileName: z.string(), total: z.number(), created: z.number(), updated: z.number(),
})

export async function importFlights(eventId: string, file: File) {
  const body = new FormData()
  body.set("file", file)
  const response = await api.post(`events/${eventId}/flights/import`, { body })
  return importResultSchema.parse(await response.json())
}

export function flightExportUrl(eventId: string) {
  return apiUrl(`events/${eventId}/flights/export`)
}

const assignmentSchema = z.object({
  id: z.string(),
  flight: flightSchema.omit({ assignedCount: true }),
  source: z.enum(["auto", "manual"]),
  locked: z.boolean(),
  flags: z.array(z.enum(allocationFlags)),
  assignedAt: z.coerce.date(),
})

export const registrationFlightSchema = z.object({
  registrationId: z.string(),
  user: z.object({ name: z.string(), email: z.string() }),
  team: z.object({ id: z.string(), name: z.string() }),
  shiftPreference: z.enum(flightShifts).nullable(),
  shiftLocked: z.boolean(),
  assignments: z.object({
    outbound: assignmentSchema.nullable(),
    return: assignmentSchema.nullable(),
  }),
})

export type RegistrationFlight = z.infer<typeof registrationFlightSchema>

export async function listFlightAssignments(
  eventId: string,
  pagination: PageParams = { page: 1, pageSize: 25 },
) {
  const response = await api.get(`events/${eventId}/flights/assignments`, {
    searchParams: {
      limit: pagination.pageSize,
      offset: (pagination.page - 1) * pagination.pageSize,
    },
  })
  return pageSchema(registrationFlightSchema).parse(await response.json())
}

const allocationStatsSchema = z.object({
  assigned: z.number(), unassigned: z.number(), remainingSlots: z.number(),
  teamsSplit: z.number(), shiftUnmet: z.number(),
})

const allocationPlanSchema = z.object({
  assignments: z.array(z.object({
    registrationId: z.string(), flightId: z.string(),
    direction: z.enum(flightDirections), flags: z.array(z.enum(allocationFlags)),
  })),
  unassigned: z.array(z.object({
    registrationId: z.string(), direction: z.enum(flightDirections),
    reason: z.enum(["shift_locked_unmet", "unassigned"]),
  })),
})

export const allocationRunSchema = z.object({
  id: z.string(), eventId: z.string(), type: z.literal("flight"),
  status: z.enum(["preview", "committed", "discarded"]),
  params: z.record(z.string(), z.number()), stats: allocationStatsSchema,
  plan: allocationPlanSchema, createdBy: z.string(), createdAt: z.coerce.date(),
  committedAt: z.coerce.date().nullable(),
})

export type AllocationRun = z.infer<typeof allocationRunSchema>

export async function listAllocationRuns(eventId: string) {
  const response = await api.get(`events/${eventId}/allocations`, { searchParams: { type: "flight" } })
  return z.object({ items: z.array(allocationRunSchema) }).parse(await response.json()).items
}

export async function previewAllocation(eventId: string) {
  const response = await api.post(`events/${eventId}/allocations`, { json: { type: "flight" } })
  return allocationRunSchema.parse(await response.json())
}

export async function commitAllocation(eventId: string, runId: string) {
  const response = await api.post(`events/${eventId}/allocations/${runId}/commit`)
  return allocationRunSchema.parse(await response.json())
}

export async function discardAllocation(eventId: string, runId: string) {
  const response = await api.post(`events/${eventId}/allocations/${runId}/discard`)
  return allocationRunSchema.parse(await response.json())
}

const manualResultSchema = z.object({ updated: z.number(), warnings: z.array(z.string()) })

export async function manualAssignFlight(eventId: string, input: {
  registrationIds?: string[]; teamId?: string; flightId: string; reason: string
}) {
  const response = await api.post(`events/${eventId}/flights/assignments/manual`, { json: input })
  return manualResultSchema.parse(await response.json())
}

export async function setAssignmentLock(eventId: string, assignmentId: string, locked: boolean, reason: string) {
  const response = await api.patch(`events/${eventId}/flights/assignments/${assignmentId}/lock`, {
    json: { locked, reason },
  })
  return z.object({ id: z.string(), locked: z.boolean() }).passthrough().parse(await response.json())
}
