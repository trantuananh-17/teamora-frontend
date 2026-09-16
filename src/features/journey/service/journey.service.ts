import { z } from "zod"
import { api } from "@/lib/ky"
import { eventSchema } from "@/features/events/service/events.service"

const date = z.coerce.date()
export const scheduleItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  day: z.number(),
  startAt: date,
  endAt: date,
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: date,
  updatedAt: date,
})
export const announcementSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  body: z.string(),
  audience: z.enum(["all", "participants", "organizers"]),
  publishedAt: date.nullable(),
  createdAt: date,
  updatedAt: date,
})

const flightSchema = z.object({
  assignment: z.object({ direction: z.enum(["outbound", "return"]) }).passthrough(),
  flight: z
    .object({
      id: z.string(),
      code: z.string(),
      direction: z.enum(["outbound", "return"]),
      departAt: date,
      arriveAt: date,
      fromAirport: z.string(),
      toAirport: z.string(),
      shift: z.string().nullable(),
    })
    .passthrough(),
})
const vehicleSchema = z.object({
  assignment: z.object({ leg: z.string() }).passthrough(),
  vehicle: z
    .object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      leg: z.string(),
      gatherAt: date,
      departAt: date,
      destination: z.string(),
      leaderName: z.string().nullable(),
      leaderPhone: z.string().nullable(),
    })
    .passthrough(),
  pickupPoint: z
    .object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      address: z.string().nullable(),
    })
    .nullable(),
})
const accommodationSchema = z
  .object({
    room: z.object({ id: z.string(), code: z.string(), capacity: z.number() }).passthrough(),
    roomType: z.object({ id: z.string(), name: z.string() }).passthrough(),
    hotel: z.object({ id: z.string(), name: z.string(), address: z.string() }).passthrough(),
  })
  .passthrough()

export const journeySchema = z.object({
  event: eventSchema,
  participant: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    employeeCode: z.string().nullable(),
    phone: z.string().nullable(),
    team: z.object({ id: z.string(), name: z.string() }),
    participating: z.boolean(),
  }),
  flights: z.array(flightSchema),
  vehicles: z.array(vehicleSchema),
  accommodation: accommodationSchema.nullable(),
  /** Names of the others in the same room, empty when alone or unassigned. */
  roommates: z.array(z.string()).default([]),
  /** Null until the team confirmed its seats (S7 §8). */
  gala: z
    .object({ seats: z.array(z.object({ tableName: z.string(), seatNo: z.number() })) })
    .nullable(),
  schedule: z.array(scheduleItemSchema),
  announcements: z.array(announcementSchema),
})
export type Journey = z.infer<typeof journeySchema>
export type ScheduleItem = z.infer<typeof scheduleItemSchema>
export type Announcement = z.infer<typeof announcementSchema>

const capacityItem = z
  .object({ id: z.string(), code: z.string(), capacity: z.number(), assigned: z.number() })
  .passthrough()
export const dashboardSchema = z.object({
  people: z.object({
    totalEmployees: z.number(),
    registered: z.number(),
    unregistered: z.number(),
    participating: z.number(),
    declined: z.number(),
    shift1: z.number(),
    shift2: z.number(),
  }),
  transportNeeds: z.record(z.string(), z.number()),
  capacity: z.object({
    flights: z.array(capacityItem),
    vehicles: z.array(capacityItem),
    rooms: z.array(capacityItem.extend({ hotel: z.string() })),
  }),
  unassigned: z.object({ outboundFlight: z.number(), returnFlight: z.number(), room: z.number() }),
})
export type Dashboard = z.infer<typeof dashboardSchema>

export async function getJourney(eventId: string) {
  const response = await api.get("me/journey", { searchParams: { eventId } })
  return journeySchema.parse(await response.json())
}
export async function getDashboard(eventId: string) {
  const response = await api.get(`events/${eventId}/dashboard`)
  return dashboardSchema.parse(await response.json())
}
export async function listSchedule(eventId: string) {
  const response = await api.get(`events/${eventId}/schedule`)
  return z.array(scheduleItemSchema).parse(await response.json())
}
export async function listAnnouncements(eventId: string) {
  const response = await api.get(`events/${eventId}/announcements`)
  return z.array(announcementSchema).parse(await response.json())
}

export type ScheduleInput = {
  day: number
  startAt: string
  endAt: string
  title: string
  description?: string | null
  location?: string | null
  sortOrder?: number
}
export type AnnouncementInput = {
  title: string
  body: string
  audience: "all" | "participants" | "organizers"
  published: boolean
}
export async function createSchedule(eventId: string, input: ScheduleInput) {
  const response = await api.post(`events/${eventId}/schedule`, { json: input })
  return scheduleItemSchema.parse(await response.json())
}
export async function updateSchedule(eventId: string, id: string, input: Partial<ScheduleInput>) {
  const response = await api.patch(`events/${eventId}/schedule/${id}`, { json: input })
  return scheduleItemSchema.parse(await response.json())
}
export async function deleteSchedule(eventId: string, id: string) {
  await api.delete(`events/${eventId}/schedule/${id}`)
}
export async function createAnnouncement(eventId: string, input: AnnouncementInput) {
  const response = await api.post(`events/${eventId}/announcements`, { json: input })
  return announcementSchema.parse(await response.json())
}
export async function updateAnnouncement(
  eventId: string,
  id: string,
  input: Partial<AnnouncementInput>,
) {
  const response = await api.patch(`events/${eventId}/announcements/${id}`, { json: input })
  return announcementSchema.parse(await response.json())
}
export async function deleteAnnouncement(eventId: string, id: string) {
  await api.delete(`events/${eventId}/announcements/${id}`)
}
