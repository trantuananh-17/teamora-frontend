import { z } from "zod"

import { api } from "@/lib/ky"

/**
 * Types come from the zod schema, not from a hand-written interface — and every
 * response is parsed here at the boundary. If the backend changes shape, the
 * error names the field, instead of surfacing four components away as
 * "undefined is not an object".
 */
export const eventStatuses = [
  "registration_open",
  "registration_closed",
  "allocation_processing",
  "information_published",
  "event_started",
  "event_completed",
] as const

export type EventStatus = (typeof eventStatuses)[number]

export const eventSettingsSchema = z
  .object({
    terms: z.object({ version: z.string(), body: z.string() }).optional(),
    shifts: z.array(z.object({ key: z.string(), label: z.string() })).optional(),
  })
  .passthrough()

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: z.enum(eventStatuses),
  registrationOpenAt: z.coerce.date().nullable(),
  registrationCloseAt: z.coerce.date().nullable(),
  publishedAt: z.coerce.date().nullable(),
  settings: eventSettingsSchema,
  createdAt: z.coerce.date(),
})

export type Event = z.infer<typeof eventSchema>

const eventsPageSchema = z.object({
  items: z.array(eventSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type EventsPage = z.infer<typeof eventsPageSchema>

export async function getEvents(): Promise<EventsPage> {
  const response = await api.get("events", { searchParams: { limit: 100 } })
  return eventsPageSchema.parse(await response.json())
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await api.get(`events/${eventId}`)
  return eventSchema.parse(await response.json())
}

export async function getCurrentEvent(): Promise<Event | null> {
  const response = await api.get("events/current")
  return eventSchema.nullable().parse(await response.json())
}

export interface CreateEventInput {
  name: string
  code: string
  registrationOpenAt?: string | null
  registrationCloseAt?: string | null
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const response = await api.post("events", { json: input })
  return eventSchema.parse(await response.json())
}

/**
 * Forward and backward are two endpoints, not a flag: the backend puts reverting
 * behind `super_admin` and demands a reason. Sending a backwards status to
 * `advance` is refused there, so the caller has to mean it.
 */
export async function advanceEventStatus(eventId: string, status: EventStatus): Promise<Event> {
  const response = await api.post(`events/${eventId}/status/advance`, { json: { status } })
  return eventSchema.parse(await response.json())
}

export async function revertEventStatus(
  eventId: string,
  status: EventStatus,
  reason: string,
): Promise<Event> {
  const response = await api.post(`events/${eventId}/status/revert`, {
    json: { status, reason },
  })
  return eventSchema.parse(await response.json())
}
