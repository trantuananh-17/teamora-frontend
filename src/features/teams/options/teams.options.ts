import { queryOptions } from "@tanstack/react-query"

import { getTeams } from "../service/teams.service"

/**
 * `eventId` is the first scope segment of every key. Without it, switching
 * edition would show the previous one's rows out of the cache.
 */
export const teamsKeys = {
  all: () => ["teams"] as const,
  list: (eventId: string) => [...teamsKeys.all(), "list", eventId] as const,
}

export const teamsListOptions = (eventId: string) =>
  queryOptions({ queryKey: teamsKeys.list(eventId), queryFn: () => getTeams(eventId) })
