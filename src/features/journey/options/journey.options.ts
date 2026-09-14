import { queryOptions } from "@tanstack/react-query"
import { getDashboard, listAnnouncements, listSchedule } from "../service/journey.service"

export const journeyKeys = { event: (id: string) => ["journey", id] as const }
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
