import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { galaSeatsOptions, galaSessionOptions, galaTablesOptions } from "../options/gala.options"

export async function prefetchGalaTables(eventId: string) {
  await getQueryClient().prefetchQuery(galaTablesOptions(eventId))
}

/** Session + seats: the two queries every live gala screen reads. */
export async function prefetchGalaSession(eventId: string) {
  const client = getQueryClient()
  await Promise.all([
    client.prefetchQuery(galaSessionOptions(eventId)),
    client.prefetchQuery(galaSeatsOptions(eventId)),
  ])
}
