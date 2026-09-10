import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { eventDetailOptions, eventsListOptions } from "../options/events.options"

/**
 * `import "server-only"`, not `"use server"`. These are render-time helpers; the
 * directive would publish them as RPC endpoints.
 */
export async function prefetchEvents() {
  await getQueryClient().prefetchQuery(eventsListOptions())
}

export async function prefetchEvent(eventId: string) {
  await getQueryClient().prefetchQuery(eventDetailOptions(eventId))
}
