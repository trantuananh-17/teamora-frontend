import { queryOptions } from "@tanstack/react-query"

import { getGalaSession, listGalaSeats, listGalaTables } from "../service/gala.service"

export const galaKeys = {
  event: (eventId: string) => ["gala", eventId] as const,
  tables: (eventId: string) => [...galaKeys.event(eventId), "tables"] as const,
  session: (eventId: string) => [...galaKeys.event(eventId), "session"] as const,
  seats: (eventId: string) => [...galaKeys.event(eventId), "seats"] as const,
}

export const galaTablesOptions = (eventId: string) =>
  queryOptions({ queryKey: galaKeys.tables(eventId), queryFn: () => listGalaTables(eventId) })

/**
 * Polls only while a turn can change without anyone on this screen acting:
 * `settle()` on the backend skips a team whose timer ran out on the next request.
 */
export const galaSessionOptions = (eventId: string) =>
  queryOptions({
    queryKey: galaKeys.session(eventId),
    queryFn: () => getGalaSession(eventId),
    refetchInterval: (query) =>
      query.state.data?.session?.status === "in_progress" ? 2000 : false,
  })

export const galaSeatsOptions = (eventId: string) =>
  queryOptions({ queryKey: galaKeys.seats(eventId), queryFn: () => listGalaSeats(eventId) })
