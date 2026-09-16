import { queryOptions } from "@tanstack/react-query"
import {
  getDashboard,
  getJourney,
  listAnnouncements,
  listSchedule,
} from "../service/journey.service"

export const journeyKeys = { event: (id: string) => ["journey", id] as const }
/** `GET /v1/me/journey` — the one query every employee tab reads (S7-SPEC §B1). */
export const journeyOptions = (eventId: string) =>
  queryOptions({
    queryKey: [...journeyKeys.event(eventId), "me"],
    queryFn: () => getJourney(eventId),
  })
export const dashboardOptions = (id: string) =>
  queryOptions({
    queryKey: [...journeyKeys.event(id), "dashboard"],
    queryFn: () => getDashboard(id),
  })
export const contentOptions = (id: string) =>
  queryOptions({
    queryKey: [...journeyKeys.event(id), "content"],
    queryFn: async () => {
      const [schedule, announcements] = await Promise.all([listSchedule(id), listAnnouncements(id)])
      return { schedule, announcements }
    },
  })
