import { z } from "zod"

import { api } from "@/lib/ky"

/** `GET /v1/events/:eventId/gala/*` — shapes mirror `gala.service.ts` on the backend. */
export const galaSeatSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  seatNo: z.number(),
  status: z.enum(["available", "unavailable"]),
})
export type GalaSeat = z.infer<typeof galaSeatSchema>

export const galaTableSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  capacity: z.number(),
  gridCol: z.number(),
  gridRow: z.number(),
  active: z.boolean(),
  seats: z.array(galaSeatSchema),
})
export type GalaTable = z.infer<typeof galaTableSchema>

export const galaSessionStatuses = ["draft", "drawn", "in_progress", "completed"] as const
export const galaQueueStatuses = ["waiting", "active", "done", "skipped"] as const

// Timestamps stay ISO strings: the countdown subtracts them against `serverNow`
// on every poll, and a Date here would only be converted straight back.
export const galaSessionViewSchema = z.object({
  session: z
    .object({
      id: z.string(),
      status: z.enum(galaSessionStatuses),
      turnSeconds: z.number(),
      currentTeamId: z.string().nullable(),
      turnEndsAt: z.string().nullable(),
      drawSeed: z.number().nullable(),
    })
    .nullable(),
  queue: z.array(
    z.object({
      id: z.string(),
      teamId: z.string(),
      teamName: z.string(),
      position: z.number(),
      status: z.enum(galaQueueStatuses),
      memberCount: z.number(),
      seatCount: z.number(),
      leaderName: z.string().nullable(),
    }),
  ),
  me: z.object({
    teamId: z.string().nullable(),
    isTeamLeader: z.boolean(),
    organizer: z.boolean(),
  }),
  serverNow: z.string(),
})
export type GalaSessionView = z.infer<typeof galaSessionViewSchema>
export type GalaQueueRow = GalaSessionView["queue"][number]

/** Seat state is computed by the backend for the caller's team (`mine` vs `taken`). */
export const seatViewSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  tableName: z.string(),
  seatNo: z.number(),
  status: z.enum(["available", "taken", "mine", "unavailable"]),
  teamId: z.string().nullable(),
  teamName: z.string().nullable(),
  held: z.boolean(),
  assignmentId: z.string().nullable(),
})
export type SeatView = z.infer<typeof seatViewSchema>

const tablesListSchema = z.object({ items: z.array(galaTableSchema) })
const seatsListSchema = z.object({ items: z.array(seatViewSchema) })

export interface GalaTableInput {
  name: string
  capacity: number
  gridCol: number
  gridRow: number
}

export async function listGalaTables(eventId: string): Promise<GalaTable[]> {
  const response = await api.get(`events/${eventId}/gala/tables`)
  return tablesListSchema.parse(await response.json()).items
}

export async function createGalaTable(eventId: string, input: GalaTableInput): Promise<GalaTable> {
  const response = await api.post(`events/${eventId}/gala/tables`, { json: input })
  return galaTableSchema.parse(await response.json())
}

export async function updateGalaTable(
  eventId: string,
  tableId: string,
  input: Partial<GalaTableInput & { active: boolean }>,
): Promise<GalaTable> {
  const response = await api.patch(`events/${eventId}/gala/tables/${tableId}`, { json: input })
  return galaTableSchema.parse(await response.json())
}

export async function deleteGalaTable(eventId: string, tableId: string): Promise<void> {
  await api.delete(`events/${eventId}/gala/tables/${tableId}`)
}

export async function updateGalaSeat(
  eventId: string,
  seatId: string,
  status: GalaSeat["status"],
): Promise<GalaSeat> {
  const response = await api.patch(`events/${eventId}/gala/seats/${seatId}`, { json: { status } })
  return galaSeatSchema.parse(await response.json())
}

export async function getGalaSession(eventId: string): Promise<GalaSessionView> {
  const response = await api.get(`events/${eventId}/gala/session`)
  return galaSessionViewSchema.parse(await response.json())
}

export async function upsertGalaSession(
  eventId: string,
  turnSeconds: number,
): Promise<GalaSessionView> {
  const response = await api.put(`events/${eventId}/gala/session`, { json: { turnSeconds } })
  return galaSessionViewSchema.parse(await response.json())
}

export type GalaSessionAction = "draw" | "start" | "skip" | "complete"

export async function runGalaSessionAction(
  eventId: string,
  action: GalaSessionAction,
): Promise<GalaSessionView> {
  const response = await api.post(`events/${eventId}/gala/session/${action}`)
  return galaSessionViewSchema.parse(await response.json())
}

export async function listGalaSeats(eventId: string): Promise<SeatView[]> {
  const response = await api.get(`events/${eventId}/gala/seats`)
  return seatsListSchema.parse(await response.json()).items
}

/** `teamId` is required from an organiser and ignored from a team leader. */
export interface SeatSelectionInput {
  seatIds: string[]
  teamId?: string
}

export async function holdGalaSeats(
  eventId: string,
  input: SeatSelectionInput,
): Promise<SeatView[]> {
  const response = await api.post(`events/${eventId}/gala/seats/hold`, { json: input })
  return seatsListSchema.parse(await response.json()).items
}

export async function releaseGalaSeats(
  eventId: string,
  input: SeatSelectionInput,
): Promise<SeatView[]> {
  const response = await api.post(`events/${eventId}/gala/seats/release`, { json: input })
  return seatsListSchema.parse(await response.json()).items
}

export async function confirmGalaSeats(eventId: string, teamId?: string): Promise<GalaSessionView> {
  const response = await api.post(`events/${eventId}/gala/seats/confirm`, {
    json: teamId ? { teamId } : {},
  })
  return galaSessionViewSchema.parse(await response.json())
}

export async function deleteGalaAssignment(
  eventId: string,
  assignmentId: string,
  reason: string,
): Promise<void> {
  await api.delete(`events/${eventId}/gala/assignments/${assignmentId}`, { json: { reason } })
}

const teamLeaderSchema = z.object({
  teamId: z.string(),
  leader: z.object({ registrationId: z.string(), name: z.string(), email: z.string() }).nullable(),
})
export type TeamLeader = z.infer<typeof teamLeaderSchema>

export async function setTeamLeader(
  eventId: string,
  teamId: string,
  registrationId: string | null,
): Promise<TeamLeader> {
  const response = await api.patch(`events/${eventId}/teams/${teamId}/leader`, {
    json: { registrationId },
  })
  return teamLeaderSchema.parse(await response.json())
}
