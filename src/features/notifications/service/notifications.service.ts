import { z } from "zod"

import { api } from "@/lib/ky"
import { notificationStatuses } from "../constants"

export const notificationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  registrationId: z.string().nullable(),
  channel: z.enum(["email", "teams", "in_app"]),
  template: z.string(),
  payload: z.record(z.string(), z.unknown()),
  status: z.enum(notificationStatuses),
  attempts: z.number(),
  lastError: z.string().nullable(),
  scheduledAt: z.coerce.date(),
  sentAt: z.coerce.date().nullable(),
  recipient: z.object({ name: z.string(), email: z.string() }).nullable(),
})

export type Notification = z.infer<typeof notificationSchema>
export type NotificationStatus = Notification["status"]

const notificationsPageSchema = z.object({
  items: z.array(notificationSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export interface NotificationsQuery {
  status?: NotificationStatus
  limit?: number
  offset?: number
}

export async function getNotifications(eventId: string, query: NotificationsQuery) {
  const response = await api.get(`events/${eventId}/notifications`, {
    searchParams: {
      ...(query.status ? { status: query.status } : {}),
      limit: String(query.limit ?? 100),
      offset: String(query.offset ?? 0),
    },
  })
  return notificationsPageSchema.parse(await response.json())
}

const retryResultSchema = z.object({ id: z.string(), status: z.literal("pending") })

export async function retryNotification(eventId: string, id: string) {
  const response = await api.post(`events/${eventId}/notifications/${id}/retry`)
  return retryResultSchema.parse(await response.json())
}
